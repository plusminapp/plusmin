package io.vliet.plusmin.service

import io.vliet.plusmin.controller.SaldiController
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Lening.LeningDTO
import io.vliet.plusmin.domain.Lening.LeningData
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.LeningRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.SaldoRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
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

    @Autowired
    lateinit var saldiService: SaldiService

    @Autowired
    lateinit var saldoRepository: SaldoRepository

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, leningenLijst: List<LeningDTO>) {
        leningenLijst.map { leningDTO ->
            val lening = fromDTO(gebruiker, leningDTO)
            val verwachteEindBedrag = berekenLeningDTOOpDatum(lening, lening.eindDatum)
            if (verwachteEindBedrag != lening.eindBedrag) {
                logger.warn("Lening ${lening.rekening.naam} verwachte ${verwachteEindBedrag} maar in Lening ${lening.eindBedrag}")
            }
            leningRepository.save(lening)
            logger.info("Lening ${leningDTO.rekening.naam} voor ${gebruiker.bijnaam} opgeslagen.")
        }
        val saldi = saldiService.getOpeningSaldi(gebruiker)
        val saldoDTOLijst = leningenLijst.map {
            Saldo.SaldoDTO(
                rekeningNaam = it.rekening.naam,
                bedrag = -berekenLeningDTOOpDatum(gebruiker, it, saldi.datum.toString())
            )
        }
        saldiService.merge(gebruiker, saldi, saldoDTOLijst).map { saldoRepository.save(it) }
    }

    fun berekenLeningenOpDatum(gebruiker: Gebruiker, peilDatumAsString: String): List<LeningDTO> {
        val leningenLijst = leningRepository.findLeningenVoorGebruiker(gebruiker)
        val peilDatum = LocalDate.parse(peilDatumAsString, DateTimeFormatter.ISO_LOCAL_DATE)
        val standDTO = saldiService.getStandOpDatum(gebruiker, peilDatum)

        return leningenLijst
            .sortedBy { it.rekening.sortOrder }
            .map { lening ->
                lening.toDTO()
                    .with(
                        Lening.LeningSaldiDTO(
                            peilDatum = peilDatumAsString,
                            werkelijkSaldo = getBalansVanStand(standDTO, lening.rekening),
                            berekendSaldo = berekenLeningDTOOpDatum(lening, peilDatum),
                            betaling = getBetalingVoorLeningOpPeildatum(lening, peilDatum)
                        )
                    )
            }
    }

    fun getBalansVanStand(standDTO: SaldiController.StandDTO, rekening: Rekening): BigDecimal {
        val saldo: Saldo.SaldoDTO? = standDTO.balansOpDatum.saldoLijst.find { it.rekeningNaam == rekening.naam }
        return if (saldo == null) BigDecimal(0) else -saldo.bedrag
    }

    fun berekenLeningDTOOpDatum(lening: Lening, peilDatum: LocalDate): BigDecimal {
        if (peilDatum < lening.startDatum) return lening.eindBedrag
        if (peilDatum > lening.eindDatum) return BigDecimal(0)
        val isHetAlAfgeschreven = if (peilDatum.dayOfMonth <= lening.betaalDag) 0 else 1
        val aantalMaanden = ChronoUnit.MONTHS.between(lening.startDatum, peilDatum) + isHetAlAfgeschreven
        logger.warn("berekenLeningDTOOpDatum ${lening.startDatum} -> ${peilDatum} = ${aantalMaanden}: ${peilDatum.dayOfMonth} - ${lening.betaalDag} ${peilDatum.dayOfMonth < lening.betaalDag} ${isHetAlAfgeschreven}")
        return lening.eindBedrag - BigDecimal(aantalMaanden) * lening.aflossingsBedrag
    }

    fun getBetalingVoorLeningOpPeildatum(lening: Lening, peilDatum: LocalDate): BigDecimal {
        val betalingen = betalingRepository.findAllByGebruikerOpDatum(lening.rekening.gebruiker, peilDatum)
        logger.info("aantal betalingen: ${betalingen.size}")
        val filteredBetalingen =
            betalingen.filter { it.bron.id == lening.rekening.id || it.bestemming.id == lening.rekening.id }
        logger.info("aantal filteredBetalingen: ${filteredBetalingen.size}")
        val bedrag =
            filteredBetalingen.fold(BigDecimal(0)) { acc, betaling -> if (betaling.bron.id == lening.rekening.id) acc - betaling.bedrag else acc + betaling.bedrag }
        logger.info("bedrag: ${bedrag}")
        return bedrag
    }

    fun berekenLeningDTOOpDatum(gebruiker: Gebruiker, leningDTO: LeningDTO, peilDatumAsString: String): BigDecimal {
        val lening = fromDTO(gebruiker, leningDTO)
        val peilDatum = LocalDate.parse(peilDatumAsString, DateTimeFormatter.ISO_LOCAL_DATE)
        return berekenLeningDTOOpDatum(lening, peilDatum)
    }

    fun fromDTO(gebruiker: Gebruiker, leningDTO: LeningDTO): Lening {
        val rekeningOpt = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, leningDTO.rekening.naam)
        val maxSortOrder =
            if (rekeningRepository.findMaxSortOrder().isPresent)
                rekeningRepository.findMaxSortOrder().get().sortOrder + 1
            else 1
        val rekening = if (rekeningOpt.isPresent) {
            rekeningOpt.get()
        } else {
            rekeningRepository.save(
                Rekening(
                    gebruiker = gebruiker,
                    rekeningSoort = Rekening.RekeningSoort.LENING,
                    naam = leningDTO.rekening.naam,
                    sortOrder = maxSortOrder
                )
            )
        }
        if (rekening.rekeningSoort != Rekening.RekeningSoort.LENING) {
            val message =
                "Rekening ${leningDTO.rekening} voor ${gebruiker.bijnaam} heeft rekeningsoort ${rekening.rekeningSoort} en kan dus geen lening koppelen."
            logger.error(message)
            throw DataIntegrityViolationException(message)
        }
        val leningOpt = leningRepository.findLeningVoorRekeningNaam(gebruiker, leningDTO.rekening.naam)
        val lening = if (leningOpt.isEmpty) {
            Lening(
                rekening = rekening,
                startDatum = LocalDate.parse(leningDTO.startDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindDatum = LocalDate.parse(leningDTO.eindDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindBedrag = leningDTO.eindBedrag.toBigDecimal(),
                aflossingsBedrag = leningDTO.aflossingsBedrag.toBigDecimal(),
                betaalDag = leningDTO.betaalDag,
                dossierNummer = leningDTO.dossierNummer,
                notities = leningDTO.notities,
            )
        } else {
            leningOpt.get().fullCopy(
                rekening = rekeningOpt.get(),
                startDatum = LocalDate.parse(leningDTO.startDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindDatum = LocalDate.parse(leningDTO.eindDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindBedrag = leningDTO.eindBedrag.toBigDecimal(),
                aflossingsBedrag = leningDTO.aflossingsBedrag.toBigDecimal(),
                betaalDag = leningDTO.betaalDag,
                dossierNummer = leningDTO.dossierNummer,
                notities = leningDTO.notities,
            )
        }
        return lening
    }

    fun generateMonthsBetween(startDate: LocalDate, endDate: LocalDate): List<LocalDate> {
        val dates = mutableListOf<LocalDate>()
        var current = startDate.withDayOfMonth(1)
        val end = endDate.withDayOfMonth(1)
        while (!current.isAfter(end)) {
            dates.add(current)
            current = current.plus(1, ChronoUnit.MONTHS)
        }
        return dates
    }
//    fun berekenLeningGrafiekData(gebruiker: Gebruiker): MutableMap<String, List<LeningData>> {
//        val formatter = DateTimeFormatter.ofPattern("MMM yy")
//        val leningen = leningRepository.findLeningenVoorGebruiker(gebruiker)
//        var leningGrafiekData: MutableMap<String, List<LeningData>> = mutableMapOf()
//        leningen.forEach { lening ->
//            val maanden = generateMonthsBetween(lening.startDatum, lening.eindDatum)
//
//        }
//    }
}