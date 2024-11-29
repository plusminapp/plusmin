package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Gebruiker.GebruikerDTO
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.service.GebruikerService
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/gebruiker")
class GebruikerController {
    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var gebruikerService: GebruikerService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @Operation(summary = "GET alle gebruikers (alleen voor de COORDINATOR)")
    @RolesAllowed("COORDINATOR")
    @GetMapping("/")
    fun getAlleGebruikers(): List<Gebruiker> {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.getAlleGebruikers() voor gebruiker ${gebruiker.email} met rollen ${gebruiker.roles}.")
        return gebruikerRepository.findAll()
    }

    // Iedereen mag de eigen gebruiker (incl. eventueel gekoppelde hulpvragers) opvragen
    @Operation(summary = "GET de gebruiker incl. eventuele hulpvragers op basis van de JWT van een gebruiker")
    @GetMapping("/zelf")
    fun findGebruikerInclusiefHulpvragers(): GebruikerMetHulpvragersDTO {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.findHulpvragersVoorVrijwilliger() voor vrijwilliger ${gebruiker.email}.")
        val hulpvragers = gebruikerRepository.findHulpvragersVoorVrijwilliger(gebruiker).map {it.toDTO()}

        return GebruikerMetHulpvragersDTO(gebruiker, hulpvragers)
    }

    @PostMapping("")
    fun creeerNieuweGebruiker(@Valid @RequestBody gebruikerList: List<GebruikerDTO>): List<Gebruiker> =
        gebruikerService.saveAll(gebruikerList)

    fun getJwtGebruiker(): Gebruiker {
        val jwt = SecurityContextHolder.getContext().authentication.principal as Jwt
        val email = jwt.claims["username"] as String
        val gebruikerOpt = gebruikerRepository.findByEmail(email)
        return if (gebruikerOpt.isPresent) {
            logger.info("getJwtGebruiker met email: ${email} gevonden ${gebruikerOpt.get().rekeningen.map { it.naam }}")
            gebruikerOpt.get()
        } else {
            logger.error("GET /gebruiker met email: ${email} bestaat nog niet")
            throw IllegalStateException("Gebruiker met email ${email} bestaat nog niet")
        }
    }
}

data class GebruikerMetHulpvragersDTO (
    val gebruiker: Gebruiker,
    val hulpvragers: List<GebruikerDTO>
)
