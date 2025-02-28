package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Betaling.BetalingsSoort
import io.vliet.plusmin.domain.Gebruiker
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface BetalingRepository : JpaRepository<Betaling, Long> {
    override fun findAll(): List<Betaling>
    fun findAllByGebruiker(gebruiker: Gebruiker): List<Betaling>

    @Query(value = "SELECT b FROM Betaling b WHERE b.id = :id")
    fun findById2(id: Long): Betaling?

    @Query(
        value = "SELECT b FROM Betaling b " +
                "WHERE b.gebruiker = :gebruiker AND " +
                "b.boekingsdatum <= :datum"
    )
    fun findAllByGebruikerOpDatum(gebruiker: Gebruiker, datum: LocalDate): List<Betaling>

    @Query(
        value = "SELECT b FROM Betaling b " +
                "WHERE b.gebruiker = :gebruiker AND " +
                "b.boekingsdatum >= :openingsDatum AND " +
                "b.boekingsdatum <= :eindDatum"
    )
    fun findAllByGebruikerTussenDatums(
        gebruiker: Gebruiker,
        openingsDatum: LocalDate,
        eindDatum: LocalDate
    ): List<Betaling>

    @Query(
        value = "SELECT b FROM Betaling b " +
                "WHERE b.gebruiker = :gebruiker AND " +
                "b.boekingsdatum = :boekingsdatum AND " +
                "b.bedrag = :bedrag AND " +
                "b.omschrijving = :omschrijving AND " +
                "b.betalingsSoort = :betalingsSoort"
    )
    fun findMatchingBetaling(
        gebruiker: Gebruiker,
        boekingsdatum: LocalDate,
        bedrag: BigDecimal,
        omschrijving: String,
        betalingsSoort: BetalingsSoort
    ): List<Betaling>

    @Query(
        value = "SELECT b FROM Betaling b " +
                "WHERE b.gebruiker = :gebruiker AND " +
                "b.boekingsdatum = :boekingsdatum AND " +
                "b.bedrag = :bedrag"
    )
    fun findVergelijkbareBetalingen(
        gebruiker: Gebruiker,
        boekingsdatum: LocalDate,
        bedrag: BigDecimal,
        ): List<Betaling>

    @Query(
        value = "SELECT b FROM Betaling b " +
                "WHERE b.gebruiker = :gebruiker AND " +
                "b.boekingsdatum = (SELECT MAX(b2.boekingsdatum) FROM Betaling b2 WHERE b2.gebruiker = :gebruiker)"
    )
    fun findLaatsteBetaling(gebruiker: Gebruiker): List<Betaling>
}
