package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Periode
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface PeriodeRepository : JpaRepository<Periode, Long> {
    @Query(value = "SELECT s FROM Periode s WHERE s.gebruiker = :gebruiker")
    fun findPeriodeVoorGebruiker(@Param("gebruiker")gebruiker: Gebruiker): List<Periode>

    /*
        Haalt de meest recente Periode voor een gebruiker op
     */
    @Query(
        value = "SELECT * FROM periode s WHERE s.gebruiker_id = :gebruikerId AND s.periode_start_datum = " +
                "(SELECT MAX(periode_start_datum) FROM periode WHERE gebruiker_id = :gebruikerId)",
        nativeQuery = true
    )
    fun getLaatstePeriodeVoorGebruiker(gebruikerId: Long): Optional<Periode>

    @Query(value = "SELECT s FROM Periode s WHERE s.gebruiker = :gebruiker and s.periodeStartDatum = :datum")
    fun findPeriodeGebruikerEnDatum(gebruiker: Gebruiker, datum: LocalDate): Optional<Periode>
}
