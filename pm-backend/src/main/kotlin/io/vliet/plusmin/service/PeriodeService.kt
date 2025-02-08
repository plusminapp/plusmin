package io.vliet.plusmin.service

import io.vliet.plusmin.controller.PeriodeController
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Periode.PeriodeDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.PeriodeRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class PeriodeService {
    @Autowired
    lateinit var periodeRepository: PeriodeRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun getStandOpDatum(gebruiker: Gebruiker, datum: LocalDate): PeriodeController.StandDTO {
        checkPeriodeVoorGebruiker(gebruiker)
        val periodeOpening = getLaatstePeriode(gebruiker)
        val mutatieLijst = getMutatieLijstOpDatum(gebruiker, datum)
        val balansSaldiOpDatum = getSaldiOpDatum(periodeOpening, mutatieLijst)

        val openingsBalans =
            periodeOpening.saldoLijst
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val mutatiesOpDatum =
            mutatieLijst.saldoLijst
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val balansOpDatum =
            balansSaldiOpDatum.saldoLijst
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val resultaatOpDatum =
            mutatieLijst.saldoLijst
                .filter { it.rekening.rekeningSoort in resultaatRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toResultaatDTO() }
        return PeriodeController.StandDTO(
            openingsBalans = PeriodeDTO(
                periodeStartDatum = periodeOpening.periodeStartDatum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldoLijst = openingsBalans
            ),
            mutatiesOpDatum = PeriodeDTO(
                periodeStartDatum = datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldoLijst = mutatiesOpDatum
            ),
            balansOpDatum = PeriodeDTO(
                periodeStartDatum = datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldoLijst = balansOpDatum
            ),
            resultaatOpDatum = PeriodeDTO(
                periodeStartDatum = datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldoLijst = resultaatOpDatum
            )
        )
    }

    fun getLaatstePeriode(gebruiker: Gebruiker): Periode {
        val openingsSaldiOpt = periodeRepository.getLaatstePeriodeVoorGebruiker(gebruiker.id)
        return if (openingsSaldiOpt.isEmpty) creeerEerstePeriode(gebruiker) else openingsSaldiOpt.get()
    }

    fun getMutatieLijstOpDatum(gebruiker: Gebruiker, datum: LocalDate): Periode {
        val rekeningenLijst = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        logger.info("rekeningen: ${rekeningenLijst.joinToString(", ") { it.naam }}")
        val periode = berekenPeriode(gebruiker.periodeDag, datum)
        val betalingen = betalingRepository.findAllByGebruikerTussenDatums(gebruiker, periode.first, datum)
        val saldoLijst = rekeningenLijst.map { rekening ->
            val mutatie =
                betalingen.fold(BigDecimal(0)) { acc, betaling -> acc + this.berekenMutaties(betaling, rekening) }
            Saldo(0, rekening, mutatie)
        }
        return Periode(0, gebruiker, datum, saldoLijst = saldoLijst)
    }

    fun berekenMutaties(betaling: Betaling, rekening: Rekening): BigDecimal {
        return if (betaling.bron.id == rekening.id) -betaling.bedrag else BigDecimal(0) +
                if (betaling.bestemming.id == rekening.id) betaling.bedrag else BigDecimal(0)
    }

    fun getSaldiOpDatum(openingsSaldi: Periode, mutatieLijst: Periode): Periode {
        val saldoLijst = openingsSaldi.saldoLijst.map { saldo: Saldo ->
            val mutatie: BigDecimal? = mutatieLijst.saldoLijst.find { it.rekening.naam == saldo.rekening.naam }?.bedrag
            saldo.fullCopy(
                bedrag = saldo.bedrag + (mutatie ?: BigDecimal(0))
            )
        }
        return mutatieLijst.fullCopy(saldoLijst = saldoLijst)
    }

    fun berekenPeriode(dag: Int, datum: LocalDate): Pair<LocalDate, LocalDate> {
        val jaar = datum.year
        val maand = datum.monthValue
        val dagInMaand = datum.dayOfMonth

        val startDatum: LocalDate = if (dagInMaand >= dag) {
            LocalDate.of(jaar, maand, dag)
        } else {
            LocalDate.of(jaar, maand, dag).minusMonths(1)
        }
        return Pair(startDatum, startDatum.plusMonths(1).minusDays(1))
    }

    fun checkPeriodeVoorGebruiker(gebruiker: Gebruiker) {
        val laatstePeriode = getLaatstePeriode(gebruiker)
        // TODO implement
        if (laatstePeriode.periodeStartDatum.dayOfMonth != gebruiker.periodeDag) {
            logger.error("Periode verschuiving nog niet geïmplemteerd")
            throw NotImplementedError("Periode verschuiving nog niet geïmplemteerd")
        }
        val huidigePeriodeStartDatum = berekenPeriode(gebruiker.periodeDag, LocalDate.now()).first
        if (huidigePeriodeStartDatum > laatstePeriode.periodeStartDatum) {
            creeerPeriodes(laatstePeriode, huidigePeriodeStartDatum)
        }
    }

    fun creeerEerstePeriode(gebruiker: Gebruiker): Periode {
        val periodeStartDatum = berekenPeriode(gebruiker.periodeDag, LocalDate.now()).first
        val rekeningen = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        val saldoLijst = rekeningen.map { Saldo(0, it, BigDecimal(0)) }
        logger.info("NulSaldi gecreëerd voor $gebruiker op ${periodeStartDatum}: ${saldoLijst.map { it.rekening.naam }}")
        return periodeRepository.save(Periode(0, gebruiker, periodeStartDatum, saldoLijst = saldoLijst))
    }

    fun creeerPeriodes(periode: Periode, startDatum: LocalDate) {
        val mutatieLijst =
            getMutatieLijstOpDatum(periode.gebruiker, periode.periodeStartDatum.plusMonths(1).minusDays(1))
        val nieuweSaldoLijst = getSaldiOpDatum(periode, mutatieLijst).saldoLijst.map {
            Saldo(
                rekening = it.rekening,
                bedrag = it.bedrag
            )
        }
        val nieuwePeriode = Periode(
            gebruiker = periode.gebruiker,
            periodeStartDatum = periode.periodeStartDatum.plusMonths(1),
            saldoLijst = nieuweSaldoLijst
        )
        nieuweSaldoLijst.forEach { it.periode = nieuwePeriode }
        periodeRepository.save(nieuwePeriode)
        periodeRepository.save(periode.fullCopy(periodeStatus = Periode.PeriodeStatus.OPEN))
        if (nieuwePeriode.periodeStartDatum < startDatum) {
            creeerPeriodes(nieuwePeriode, startDatum)
        }
    }

    fun upsert(gebruiker: Gebruiker, periodeDTO: PeriodeDTO): PeriodeDTO {
        val datum = LocalDate.parse(periodeDTO.periodeStartDatum, DateTimeFormatter.ISO_LOCAL_DATE)
        val periodeOpt = periodeRepository.findPeriodeGebruikerEnDatum(gebruiker, datum)
        val periode = if (periodeOpt.isPresent) {
            logger.info("Saldi wordt overschreven: ${periodeOpt.get().periodeStartDatum} met id ${periodeOpt.get().id} voor ${gebruiker.bijnaam}")
            periodeRepository.save(
                periodeOpt.get().fullCopy(saldoLijst = merge(gebruiker, periodeOpt.get(), periodeDTO.saldoLijst))
            )
        } else {
            val nieuweSaldoLijst = periodeDTO.saldoLijst.map { dto2Saldo(gebruiker, it) }
            val nieuwePeriode = Periode(
                gebruiker = gebruiker,
                periodeStartDatum = datum,
                saldoLijst = nieuweSaldoLijst
            )
            nieuweSaldoLijst.forEach { it.periode = nieuwePeriode }
            periodeRepository.save(nieuwePeriode)
        }
        logger.info("Opslaan saldi ${periode.periodeStartDatum} voor ${gebruiker.bijnaam}")
        return periode.toDTO()
    }

    fun merge(gebruiker: Gebruiker, periode: Periode, saldoDTOs: List<Saldo.SaldoDTO>): List<Saldo> {
        val bestaandeSaldoMap: MutableMap<String, Saldo> =
            periode.saldoLijst.associateBy { it.rekening.naam }.toMutableMap()
        val nieuweSaldoList = saldoDTOs.map { saldoDTO ->
            val bestaandeSaldo = bestaandeSaldoMap[saldoDTO.rekeningNaam]
            if (bestaandeSaldo == null) {
                dto2Saldo(gebruiker, saldoDTO, periode)
            } else {
                bestaandeSaldoMap.remove(saldoDTO.rekeningNaam)
                bestaandeSaldo.fullCopy(bedrag = saldoDTO.bedrag)
            }
        }
        return bestaandeSaldoMap.values.toList() + nieuweSaldoList
    }

    fun dto2Saldo(gebruiker: Gebruiker, saldoDTO: Saldo.SaldoDTO, periode: Periode? = null): Saldo {
        val rekening = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, saldoDTO.rekeningNaam)
        if (rekening.isEmpty) {
            logger.error("Ophalen niet bestaande rekening ${saldoDTO.rekeningNaam} voor ${gebruiker.bijnaam}.")
            throw throw IllegalArgumentException("Rekening ${saldoDTO.rekeningNaam} bestaat niet voor ${gebruiker.bijnaam}")
        }
        val bedrag = saldoDTO.bedrag
        return if (periode == null) {
            Saldo(0, rekening.get(), bedrag)
        } else {
            val saldo = periode.saldoLijst.filter { it.rekening.naam == rekening.get().naam }
            if (saldo.isEmpty()) {
                logger.info("saldi: ${periode.id} heeft geen saldo voor ${rekening.get().naam}; wordt met bedrag ${saldoDTO.bedrag} aangemaakt.")
                Saldo(0, rekening.get(), saldoDTO.bedrag, periode)
            } else {
                saldo[0].fullCopy(bedrag = bedrag)
            }
        }
    }
}