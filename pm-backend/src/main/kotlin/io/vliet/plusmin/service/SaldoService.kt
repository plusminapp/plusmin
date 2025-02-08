package io.vliet.plusmin.service

import io.vliet.plusmin.controller.SaldoController
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.PeriodeRepository
import io.vliet.plusmin.repository.SaldoRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class SaldoService {
    @Autowired
    lateinit var saldoRepository: SaldoRepository

    @Autowired
    lateinit var periodeRepository: PeriodeRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun getStandOpDatum(periode: Periode, datum: LocalDate): SaldoController.StandDTO {
        val openingsSaldi = getOpeningSaldi(periode)
        val mutatieLijst = berekenMutatieLijstOpDatum(periode.gebruiker, datum)
        val balansSaldiOpDatum = berekenSaldiOpDatum(openingsSaldi, mutatieLijst)

        val openingsBalans =
            openingsSaldi
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val mutatiesOpDatum =
            mutatieLijst
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val balansOpDatum =
            balansSaldiOpDatum
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val resultaatOpDatum =
            mutatieLijst
                .filter { it.rekening.rekeningSoort in resultaatRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toResultaatDTO() }
        return SaldoController.StandDTO(
            periodeStartDatum = periode.periodeStartDatum,
            peilDatum = datum,
            openingsBalans = openingsBalans,
            mutatiesOpDatum = mutatiesOpDatum,
            balansOpDatum = balansOpDatum,
            resultaatOpDatum = resultaatOpDatum,
        )
    }

    fun getOpeningSaldi(periode: Periode): List<Saldo> {
        return saldoRepository.findAllByPeriode(periode)
    }

    fun berekenMutatieLijstOpDatum(gebruiker: Gebruiker, datum: LocalDate): List<Saldo> {
        val rekeningenLijst = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        logger.info("rekeningen: ${rekeningenLijst.joinToString(", ") { it.naam }}")
        val periode = berekenPeriode(gebruiker.periodeDag, datum)
        val betalingen = betalingRepository.findAllByGebruikerTussenDatums(gebruiker, periode.first, datum)
        val saldoLijst = rekeningenLijst.map { rekening ->
            val mutatie =
                betalingen.fold(BigDecimal(0)) { acc, betaling -> acc + this.berekenMutaties(betaling, rekening) }
            Saldo(0, rekening, mutatie)
        }
        return saldoLijst
    }

    fun berekenMutaties(betaling: Betaling, rekening: Rekening): BigDecimal {
        return if (betaling.bron.id == rekening.id) -betaling.bedrag else BigDecimal(0) +
                if (betaling.bestemming.id == rekening.id) betaling.bedrag else BigDecimal(0)
    }

    fun berekenSaldiOpDatum(openingsSaldi: List<Saldo>, mutatieLijst: List<Saldo>): List<Saldo> {
        val saldoLijst = openingsSaldi.map { saldo: Saldo ->
            val mutatie: BigDecimal? = mutatieLijst.find { it.rekening.naam == saldo.rekening.naam }?.bedrag
            saldo.fullCopy(
                bedrag = saldo.bedrag + (mutatie ?: BigDecimal(0))
            )
        }
        return saldoLijst
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

//    fun upsert(gebruiker: Gebruiker, datum: LocalDate, saldiDTO: List<Saldo.SaldoDTO>): PeriodeDTO {
//        val periodeOpt = periodeRepository.getPeriodeGebruikerEnDatum(gebruiker.id, datum)
//        val periode = if (periodeOpt.isPresent) {
//            logger.info("Saldi wordt overschreven: ${periodeOpt.get().periodeStartDatum} met id ${periodeOpt.get().id} voor ${gebruiker.bijnaam}")
//            periodeRepository.save(
//                periodeOpt.get().fullCopy(saldoLijst = merge(gebruiker, periodeOpt.get(), saldiDTO))
//            )
//        } else {
//            val nieuweSaldoLijst = saldiDTO.map { dto2Saldo(gebruiker, it) }
//            val nieuwePeriode = Periode(
//                gebruiker = gebruiker,
//                periodeStartDatum = datum,
//                saldoLijst = nieuweSaldoLijst
//            )
//            nieuweSaldoLijst.forEach { it.periode = nieuwePeriode }
//            periodeRepository.save(nieuwePeriode)
//        }
//        logger.info("Opslaan saldi ${periode.periodeStartDatum} voor ${gebruiker.bijnaam}")
//        return periode.toDTO()
//    }

    fun merge(gebruiker: Gebruiker, periode: Periode, saldoDTOs: List<Saldo.SaldoDTO>): List<Saldo> {
        val saldiBijPeriode = saldoRepository.findAllByPeriode(periode)
        val bestaandeSaldoMap: MutableMap<String, Saldo> =
            saldiBijPeriode.associateBy { it.rekening.naam }.toMutableMap()
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

    fun dto2Saldo(gebruiker: Gebruiker, saldoDTO: Saldo.SaldoDTO, periode: Periode): Saldo {
        val rekeningOpt = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, saldoDTO.rekeningNaam)
        if (rekeningOpt.isEmpty) {
            logger.error("Ophalen niet bestaande rekening ${saldoDTO.rekeningNaam} voor ${gebruiker.bijnaam}.")
            throw throw IllegalArgumentException("Rekening ${saldoDTO.rekeningNaam} bestaat niet voor ${gebruiker.bijnaam}")
        }
        val rekening = rekeningOpt.get()
        val saldoOpt = saldoRepository.findOneByPeriodeAndRekening(periode, rekening)
        val bedrag = saldoDTO.bedrag
        return if (saldoOpt.isEmpty) {
            Saldo(0, rekening, bedrag, periode)
        } else {
            saldoOpt.get().fullCopy(bedrag = bedrag)
        }
    }

    fun creeerPeriodes(periode: Periode, startDatum: LocalDate) {
        periodeRepository.save(periode.fullCopy(periodeStatus = Periode.PeriodeStatus.OPEN))
        val mutatieLijst =
            berekenMutatieLijstOpDatum(periode.gebruiker, periode.periodeEindDatum)
        val periodeSaldi = saldoRepository.findAllByPeriode(periode)

        val nieuwePeriode = periodeRepository.save(Periode(
            gebruiker = periode.gebruiker,
            periodeStartDatum = periode.periodeEindDatum.plusDays(1),
            periodeEindDatum = periode.periodeEindDatum.plusMonths(1),
            periodeStatus = Periode.PeriodeStatus.HUIDIG
        ))
        berekenSaldiOpDatum(periodeSaldi, mutatieLijst).map {
            saldoRepository.save(Saldo(
                rekening = it.rekening,
                bedrag = it.bedrag,
                periode = nieuwePeriode
            ))
        }
        if (nieuwePeriode.periodeStartDatum < startDatum) {
            creeerPeriodes(nieuwePeriode, startDatum)
        }
    }

}
