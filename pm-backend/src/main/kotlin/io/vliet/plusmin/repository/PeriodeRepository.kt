package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Periode
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface PeriodeRepository : JpaRepository<Periode, Long> {

    /*  Haalt de Periode voor een gebruiker op waar datum in valt */
    @Query(
        value = "SELECT * FROM periode p WHERE p.gebruiker_id = :gebruikerId AND p.periode_start_datum = " +
                "(SELECT MAX(periode_start_datum) FROM periode p " +
                "WHERE p.gebruiker_id = :gebruikerId AND p.periode_start_datum <= :datum)",
        nativeQuery = true)
    fun getPeriodeGebruikerEnDatum(gebruikerId: Long, datum: LocalDate): Optional<Periode>

    /*  Haalt de laatste Periode voor een gebruiker op */
    @Query(
        value = "SELECT * FROM periode p WHERE p.gebruiker_id = :gebruikerId AND p.periode_start_datum = " +
                "(SELECT MAX(periode_start_datum) FROM periode p WHERE p.gebruiker_id = :gebruikerId)",
        nativeQuery = true)
    fun getLaatstePeriodeGebruiker(gebruikerId: Long): Optional<Periode>

    @Query(value = "SELECT p FROM Periode p WHERE p.gebruiker = :gebruiker")
    fun getPeriodesVoorGebruiker(gebruiker: Gebruiker): List<Periode>
}
