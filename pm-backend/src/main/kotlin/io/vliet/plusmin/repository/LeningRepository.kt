package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Lening
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface LeningRepository : JpaRepository<Lening, Long> {
    @Query(
        value = "SELECT l FROM Lening l " +
                "JOIN rekening r ON r = l.rekening " +
                "WHERE r.gebruiker = :gebruiker"
    )
    fun findLeningenVoorGebruiker(gebruiker: Gebruiker): List<Lening>

    @Query(
        value = "SELECT l FROM Lening l " +
                "JOIN rekening r ON r = l.rekening " +
                "WHERE r.gebruiker = :gebruiker AND r.naam = :rekeningNaam"
    )
    fun findLeningVoorRekeningNaam(gebruiker: Gebruiker, rekeningNaam: String): Lening?
}