package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Rekening
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface BetalingRepository : JpaRepository<Betaling, Long> {
    override fun findAll(): List<Betaling>
    fun findAllByGebruiker(gebruiker: Gebruiker): List<Betaling>

    @Query(value = "SELECT b FROM Betaling b " +
            "JOIN gebruiker g ON g = b.gebruiker " +
            "WHERE b.gebruiker = :gebruiker AND " +
//            "b.bedrag = :dto.bedrag AND " +
            "b.omschrijving = :dto")
    fun findBetalingGebruikerEnDto(gebruiker: Gebruiker, dto: String): List<Betaling>
}
