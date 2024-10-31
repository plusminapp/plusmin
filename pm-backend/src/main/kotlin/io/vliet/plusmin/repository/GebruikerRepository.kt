package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Gebruiker

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface GebruikerRepository : JpaRepository<Gebruiker, String> {
    fun findByEmail(email: String): Optional<Gebruiker>
}
