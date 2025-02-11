package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
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
class PeriodeService {
    @Autowired
    lateinit var periodeRepository: PeriodeRepository

    @Autowired
    lateinit var saldoService: SaldoService

    @Autowired
    lateinit var saldoRepository: SaldoRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)


    fun getPeriode(gebruiker: Gebruiker, datum: LocalDate): Periode {
        return periodeRepository.getPeriodeGebruikerEnDatum(gebruiker.id, datum)
            ?: throw IllegalStateException("Geen periode voor ${gebruiker.email} op ${datum}")
    }

    fun getOpeningPeriode(gebruiker: Gebruiker): Periode {
        return periodeRepository.getLaatstGeslotenOfOpgeruimdePeriode(gebruiker)
            ?: periodeRepository.getInitielePeriod(gebruiker)
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
        TODO check of dit klopt!!!
        - check of de huidige periode bestaat, anders aanmaken sinds de laatst bestaande periode
        - check of alle rekeningen in de huidige periode een saldo hebben, anders aanmaken met bedrag 0
     */
    fun checkPeriodesVoorGebruiker(gebruiker: Gebruiker) {
        val laatstePeriodeOpt = periodeRepository.getLaatstePeriodeGebruiker(gebruiker.id)
        val startHuidigePeriode = berekenPeriodeDatums(gebruiker.periodeDag, LocalDate.now()).first
        if (laatstePeriodeOpt == null) {
            creeerEerstePeriodeMetNulSaldi(gebruiker)
        } else if (laatstePeriodeOpt.periodeStartDatum != null &&  laatstePeriodeOpt.periodeStartDatum < startHuidigePeriode) {
            saldoService.creeerPeriodes(laatstePeriodeOpt, startHuidigePeriode)
        }
    }

    fun creeerEerstePeriodeMetNulSaldi(gebruiker: Gebruiker) {
        val (periodeStartDatum, periodeEindDatum) = berekenPeriodeDatums(gebruiker.periodeDag, LocalDate.now())
        val huidigePeriode = periodeRepository.save(Periode(0, gebruiker, periodeStartDatum, periodeEindDatum))
        val rekeningen = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        rekeningen.forEach {
            saldoRepository.save(Saldo(0, it, BigDecimal(0), huidigePeriode))
        }
        logger.info("NulSaldi gecreëerd voor $gebruiker op ${periodeStartDatum}: ${rekeningen.map { it.naam }}")

    }
}