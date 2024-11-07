package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.repository.GebruikerRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service

@Service
class GebruikerDetailsService(
    private val gebruikerRepository: GebruikerRepository
) : UserDetailsService {

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    override fun loadUserByUsername(username: String): UserDetails {
        val gebruikerOpt = gebruikerRepository.findByEmail(username)
        return if (gebruikerOpt.isPresent) {
            gebruikerOpt.get()
        } else {
            logger.info("In loadUserByUsername ${username} NIET gevonden")
            gebruikerRepository.save(Gebruiker(email = username))
        }
    }
}
