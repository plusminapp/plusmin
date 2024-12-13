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
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "gebruiker_id")
    val gebruiker: Gebruiker,
    @Enumerated(EnumType.STRING)
    val rekeningSoort: RekeningSoort,
    val nummer: String?,
    val naam: String,
    val afkorting: String

) {
    companion object {
        val sortableFields = setOf("id", "naam", "afkorting")
    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        rekeningSoort: RekeningSoort = this.rekeningSoort,
        nummer: String? = this.nummer,
        naam: String = this.naam,
        afkorting: String = this.afkorting
    ) = Rekening(this.id, gebruiker, rekeningSoort, nummer, naam, afkorting)

    data class RekeningDTO(
        val id: Long = 0,
        val rekeningSoort: String,
        val nummer: String?,
        val naam: String,
        val afkorting: String
    )

    fun toDTO(): RekeningDTO {
        return RekeningDTO(
            this.id,
            this.rekeningSoort.toString(),
            this.nummer,
            this.naam,
            this.afkorting,
        )
    }
}

val balansRekeningSoort = arrayOf(
    RekeningSoort.BETAALREKENING,
    RekeningSoort.SPAARREKENING,
    RekeningSoort.CONTANT,
    RekeningSoort.CREDITCARD,
    RekeningSoort.BETAALREGELING,
    RekeningSoort.RESERVERING
)

val resultaatRekeningSoort = arrayOf(
    RekeningSoort.INKOMSTEN,
    RekeningSoort.UITGAVEN,
)

enum class RekeningSoort {
    BETAALREKENING, SPAARREKENING, CONTANT, CREDITCARD, BETAALREGELING, RESERVERING,
    INKOMSTEN, UITGAVEN
}
