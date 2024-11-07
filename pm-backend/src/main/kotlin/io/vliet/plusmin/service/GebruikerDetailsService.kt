package io.vliet.plusmin.service

import io.vliet.plusmin.repository.GebruikerRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class GebruikerDetailsService(
    private val gebruikerRepository: GebruikerRepository
) : UserDetailsService {

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    override fun loadUserByUsername(username: String): UserDetails {
        logger.info("In loadUserByUsername voor ${username}")
        val gebruikerOpt = gebruikerRepository.findByEmail(username)
        return if (gebruikerOpt.isPresent) {
            gebruikerOpt.get()
        } else {
            throw UsernameNotFoundException("Gebruiker niet gevonden")
        }
    }
}
