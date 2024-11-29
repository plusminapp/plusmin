package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "rekening",
    uniqueConstraints = [UniqueConstraint(columnNames = ["gebruiker", "naam"])])
class Rekening(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence", 
        sequenceName = "hibernate_sequence", 
        allocationSize = 1)
    val id: Long = 0,
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "gebruiker_id")
    val gebruiker: Gebruiker,
    @Enumerated(EnumType.STRING)
    val type: Type,
    val nummer: String?,
    val naam: String,
    val afkorting: String

) {
    companion object {
        val sortableFields = setOf("id", "naam", "afkorting")
    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        type: Type = this.type,
        nummer: String? = this.nummer,
        naam: String = this.naam,
        afkorting: String = this.afkorting
    ) = Rekening(this.id, gebruiker, type, nummer, naam, afkorting)

    data class RekeningDTO(
        val id: Long = 0,
        val type: String,
        val nummer: String?,
        val naam: String,
        val afkorting: String
    )

    fun toDTO(): RekeningDTO {
        return RekeningDTO(
            this.id,
            this.type.toString(),
            this.nummer,
            this.naam,
            this.afkorting
        )
    }
}
enum class Type {
    CONTANT, BETAALBANKREKENING, SPAARREKENING, CREDITCARD, BETAALREGELING
}