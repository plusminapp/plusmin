package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Budget
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Budget.BudgetDTO
import io.vliet.plusmin.domain.Periode
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.BudgetRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.SaldoRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.webjars.NotFoundException
import java.math.BigDecimal
import java.time.LocalDate

@Service
class BudgetService {
    @Autowired
    lateinit var budgetRepository: BudgetRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    @Autowired
    lateinit var saldoService: SaldoService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, budgetenLijst: List<BudgetDTO>): List<BudgetDTO> {
        return budgetenLijst.map { budgetDTO -> upsert(gebruiker, budgetDTO) }
    }

    fun upsert(gebruiker: Gebruiker, budgetDTO: BudgetDTO): BudgetDTO {
        val rekening = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, budgetDTO.rekeningNaam)
            ?: throw NotFoundException("${budgetDTO.rekeningNaam} niet gevonden.")
        val budget = budgetRepository.findByRekeningEnBudgetNaam(rekening, budgetDTO.budgetNaam)
        val newBudget = if (budget == null) {
            logger.info("Nieuw budget ${budgetDTO.budgetNaam} voor gebruiker ${gebruiker.email}")
            budgetRepository.save(
                Budget(
                    id = 0,
                    rekening = rekening,
                    budgetNaam = budgetDTO.budgetNaam,
                    budgetType = Budget.BudgetType.valueOf(budgetDTO.budgetType.uppercase()),
                    budgetPeriodiciteit = Budget.BudgetPeriodiciteit.valueOf(budgetDTO.budgetPeriodiciteit.uppercase()),
                    bedrag = budgetDTO.bedrag,
                    betaalDag = budgetDTO.betaalDag
                )
            )
        } else {
            logger.info("Bestaand budget ${budget.id}/${budget.budgetNaam} voor gebruiker ${gebruiker.email}")
            budgetRepository.save(
                budget.fullCopy(
                    rekening = rekening,
                    budgetNaam = budgetDTO.budgetNaam,
                    budgetType = Budget.BudgetType.valueOf(budgetDTO.budgetType.uppercase()),
                    budgetPeriodiciteit = Budget.BudgetPeriodiciteit.valueOf(budgetDTO.budgetPeriodiciteit.uppercase()),
                    bedrag = budgetDTO.bedrag,
                    betaalDag = budgetDTO.betaalDag
                )
            )
        }
        return newBudget.toDTO()
    }

    fun berekenBudgetRestVoorPeriode(budget: Budget, periode: Periode, peilDatum: LocalDate): BigDecimal {
        val betalingenInPeriode = betalingRepository
            .findAllByGebruikerTussenDatums(budget.rekening.gebruiker, periode.periodeStartDatum, peilDatum)
            .filter { it.budget?.id == budget.id }
            .fold(BigDecimal(0)) { acc, betaling -> acc + betaling.bedrag }
        val dagenInPeriode = periode.periodeEindDatum.toEpochDay() - periode.periodeStartDatum.toEpochDay() + 1
        val budgetMaandBedrag = when (budget.budgetPeriodiciteit) {
            Budget.BudgetPeriodiciteit.WEEK -> BigDecimal(budget.bedrag.longValueExact() * dagenInPeriode / 7)
            Budget.BudgetPeriodiciteit.MAAND -> budget.bedrag
        }
        return budgetMaandBedrag - betalingenInPeriode
    }
}