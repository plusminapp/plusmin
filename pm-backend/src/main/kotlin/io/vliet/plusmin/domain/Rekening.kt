package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

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
    val sortOrder: Int
) {
    companion object {
        val sortableFields = setOf("id", "naam", "afkorting")
    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        rekeningSoort: RekeningSoort = this.rekeningSoort,
        nummer: String? = this.nummer,
        naam: String = this.naam,
        sortOrder: Int = this.sortOrder
    ) = Rekening(this.id, naam, gebruiker, rekeningSoort, nummer, sortOrder)

    data class RekeningDTO(
        val id: Long = 0,
        val rekeningSoort: String,
        val nummer: String?,
        val naam: String,
        val sortOrder: Int
    )

    fun toDTO(): RekeningDTO {
        return RekeningDTO(
            this.id,
            this.rekeningSoort.toString(),
            this.nummer,
            this.naam,
            this.sortOrder
        )
    }

    enum class RekeningSoort {
        BETAALREKENING, SPAARREKENING, CONTANT, CREDITCARD, LENING, RESERVERING,
        INKOMSTEN, UITGAVEN
    }
}

    val balansRekeningSoort = arrayOf(
        Rekening.RekeningSoort.BETAALREKENING,
        Rekening.RekeningSoort.SPAARREKENING,
        Rekening.RekeningSoort.CONTANT,
        Rekening.RekeningSoort.CREDITCARD,
        Rekening.RekeningSoort.LENING,
        Rekening.RekeningSoort.RESERVERING
    )

    val resultaatRekeningSoort = arrayOf(
        Rekening.RekeningSoort.INKOMSTEN,
        Rekening.RekeningSoort.UITGAVEN,
    )
