package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Lening.LeningDTO
import io.vliet.plusmin.repository.LeningRepository
import io.vliet.plusmin.repository.RekeningRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.DataRetrievalFailureException
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Service
class LeningService {
    @Autowired
    lateinit var leningRepository: LeningRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, leningenLijst: List<LeningDTO>) {
        leningenLijst.map { leningDTO ->
            val lening = fromDTO(gebruiker, leningDTO)
            val verwachteEindBedrag = berekenRestschuldOpDatum(lening, lening.eindDatum)
            if (verwachteEindBedrag != lening.eindBedrag) {
                logger.warn("Lening ${lening.rekening.naam} verwachte ${verwachteEindBedrag} maar in Lening ${lening.eindBedrag}")
            }
            leningRepository.save(lening)
            logger.info("Lening ${leningDTO.rekeningNaam} voor ${gebruiker.bijnaam} opgeslagen.")
        }
    }

    fun berekenRestschuldOpDatum(gebruiker: Gebruiker, peilDatumAsString: String): Saldi.SaldiDTO {
        val leningenLijst = leningRepository.findLeningenVoorGebruiker(gebruiker)
        val peilDatum = LocalDate.parse(peilDatumAsString, DateTimeFormatter.BASIC_ISO_DATE)
        val saldi = leningenLijst.map { lening ->
            Saldo.SaldoDTO(
                rekeningNaam = lening.rekening.naam,
                bedrag = berekenRestschuldOpDatum(lening, peilDatum)
            )
        }
        return Saldi.SaldiDTO(
            datum = peilDatumAsString,
            saldi = saldi
        )
    }

    fun berekenRestschuldOpDatum(lening: Lening, peilDatum: LocalDate): BigDecimal {
        if (peilDatum < lening.startDatum) return lening.eindBedrag
        if (peilDatum > lening.eindDatum) return BigDecimal(0)
        val aantalMaanden = ChronoUnit.MONTHS.between(lening.startDatum, peilDatum)
        return lening.eindBedrag - BigDecimal(aantalMaanden) * lening.aflossingsBedrag
    }

    fun berekenRestschuldOpDatum(gebruiker: Gebruiker, leningDTO: LeningDTO, peilDatumAsString: String): BigDecimal {
        val lening = fromDTO(gebruiker, leningDTO)
        val peilDatum = LocalDate.parse(peilDatumAsString, DateTimeFormatter.BASIC_ISO_DATE)
        return berekenRestschuldOpDatum(lening, peilDatum)
    }

    fun fromDTO(gebruiker: Gebruiker, leningDTO: LeningDTO): Lening {
        val rekeningOpt = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, leningDTO.rekeningNaam)
        if (rekeningOpt.isEmpty) {
            logger.error("Rekening ${leningDTO.rekeningNaam} voor ${gebruiker.bijnaam} niet gevonden.")
            throw DataRetrievalFailureException("Rekening ${leningDTO.rekeningNaam} voor ${gebruiker.bijnaam} niet gevonden.")
        }
        val rekening = rekeningOpt.get()
        if (rekening.rekeningSoort != Rekening.RekeningSoort.LENING) {
            val message =
                "Rekening ${leningDTO.rekeningNaam} voor ${gebruiker.bijnaam} heeft rekeningsoort ${rekening.rekeningSoort} en kan dus geen lening koppelen."
            logger.error(message)
            throw DataIntegrityViolationException(message)
        }
        val leningOpt = leningRepository.findLeningVoorRekeningNaam(gebruiker, leningDTO.rekeningNaam)
        val lening = if (leningOpt.isEmpty) {
            Lening(
                rekening = rekening,
                startDatum = LocalDate.parse(leningDTO.startDatum, DateTimeFormatter.BASIC_ISO_DATE),
                eindDatum = LocalDate.parse(leningDTO.eindDatum, DateTimeFormatter.BASIC_ISO_DATE),
                eindBedrag = leningDTO.eindBedrag.toBigDecimal(),
                aflossingsBedrag = leningDTO.aflossingsBedrag.toBigDecimal(),
                betaalDag = leningDTO.betaalDag,
                dossierNummer = leningDTO.dossierNummer,
                notities = leningDTO.notities,
                sortOrder = leningDTO.sortOrder
            )
        } else {
            leningOpt.get().fullCopy(
                rekening = rekeningOpt.get(),
                startDatum = LocalDate.parse(leningDTO.startDatum, DateTimeFormatter.BASIC_ISO_DATE),
                eindDatum = LocalDate.parse(leningDTO.eindDatum, DateTimeFormatter.BASIC_ISO_DATE),
                eindBedrag = leningDTO.eindBedrag.toBigDecimal(),
                aflossingsBedrag = leningDTO.aflossingsBedrag.toBigDecimal(),
                betaalDag = leningDTO.betaalDag,
                dossierNummer = leningDTO.dossierNummer,
                notities = leningDTO.notities,
                sortOrder = leningDTO.sortOrder
            )
        }
        return lening
    }
}