package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Budget
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Budget.BudgetDTO
import io.vliet.plusmin.repository.BudgetRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.SaldoRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.webjars.NotFoundException

@Service
class BudgetService {
    @Autowired
    lateinit var budgetRepository: BudgetRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var saldoRepository: SaldoRepository

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
}