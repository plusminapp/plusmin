package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Saldi
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface SaldiRepository : JpaRepository<Saldi, Long> {
    @Query(value = "SELECT s FROM Saldi s WHERE s.gebruiker = :gebruiker")
    fun findSaldiVoorGebruiker(@Param("gebruiker")gebruiker: Gebruiker): List<Saldi>

    @Query(
        value = "SELECT * FROM saldi s WHERE s.gebruiker_id = :gebruikerId AND s.datum = " +
                "(SELECT MAX(datum) FROM saldi WHERE gebruiker_id = :gebruikerId AND datum < :datum)",
        nativeQuery = true
    )
    fun getOpeningsSaldiVoorDatum(gebruikerId: Long, datum: LocalDate): Optional<Saldi>

    @Query(value = "SELECT s FROM Saldi s WHERE s.gebruiker = :gebruiker and s.datum = :datum")
    fun findSaldiGebruikerEnDatum(gebruiker: Gebruiker, datum: LocalDate): Optional<Saldi>
}
