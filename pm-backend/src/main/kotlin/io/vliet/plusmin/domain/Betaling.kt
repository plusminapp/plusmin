package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

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
    val omschrijving: String,
    @Enumerated(EnumType.STRING)
    val betalingsSoort: BetalingsSoort,
    @ManyToOne
    @JoinColumn(name = "bron_id", referencedColumnName = "id")
    val bron: Rekening,
    @ManyToOne
    @JoinColumn(name = "bestemming_id", referencedColumnName = "id")
    val bestemming: Rekening,
) {
    companion object {
        val sortableFields = setOf("id", "boekingsdatum", "status")
    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        boekingsdatum: LocalDate = this.boekingsdatum,
        bedrag: BigDecimal = this.bedrag,
        omschrijving: String = this.omschrijving,
        betalingsSoort: BetalingsSoort = this.betalingsSoort,
        bron: Rekening = this.bron,
        bestemming: Rekening = this.bestemming
    ) = Betaling(this.id, gebruiker, boekingsdatum, bedrag, omschrijving, betalingsSoort, bron, bestemming)

    data class BetalingDTO(
        val id: Long = 0,
        val boekingsdatum: String,
        val bedrag: String,
        val omschrijving: String,
        val betalingsSoort: String,
        val bron: String,
        val bestemming: String
    )

    fun toDTO(): BetalingDTO {
        return BetalingDTO(
            this.id,
            this.boekingsdatum.format(DateTimeFormatter.BASIC_ISO_DATE),
            this.bedrag.toString(),
            this.omschrijving,
            this.betalingsSoort.toString(),
            this.bron.naam,
            this.bestemming.naam,
        )
    }

//    enum class BetalingsSoort {
//        INKOMSTEN, UITGAVEN, AFLOSSEN_LENING, AFLOSSEN_CREDICARD,
//        BESTEDEN_RESERVERING, OPNEMEN_SPAARGELD, STORTEN_SPAARGELD, OPNEMEN_CONTANT_GELD
//    }

    enum class BetalingsSoort(
        val omschrijving: String
    ) {
        INKOMSTEN("Inkomsten"),
        UITGAVEN("Uitgaven"),
        AANGAAN_LENING("aangaan_lening"),
        AFLOSSEN_LENING("aflossen_lening"),
        AFLOSSEN_CREDICARD("aflossen_credicard"),
        BESTEDEN_RESERVERING("besteden_reservering"),
        OPNEMEN_SPAARREKENING("opnemen_spaarrekening"),
        STORTEN_SPAARREKENING("storten_spaarrekening"),
        OPNEMEN_CONTANT_GELD("opnemen_contant_geld")
    }
}