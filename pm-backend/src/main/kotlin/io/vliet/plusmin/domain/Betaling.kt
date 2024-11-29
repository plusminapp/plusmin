package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.NotNull
import javax.validation.constraints.PastOrPresent

@Entity
@Table(name = "betaling")
class Betaling(
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
    val boekingsdatum: LocalDate,
    val bedrag: BigDecimal,
    val saldo_achteraf: BigDecimal? = null,
    val omschrijving: String? = null,
    val categorie: String? = null,
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "bron_id", referencedColumnName = "id")
    val bron: Rekening? = null,
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "bestemming_id", referencedColumnName = "id")
    val bestemming: Rekening? = null,

    val referentie: String? = null,
    val bank_informatie: String? = null,
    @Enumerated(EnumType.STRING)
    val status: Status = Status.OPEN
) {
    companion object {
        val sortableFields = setOf("id", "boekingsdatum", "status")
    }
}

enum class Status {
    OPEN, VOORGESTELD, BEVESTIGD
}