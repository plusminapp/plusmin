package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "rekening")
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
    @JoinColumn(name = "gebruiker_id", referencedColumnName = "id")
    val gebruiker: Gebruiker,
    @Enumerated(EnumType.STRING)
    val type: Type,
    val nummer: String,
    val naam: String,
    val afkorting: String

) {
    companion object {
        val sortableFields = setOf("id", "naam", "afkorting")
    }
}

enum class Type {
    CONTANT, BETAALBANKREKENING, SPAARREKENING, CREDITCARD, BETAALREGELING
}