package io.vliet.plusmin.controller

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.repository.GebruikerRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class GebruikerController {
    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @GetMapping("/gebruiker")
    fun getGebruikernaam(): Gebruiker {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.getGebruikernaam() voor gebruiker ${gebruiker.email}.")
        return gebruiker
    }

    fun getJwtGebruiker(): Gebruiker {
        val jwt = SecurityContextHolder.getContext().authentication.principal as Jwt
        val email = jwt.claims["username"] as String
        val gebruikerOpt = gebruikerRepository.findByEmail(email)
        return if (gebruikerOpt.isPresent) {
            logger.debug("getGebruiker met email: ${email} gevonden")
            gebruikerOpt.get()
        } else {
            logger.error("GET /gebruiker met email: ${email} bestaat nog niet")
            throw IllegalStateException("Gebruiker met email ${email} bestaat nog niet")
        }
    }
}
