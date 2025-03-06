package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonInclude
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(
    name = "rekening",
    uniqueConstraints = [UniqueConstraint(columnNames = ["gebruiker", "naam"])]
)
class Rekening(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence",
        sequenceName = "hibernate_sequence",
        allocationSize = 1
    )
    val id: Long = 0,
    val naam: String,
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "gebruiker_id")
    val gebruiker: Gebruiker,
    @Enumerated(EnumType.STRING)
    val rekeningSoort: RekeningSoort,
    val nummer: String? = null,
    @JsonInclude(JsonInclude.Include.NON_NULL)
    val bankNaam: String? = null,
    val sortOrder: Int,
    @OneToMany(mappedBy = "rekening", fetch = FetchType.EAGER, cascade = [CascadeType.ALL], orphanRemoval = true)
    var budgetten: List<Budget> = emptyList()
) {
    companion object {
        val sortableFields = setOf("id", "naam", "afkorting")
    }

    fun fullCopy(
        naam: String = this.naam,
        gebruiker: Gebruiker = this.gebruiker,
        rekeningSoort: RekeningSoort = this.rekeningSoort,
        nummer: String? = this.nummer,
        bankNaam: String? = this.bankNaam,
        sortOrder: Int = this.sortOrder,
        budgetten: List<Budget> = this.budgetten
    ) = Rekening(this.id, naam, gebruiker, rekeningSoort, nummer, bankNaam, sortOrder, budgetten)

    data class RekeningDTO(
        val id: Long = 0,
        val naam: String,
        val rekeningSoort: String,
        val nummer: String?,
        val bankNaam: String?,
        val saldo: BigDecimal = BigDecimal(0),
        val sortOrder: Int,
        val budgetten: List<Budget>? = emptyList()
    )

    fun toDTO(): RekeningDTO {
        return RekeningDTO(
            this.id,
            this.naam,
            this.rekeningSoort.toString(),
            this.nummer,
            this.bankNaam,
            sortOrder = this.sortOrder,
            budgetten = this.budgetten
        )
    }

    enum class RekeningSoort {
        BETAALREKENING, SPAARREKENING, CONTANT, CREDITCARD, AFLOSSING, RESERVERING,
        INKOMSTEN, RENTE, UITGAVEN
    }
}

val resultaatRekeningSoort = arrayOf(
    Rekening.RekeningSoort.INKOMSTEN,
    Rekening.RekeningSoort.RENTE,
    Rekening.RekeningSoort.UITGAVEN,
)

val balansRekeningSoort = arrayOf(
    Rekening.RekeningSoort.BETAALREKENING,
    Rekening.RekeningSoort.SPAARREKENING,
    Rekening.RekeningSoort.CONTANT,
    Rekening.RekeningSoort.CREDITCARD,
    Rekening.RekeningSoort.AFLOSSING,
    Rekening.RekeningSoort.RESERVERING
)
