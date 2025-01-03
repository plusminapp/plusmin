package io.vliet.plusmin.service

import io.vliet.plusmin.controller.SaldiController
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Saldi.SaldiDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.SaldiRepository
import io.vliet.plusmin.repository.SaldoRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class SaldiService {
    @Autowired
    lateinit var saldiRepository: SaldiRepository

    @Autowired
    lateinit var saldoRepository: SaldoRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun getStandOpDatum(gebruiker: Gebruiker, datum: LocalDate): SaldiController.StandDTO {
        val openingSaldi = getOpeningSaldi(gebruiker)
        val mutatieLijst = getMutatieLijstOpDatum(gebruiker, datum)
        val balansSaldiOpDatum = getBalansSaldiOpDatum(openingSaldi, mutatieLijst)
        val resultaatSaldiOpDatum = getBalansSaldiOpDatum(openingSaldi, mutatieLijst)

        val openingsBalans =
            openingSaldi.saldi
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val mutatiesOpDatum =
            mutatieLijst.saldi
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val balansOpDatum =
            balansSaldiOpDatum.saldi
                .filter { it.rekening.rekeningSoort in balansRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toDTO() }
        val resultaatOpDatum =
            mutatieLijst.saldi
                .filter { it.rekening.rekeningSoort in resultaatRekeningSoort }
                .sortedBy { it.rekening.sortOrder }
                .map { it.toResultaatDTO() }
        return SaldiController.StandDTO(
            openingsBalans = SaldiDTO(
                datum = openingSaldi.datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldi = openingsBalans
            ),
            mutatiesOpDatum = SaldiDTO(
                datum = datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldi = mutatiesOpDatum
            ),
            balansOpDatum = SaldiDTO(
                datum = datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldi = balansOpDatum
            ),
            resultaatOpDatum = SaldiDTO(
                datum = datum.format(DateTimeFormatter.ISO_LOCAL_DATE),
                saldi = resultaatOpDatum
            )
        )
    }

    fun getOpeningSaldi(gebruiker: Gebruiker): Saldi {
        val openingsSaldiOpt = saldiRepository.getLaatsteSaldiVoorGebruiker(gebruiker.id)
        return if (openingsSaldiOpt.isEmpty)
            this.creeerNulSaldi(gebruiker)
        else openingsSaldiOpt.get()
    }

    fun getMutatieLijstOpDatum(gebruiker: Gebruiker, datum: LocalDate): Saldi {
        val rekeningenLijst = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        logger.info("rekeningen: ${rekeningenLijst.map{it.naam}.joinToString(", ")}")
        val betalingen = betalingRepository.findAllByGebruikerOpDatum(gebruiker, datum)
        val saldoLijst = rekeningenLijst.map { rekening ->
            val mutatie =
                betalingen.fold(BigDecimal(0)) { acc, betaling -> acc + this.berekenMutaties(betaling, rekening) }
            Saldo(0, rekening, mutatie)
        }
        return Saldi(0, gebruiker, datum, saldoLijst)
    }

    fun berekenMutaties(
        betaling: Betaling,
        rekening: Rekening
    ): BigDecimal {
        return if (betaling.bron.id == rekening.id) -betaling.bedrag else BigDecimal(0) +
                if (betaling.bestemming.id == rekening.id) betaling.bedrag else BigDecimal(0)
    }

    fun getBalansSaldiOpDatum(openingsSaldi: Saldi, mutatieLijst: Saldi): Saldi {
        val saldi = openingsSaldi.saldi.map { saldo: Saldo ->
            val mutatie: BigDecimal? = mutatieLijst.saldi.find { it.rekening.naam == saldo.rekening.naam }?.bedrag
            saldo.fullCopy(
                bedrag = saldo.bedrag + (mutatie ?: BigDecimal(0))
            )
        }
        return mutatieLijst.fullCopy(saldi = saldi)
    }

    fun creeerNulSaldi(gebruiker: Gebruiker): Saldi {
        val eersteBetalingsDatum = betalingRepository
            .findAllByGebruiker(gebruiker)
            .sortedBy { it.boekingsdatum }
            .getOrNull(0)?.boekingsdatum ?: LocalDate.now()
        val rekeningen = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        val saldoLijst = rekeningen.map { Saldo(0, it, BigDecimal(0)) }
        logger.info("NulSaldi gecreeerd voor ${gebruiker} op ${eersteBetalingsDatum}: ${saldoLijst.map { it.rekening.naam }}")
        return saldiRepository.save(Saldi(0, gebruiker, eersteBetalingsDatum, saldoLijst))
    }

    fun save(gebruiker: Gebruiker, saldiDTO: SaldiDTO): SaldiDTO {
        val datum = LocalDate.parse(saldiDTO.datum, DateTimeFormatter.BASIC_ISO_DATE).withDayOfMonth(1)
        val saldiOpt = saldiRepository.findSaldiGebruikerEnDatum(gebruiker, datum)
        val saldi = if (saldiOpt.isPresent) {
            logger.info("Saldi wordt overschreven: ${saldiOpt.get().datum} met id ${saldiOpt.get().id} voor ${gebruiker.bijnaam}")
            saldiOpt.get().saldi.forEach { saldoRepository.delete(it) }
            saldiRepository.save(
                saldiOpt.get().fullCopy(
                    saldi = saldiDTO.saldi.map { dto2Saldo(gebruiker, it, saldiOpt.get()) },
                )
            )
        } else {
            saldiRepository.save(
                Saldi(
                    gebruiker = gebruiker,
                    datum = datum,
                    saldi = saldiDTO.saldi.map { dto2Saldo(gebruiker, it) },
                )
            )
        }
        logger.info("Opslaan saldi ${saldi.datum} voor ${gebruiker.bijnaam}")
        return saldi.toDTO()
    }

    fun dto2Saldo(gebruiker: Gebruiker, saldoDTO: Saldo.SaldoDTO, saldi: Saldi? = null): Saldo {
        val rekening = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, saldoDTO.rekeningNaam)
        if (rekening.isEmpty) {
            logger.error("Ophalen niet bestaande rekening ${saldoDTO.rekeningNaam} voor ${gebruiker.bijnaam}.")
            throw throw IllegalArgumentException("Rekening ${saldoDTO.rekeningNaam} bestaat niet voor ${gebruiker.bijnaam}")
        }
        val bedrag = saldoDTO.bedrag
        return if (saldi == null) {
            Saldo(0, rekening.get(), bedrag)
        } else {
            val saldo = saldi.saldi.filter { it.rekening.naam == rekening.get().naam }
            if (saldo.size == 0) {
                logger.info("saldi: ${saldi.id} ${rekening.get().naam}")
            }
            saldo[0].fullCopy(bedrag = bedrag)
        }
    }
}