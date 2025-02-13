package io.vliet.plusmin.service

import io.vliet.plusmin.controller.SaldoController
import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Aflossing.AflossingDTO
import io.vliet.plusmin.repository.*
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
class AflossingGrafiekService {
    @Autowired
    lateinit var aflossingRepository: AflossingRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun berekenAflossingGrafiekData(gebruiker: Gebruiker): String {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")
        val aflossingen = aflossingRepository.findAflossingenVoorGebruiker(gebruiker)
        var aflossingGrafiekData: MutableMap<String, List<Aflossing.AflossingData>> = mutableMapOf()
        aflossingen.forEach { aflossing ->
            val maanden = generateMonthsBetween(aflossing.startDatum, aflossing.eindDatum)

        }
        return "blaat"
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

    fun genereerSeries(gebruiker: Gebruiker): List<Serie> {
        val rekeningen = rekeningRepository
            .findRekeningenVoorGebruiker(gebruiker)
            .filter { it.rekeningSoort == Rekening.RekeningSoort.AFLOSSING }
        return rekeningen.map { Serie(
            yKey = it.naam.lowercase().replace("\\s".toRegex(), ""),
            yName = it.naam
        ) }
    }

    data class Serie(
        val type: String = "area",
        val xKey: String = "month",
        val yKey: String,
        val yName: String,
        val stacked: Boolean = true,
    )
}