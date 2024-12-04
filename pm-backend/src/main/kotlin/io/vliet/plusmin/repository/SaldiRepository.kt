package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Saldi
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface SaldiRepository : JpaRepository<Saldi, Long> {
    @Query(value = "SELECT s FROM Saldi s WHERE s.gebruiker = :gebruiker")
    fun findSaldiVoorGebruiker(gebruiker: Gebruiker): List<Saldi>

    @Query(value = "SELECT s FROM Saldi s WHERE s.gebruiker = :gebruiker AND s.datum = " +
            "(SELECT MAX(datum) FROM Saldi WHERE datum < :datum)")
    fun getOpeningsSaldiVoorDatum(gebruiker: Gebruiker, datum: LocalDate): Optional<Saldi>

    @Query(value = "SELECT s FROM Saldi s WHERE s.gebruiker = :gebruiker and s.datum = :datum")
    fun findSaldiGebruikerEnDatum(gebruiker: Gebruiker, datum: LocalDate): Optional<Saldi>
}
