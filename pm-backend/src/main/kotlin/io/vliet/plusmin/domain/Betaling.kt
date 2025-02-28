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
    @Column(columnDefinition = "TEXT")
    val omschrijving: String,
    @Column(columnDefinition = "TEXT")
    val ocrOmschrijving: String,
    val isGevalideerd: Boolean = false,
    @Enumerated(EnumType.STRING)
    val betalingsSoort: BetalingsSoort,
    @ManyToOne
    @JoinColumn(name = "bron_id", referencedColumnName = "id")
    val bron: Rekening,
    @ManyToOne
    @JoinColumn(name = "bestemming_id", referencedColumnName = "id")
    val bestemming: Rekening,
    @ManyToOne
    @JoinColumn(name = "budget_id", referencedColumnName = "id")
    val budget: Budget? = null,
) {
    companion object {
        val sortableFields = setOf("id", "boekingsdatum", "status")
    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        boekingsdatum: LocalDate = this.boekingsdatum,
        bedrag: BigDecimal = this.bedrag,
        omschrijving: String = this.omschrijving,
        ocrOmschrijving: String = this.ocrOmschrijving,
        isGevalideerd: Boolean = this.isGevalideerd,
        betalingsSoort: BetalingsSoort = this.betalingsSoort,
        bron: Rekening = this.bron,
        bestemming: Rekening = this.bestemming,
        budget: Budget? = this.budget
    ) = Betaling(this.id, gebruiker, boekingsdatum, bedrag, omschrijving, ocrOmschrijving, isGevalideerd, betalingsSoort, bron, bestemming, budget)

    data class BetalingDTO(
        val id: Long = 0,
        val boekingsdatum: String,
        val bedrag: String,
        val omschrijving: String,
        val ocrOmschrijving: String,
        val isGevalideerd: Boolean = false,
        val betalingsSoort: String,
        val bron: String,
        val bestemming: String,
        val budgetNaam: String? = null
    )

    fun toDTO(): BetalingDTO {
        return BetalingDTO(
            this.id,
            this.boekingsdatum.format(DateTimeFormatter.ISO_LOCAL_DATE),
            this.bedrag.toString(),
            this.omschrijving,
            this.ocrOmschrijving,
            this.isGevalideerd,
            this.betalingsSoort.toString(),
            this.bron.naam,
            this.bestemming.naam,
            this.budget?.budgetNaam
        )
    }

    data class BetalingOcrValidatie(
        val boekingsdatum: String,
        val bedrag: BigDecimal,
        val ocrOmschrijving: String?,
        val bestaatAl: Boolean? = false,
    ) {
        fun fullCopy(
            boekingsdatum: String = this.boekingsdatum,
            bedrag: BigDecimal = this.bedrag,
            ocrOmschrijving: String? = this.ocrOmschrijving,
            bestaatAl: Boolean? = this.bestaatAl
        ) = BetalingOcrValidatie(boekingsdatum, bedrag, ocrOmschrijving, bestaatAl)
    }


    data class BetalingOcrValidatieWrapper(
        val laatsteBetalingDatum: LocalDate?,
        val saldoOpLaatsteBetalingDatum: Saldo.SaldoDTO,
        val betalingen: List<BetalingOcrValidatie>,
    )

    enum class BetalingsSoort(
        val omschrijving: String
    ) {
        INKOMSTEN("Inkomsten"),
        RENTE("Rente"),
        UITGAVEN("Uitgaven"),
        LENEN("lenen"),
        AFLOSSEN("aflossen"),
        TOEVOEGEN_RESERVERING("toevoegen_reservering"),
        BESTEDEN_RESERVERING("besteden_reservering"),
        INCASSO_CREDITCARD("incasso_creditcard"),
        OPNEMEN_SPAARREKENING("opnemen_spaarrekening"),
        STORTEN_SPAARREKENING("storten_spaarrekening"),
        OPNEMEN_CONTANT("opnemen_contant"),
        STORTEN_CONTANT("storten_contant")
    }

}