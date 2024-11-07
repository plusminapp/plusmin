package io.vliet.plusmin.controller

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Role
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
        val jwt = SecurityContextHolder.getContext().authentication.principal as Jwt
        val email = jwt.claims["username"] as String
        logger.info("GET /gebruiker met email: ${email}")
        val gebruikerOpt = gebruikerRepository.findByEmail(email)
        return if (gebruikerOpt.isPresent)
            gebruikerOpt.get()
        else {
            logger.info("GET /gebruiker met email: ${email} bestaat nog niet")
            gebruikerRepository.save(Gebruiker(email = email))
        }
    }
}
