package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(name = "betaling")
class Betaling(
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
    @JoinColumn(name = "gebruiker_id", referencedColumnName = "id")
    val gebruiker: Gebruiker,
    val boekingsdatum: LocalDate,
    val bedrag: BigDecimal,
    val saldo_achteraf: BigDecimal? = null,
    val omschrijving: String? = null,
    val betalingsSoort: BetalingsSoort? = null,
    @ManyToOne
    @JoinColumn(name = "bron_id", referencedColumnName = "id")
    val bron: Rekening? = null,
    @ManyToOne
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

enum class BetalingsSoort {
    INKOMSTEN, BOODSCHAPPEN, VASTE_LASTEN, ANDERE_UITGAVE, AFLOSSEN_BETAALREGELING, AFLOSSEN_CREDITCARD,
    BESTEDING_RESERVERING, OPNAME_SPAARGELD, STORTEN_SPAARGELD, OPNAME_CONTANT_GELD
}

enum class BetalingsMethode {
    BETAALBANKREKENING, CREDITCARD, CONTANT
}

enum class Status {
    OPEN, VOORGESTELD, BEVESTIGD
}