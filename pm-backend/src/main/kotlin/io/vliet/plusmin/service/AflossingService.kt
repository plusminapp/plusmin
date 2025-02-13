package io.vliet.plusmin.service

import io.vliet.plusmin.controller.SaldoController
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Aflossing.AflossingDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.AflossingRepository
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
class AflossingService {
    @Autowired
    lateinit var aflossingRepository: AflossingRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var periodeService: PeriodeService

    @Autowired
    lateinit var saldoService: SaldoService

    @Autowired
    lateinit var saldoRepository: SaldoRepository

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, aflossingenLijst: List<AflossingDTO>) {
        aflossingenLijst.map { aflossingDTO ->
            val aflossing = fromDTO(gebruiker, aflossingDTO)
            val verwachteEindBedrag = berekenAflossingDTOOpDatum(aflossing, aflossing.eindDatum)
            if (verwachteEindBedrag != aflossing.eindBedrag) {
                logger.warn("Aflossing ${aflossing.rekening.naam} verwachte ${verwachteEindBedrag} maar in Aflossing ${aflossing.eindBedrag}")
            }
            aflossingRepository.save(aflossing)
            logger.info("Aflossing ${aflossingDTO.rekening.naam} voor ${gebruiker.bijnaam} opgeslagen.")
        }
        val periode = periodeService.getPeriode(gebruiker, LocalDate.now())
        val saldoDTOLijst = aflossingenLijst.map {
            Saldo.SaldoDTO(
                rekeningNaam = it.rekening.naam,
                bedrag = -berekenAflossingDTOOpDatum(gebruiker, it, periode.periodeStartDatum.toString())
            )
        }
        saldoService.merge(gebruiker, periode, saldoDTOLijst).map { saldoRepository.save(it) }
    }

    fun berekenAflossingenOpDatum(gebruiker: Gebruiker, peilDatumAsString: String): List<AflossingDTO> {
        val aflossingenLijst = aflossingRepository.findAflossingenVoorGebruiker(gebruiker)
        val peilDatum = LocalDate.parse(peilDatumAsString, DateTimeFormatter.ISO_LOCAL_DATE)
        val periode = periodeService.getOpeningPeriode(gebruiker)
        val periodeStartDatum = periodeService.berekenPeriodeDatums(periode.gebruiker.periodeDag, peilDatum).first
        val standDTO = saldoService.getStandOpDatum(periode, periodeStartDatum, peilDatum)

        return aflossingenLijst
            .sortedBy { it.rekening.sortOrder }
            .map { aflossing ->
                aflossing.toDTO()
                    .with(
                        Aflossing.AflossingSaldiDTO(
                            peilDatum = peilDatumAsString,
                            werkelijkSaldo = getBalansVanStand(standDTO, aflossing.rekening),
                            berekendSaldo = berekenAflossingDTOOpDatum(aflossing, peilDatum),
                            betaling = getBetalingVoorAflossingOpPeildatum(aflossing, peilDatum)
                        )
                    )
            }
    }

    fun getBalansVanStand(standDTO: SaldoController.StandDTO, rekening: Rekening): BigDecimal {
        val saldo: Saldo.SaldoDTO? = standDTO.balansOpDatum.find { it.rekeningNaam == rekening.naam }
        return if (saldo == null) BigDecimal(0) else -saldo.bedrag
    }

    fun berekenAflossingDTOOpDatum(gebruiker: Gebruiker, aflossingDTO: AflossingDTO, peilDatumAsString: String): BigDecimal {
        val aflossing = fromDTO(gebruiker, aflossingDTO)
        val peilDatum = LocalDate.parse(peilDatumAsString, DateTimeFormatter.ISO_LOCAL_DATE)
        return berekenAflossingDTOOpDatum(aflossing, peilDatum)
    }

    fun berekenAflossingDTOOpDatum(aflossing: Aflossing, peilDatum: LocalDate): BigDecimal {
        if (peilDatum < aflossing.startDatum) return aflossing.eindBedrag
        if (peilDatum > aflossing.eindDatum) return BigDecimal(0)
        val isHetAlAfgeschreven = if (peilDatum.dayOfMonth <= aflossing.betaalDag) 0 else 1
        val aantalMaanden = ChronoUnit.MONTHS.between(aflossing.startDatum, peilDatum) + isHetAlAfgeschreven
        logger.warn("berekenAflossingDTOOpDatum ${aflossing.startDatum} -> ${peilDatum} = ${aantalMaanden}: ${peilDatum.dayOfMonth} - ${aflossing.betaalDag} ${peilDatum.dayOfMonth < aflossing.betaalDag} ${isHetAlAfgeschreven}")
        return aflossing.eindBedrag - BigDecimal(aantalMaanden) * aflossing.aflossingsBedrag
    }

    fun getBetalingVoorAflossingOpPeildatum(aflossing: Aflossing, peilDatum: LocalDate): BigDecimal {
        val betalingen = betalingRepository.findAllByGebruikerOpDatum(aflossing.rekening.gebruiker, peilDatum)
        logger.info("aantal betalingen: ${betalingen.size}")
        val filteredBetalingen =
            betalingen.filter { it.bron.id == aflossing.rekening.id || it.bestemming.id == aflossing.rekening.id }
        logger.info("aantal filteredBetalingen: ${filteredBetalingen.size}")
        val bedrag =
            filteredBetalingen.fold(BigDecimal(0)) { acc, betaling -> if (betaling.bron.id == aflossing.rekening.id) acc - betaling.bedrag else acc + betaling.bedrag }
        logger.info("bedrag: ${bedrag}")
        return bedrag
    }

    fun fromDTO(gebruiker: Gebruiker, aflossingDTO: AflossingDTO): Aflossing {
        val maxSortOrderOpt = rekeningRepository.findMaxSortOrder()
        val maxSortOrder =
            if (maxSortOrderOpt != null)
                maxSortOrderOpt.sortOrder + 1
            else 1
        val rekening = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, aflossingDTO.rekening.naam)
            ?: rekeningRepository.save(
                Rekening(
                    gebruiker = gebruiker,
                    rekeningSoort = Rekening.RekeningSoort.AFLOSSING,
                    naam = aflossingDTO.rekening.naam,
                    sortOrder = maxSortOrder
                )
            )
        if (rekening.rekeningSoort != Rekening.RekeningSoort.AFLOSSING) {
            val message =
                "Rekening ${aflossingDTO.rekening} voor ${gebruiker.bijnaam} heeft rekeningsoort ${rekening.rekeningSoort} en kan dus geen aflossing koppelen."
            logger.error(message)
            throw DataIntegrityViolationException(message)
        }
        val aflossing = aflossingRepository.findAflossingVoorRekeningNaam(gebruiker, aflossingDTO.rekening.naam)
            ?.fullCopy(
                rekening = rekening,
                startDatum = LocalDate.parse(aflossingDTO.startDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindDatum = LocalDate.parse(aflossingDTO.eindDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindBedrag = aflossingDTO.eindBedrag.toBigDecimal(),
                aflossingsBedrag = aflossingDTO.aflossingsBedrag.toBigDecimal(),
                betaalDag = aflossingDTO.betaalDag,
                dossierNummer = aflossingDTO.dossierNummer,
                notities = aflossingDTO.notities,
            )
            ?: Aflossing(
                rekening = rekening,
                startDatum = LocalDate.parse(aflossingDTO.startDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindDatum = LocalDate.parse(aflossingDTO.eindDatum, DateTimeFormatter.ISO_LOCAL_DATE),
                eindBedrag = aflossingDTO.eindBedrag.toBigDecimal(),
                aflossingsBedrag = aflossingDTO.aflossingsBedrag.toBigDecimal(),
                betaalDag = aflossingDTO.betaalDag,
                dossierNummer = aflossingDTO.dossierNummer,
                notities = aflossingDTO.notities,
            )
        return aflossing
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
//    fun berekenAflossingGrafiekData(gebruiker: Gebruiker): MutableMap<String, List<AflossingData>> {
//        val formatter = DateTimeFormatter.ofPattern("MMM yy")
//        val aflossingen = aflossingRepository.findAflossingenVoorGebruiker(gebruiker)
//        var aflossingGrafiekData: MutableMap<String, List<AflossingData>> = mutableMapOf()
//        aflossingen.forEach { aflossing ->
//            val maanden = generateMonthsBetween(aflossing.startDatum, aflossing.eindDatum)
//
//        }
//    }
}