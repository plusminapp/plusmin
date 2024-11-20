package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.repository.GebruikerRepository
import jakarta.annotation.security.RolesAllowed
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/gebruiker")

class GebruikerController {
    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @Operation(summary = "GET alle gebruikers (alleen voor de COORDINATOR)")
    @RolesAllowed("COORDINATOR")
    @GetMapping("/")
    fun getAlleGebruikers(): List<GebruikerDTO> {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.getAlleGebruikers() voor gebruiker ${gebruiker.email} met rollen ${gebruiker.roles}.")
        return gebruikerRepository.findAll().map {it.toDTO()}
    }

    // Iedereen mag de eigen gebruiker opvragen
    @Operation(summary = "GET de gebruiker op basis van de JWT (alle gebruikers)")
    @GetMapping("/jwt")
    fun getEigenJwtGebruiker(): GebruikerDTO {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.getEigenJwtGebruiker() voor gebruiker ${gebruiker.email}.")
        return gebruiker.toDTO()
    }

    @Operation(summary = "GET de hulpvragers op basis van de JWT van een vrijwilliger")
    @RolesAllowed("VRIJWILLIGER")
    @GetMapping("/hulpvrager")
    fun findHulpvragersVoorVrijwilliger(): List<GebruikerDTO> {
        val vrijwilliger = getJwtGebruiker()
        logger.info("GET GebruikerController.findHulpvragersVoorVrijwilliger() voor vrijwilliger ${vrijwilliger.email}.")
        return gebruikerRepository.findHulpvragersVoorVrijwilliger(vrijwilliger).map {it.toDTO()}
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

data class GebruikerDTO (
    val id: Long = 0,
    val email: String,
    val bijnaam: String = "Gebruiker zonder bijnaam :-)",
    val pseudoniem: String = "Nog in te stellen pseudoniem",
    val roles: List<String> = emptyList(),
    val vrijwilliger: String = "",
    val vrijwilligerbijnaam: String = ""
) {}
