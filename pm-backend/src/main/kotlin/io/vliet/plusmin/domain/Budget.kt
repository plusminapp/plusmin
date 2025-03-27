package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import io.vliet.plusmin.domain.Aflossing.AflossingDTO
import io.vliet.plusmin.domain.Aflossing.AflossingSaldoDTO
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(
    name = "budget",
    uniqueConstraints = [UniqueConstraint(columnNames = ["rekening", "naam"])]
)
class Budget(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence",
        sequenceName = "hibernate_sequence",
        allocationSize = 1
    )
    val id: Long = 0,
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "rekening_id", nullable = false)
    val rekening: Rekening,
    val budgetNaam: String,
    val budgetType: BudgetType = BudgetType.VAST,
    val budgetPeriodiciteit: BudgetPeriodiciteit = BudgetPeriodiciteit.MAAND,
    val bedrag: BigDecimal,
    val betaalDag: Int?,
) {
    fun fullCopy(
        rekening: Rekening = this.rekening,
        budgetNaam: String = this.budgetNaam,
        bedrag: BigDecimal = this.bedrag,
        budgetType: BudgetType = this.budgetType,
        budgetPeriodiciteit: BudgetPeriodiciteit = this.budgetPeriodiciteit,
        betaalDag: Int? = this.betaalDag,
    ) = Budget(this.id, rekening, budgetNaam, budgetType, budgetPeriodiciteit, bedrag, betaalDag)

    data class BudgetDTO(
        val id: Long = 0,
        val rekeningNaam: String,
        val rekeningSoort: String,
        val budgetNaam: String,
        val budgetType: String,
        val budgetPeriodiciteit: String,
        val bedrag: BigDecimal,
        val betaalDag: Int?,
        var budgetSaldoDTO: BudgetSaldoDTO? = null
    ){
        fun with(budgetSaldoDTO: BudgetSaldoDTO): BudgetDTO {
            this.budgetSaldoDTO = budgetSaldoDTO
            return this
        }
    }

    fun toDTO(): BudgetDTO {
        return BudgetDTO(
            this.id,
            this.rekening.naam,
            this.rekening.rekeningSoort.toString(),
            this.budgetNaam,
            this.budgetType.toString(),
            this.budgetPeriodiciteit.toString(),
            this.bedrag,
            this.betaalDag
        )
    }
    data class BudgetSaldoDTO(
        val peilDatum: String,
        val betaling: BigDecimal
    )

    enum class BudgetType {
        VAST, CONTINU
    }

    enum class BudgetPeriodiciteit {
        WEEK, MAAND
    }
}
