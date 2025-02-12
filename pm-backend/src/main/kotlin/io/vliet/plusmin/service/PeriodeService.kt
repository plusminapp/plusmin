package io.vliet.plusmin.service

import io.vliet.plusmin.controller.GebruikerController.GebruikerDTO
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.repository.PeriodeRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class PeriodeService {
    @Autowired
    lateinit var periodeRepository: PeriodeRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun getPeriode(gebruiker: Gebruiker, datum: LocalDate): Periode {
        return periodeRepository.getPeriodeGebruikerEnDatum(gebruiker.id, datum)
            ?: throw IllegalStateException("Geen periode voor ${gebruiker.email} op ${datum}")
    }

    fun getOpeningPeriode(gebruiker: Gebruiker): Periode {
        return periodeRepository.getLaatstGeslotenOfOpgeruimdePeriode(gebruiker)
//            ?: periodeRepository.getInitielePeriode(gebruiker)
            ?: throw IllegalStateException("Geen initiële periode voor gebruiker ${gebruiker.email}")
    }

    fun berekenPeriodeDatums(dag: Int, datum: LocalDate): Pair<LocalDate, LocalDate> {
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

    /*
        - check of de huidige periode bestaat, anders aanmaken sinds de laatst bestaande periode
     */
    fun checkPeriodesVoorGebruiker(gebruiker: Gebruiker) {
        val laatstePeriode = periodeRepository.getLaatstePeriodeVoorGebruiker(gebruiker.id)
        logger.warn("laatstePeriode: ${laatstePeriode?.periodeStartDatum} -> ${laatstePeriode?.periodeEindDatum} ${laatstePeriode?.periodeStatus}")
        if (laatstePeriode == null) {
            creeerInitielePeriode(gebruiker, berekenPeriodeDatums(gebruiker.periodeDag, LocalDate.now()).first)
        } else if (laatstePeriode.periodeEindDatum < LocalDate.now()) {
            creeerVolgendePeriodes(laatstePeriode)
        }
    }

    fun creeerVolgendePeriodes(vorigePeriode: Periode) {
        if (vorigePeriode.periodeStatus == Periode.PeriodeStatus.HUIDIG) {
            periodeRepository.save(vorigePeriode.fullCopy(periodeStatus = Periode.PeriodeStatus.OPEN))
        }
        // TODO rekening houden met verschuivende periode door gewijzigde gebruiker.periodeDag
        val nieuwePeriode = periodeRepository.save(
            Periode(
                gebruiker = vorigePeriode.gebruiker,
                periodeStartDatum = vorigePeriode.periodeEindDatum.plusDays(1),
                periodeEindDatum = vorigePeriode.periodeEindDatum.plusMonths(1),
                periodeStatus = Periode.PeriodeStatus.HUIDIG
            )
        )
        if (nieuwePeriode.periodeEindDatum < LocalDate.now()) {
            creeerVolgendePeriodes(nieuwePeriode)
        }
    }

    fun creeerInitielePeriode(gebruiker: Gebruiker, startDatum: LocalDate) {
        if (periodeRepository.getPeriodesVoorGebruiker(gebruiker).size == 0) {
            val (periodeStartDatum, periodeEindDatum) = berekenPeriodeDatums(gebruiker.periodeDag, startDatum)
            logger.info("Initiële periode gecreëerd voor $gebruiker op ${periodeStartDatum}")
            val initielePeriode = periodeRepository.save(
                Periode(
                    0,
                    gebruiker,
                    periodeStartDatum.minusDays(1),
                    periodeStartDatum.minusDays(1),
                    Periode.PeriodeStatus.GESLOTEN
                )
            )
            if (initielePeriode.periodeEindDatum < LocalDate.now()) {
                creeerVolgendePeriodes(initielePeriode)
            }
        }
    }

    fun pasPeriodeDagAan(gebruiker: Gebruiker, gebruikerDTO: GebruikerDTO) {
        val periodes = periodeRepository.getPeriodesVoorGebruiker(gebruiker).sortedBy { it.periodeStartDatum }
        if (periodes.size == 2 && periodes[1].periodeStatus == Periode.PeriodeStatus.HUIDIG) { // initiële periode + huidige periode
            pasPeriodeDagAan(periodes, gebruikerDTO.periodeDag)
        } else {
            pasPeriodeDagAan(
                periodes.filter { it.periodeStatus == Periode.PeriodeStatus.OPEN || it.periodeStatus == Periode.PeriodeStatus.HUIDIG },
                gebruikerDTO.periodeDag
            )
        }
    }

    fun pasPeriodeDagAan(periodes: List<Periode>, periodeDag: Int) {
        if (periodes.isEmpty()) return
        val sortedPeriodes = periodes.sortedBy { it.periodeStartDatum }

        if (sortedPeriodes[0].periodeStartDatum == sortedPeriodes[0].periodeEindDatum) { // initiële periode
            val periodeStartDatum = sortedPeriodes[0].periodeStartDatum.withDayOfMonth(periodeDag).minusDays(1)
            periodeRepository.save(
                sortedPeriodes[0].fullCopy(
                    periodeStartDatum = periodeStartDatum,
                    periodeEindDatum = periodeStartDatum
                )
            )
        } else {
            val periodeEindDatum = berekenPeriodeDatums(periodeDag, sortedPeriodes[0].periodeStartDatum).second
            periodeRepository.save(
                sortedPeriodes[0].fullCopy(
                    periodeStartDatum = sortedPeriodes[0].periodeStartDatum,
                    periodeEindDatum = periodeEindDatum
                )
            )
        }
        sortedPeriodes.drop(1).forEach {
            val (periodeStartDatum, periodeEindDatum) = berekenPeriodeDatums(periodeDag, it.periodeStartDatum)
            periodeRepository.save(
                it.fullCopy(
                    periodeStartDatum = periodeStartDatum,
                    periodeEindDatum = periodeEindDatum
                )
            )
        }
    }
}