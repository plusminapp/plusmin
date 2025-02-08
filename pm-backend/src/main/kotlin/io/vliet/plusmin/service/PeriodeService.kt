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
        val openingsSaldiOpt = periodeRepository.getPeriodeGebruikerEnDatum(gebruiker.id, datum)
        if (openingsSaldiOpt.isEmpty)
            throw IllegalStateException("geen periode voor ${gebruiker.email} op ${datum}")
        else return openingsSaldiOpt.get()
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

    /*
        - check of de huidige periode bestaat, anders aanmaken sinds de laatst bestaande periode
        - check of alle rekeningen in de huidige periode een saldo hebben, anders aanmaken met bedrag 0
     */
    fun checkPeriodesVoorGebruiker(gebruiker: Gebruiker) {
        val laatstePeriodeOpt = periodeRepository.getLaatstePeriodeGebruiker(gebruiker.id)
        val startHuidigePeriode = berekenPeriode(gebruiker.periodeDag, LocalDate.now()).first
        if (laatstePeriodeOpt.isEmpty) {
            creeerEerstePeriodeMetNulSaldi(gebruiker)
        } else if (laatstePeriodeOpt.get().periodeStartDatum < startHuidigePeriode) {
            saldoService.creeerPeriodes(laatstePeriodeOpt.get(), startHuidigePeriode)
        }
    }

    fun creeerEerstePeriodeMetNulSaldi(gebruiker: Gebruiker) {
        val (periodeStartDatum, periodeEindDatum) = berekenPeriode(gebruiker.periodeDag, LocalDate.now())
        val huidigePeriode = periodeRepository.save(Periode(0, gebruiker, periodeStartDatum, periodeEindDatum))
        val rekeningen = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        rekeningen.forEach {
            saldoRepository.save(Saldo(0, it, BigDecimal(0), huidigePeriode))
        }
        logger.info("NulSaldi gecreëerd voor $gebruiker op ${periodeStartDatum}: ${rekeningen.map { it.naam }}")

    }
}