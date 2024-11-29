package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Gebruiker
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
    fun getAlleGebruikers(): List<GebruikerDTO> {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.getAlleGebruikers() voor gebruiker ${gebruiker.email} met rollen ${gebruiker.roles}.")
        return gebruikerRepository.findAll().map {it.toDTO()}
    }

    // Iedereen mag de eigen gebruiker (incl. eventueel gekoppelde hulpvragers) opvragen
    @Operation(summary = "GET de gebruiker incl. eventuele hulpvragers op basis van de JWT van een gebruiker")
    @GetMapping("/zelf")
    fun findGebruikerInclusiefHulpvragers(): GebruikerMetHulpvragersDTO {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.findHulpvragersVoorVrijwilliger() voor vrijwilliger ${gebruiker.email}.")
        val hulpvragers = gebruikerRepository.findHulpvragersVoorVrijwilliger(gebruiker).map {it.toDTO()}
        return GebruikerMetHulpvragersDTO(gebruiker.toDTO(), hulpvragers)
    }

    @PostMapping("")
    fun creeerNieuweGebruiker(@Valid @RequestBody gebruikerList: List<GebruikerDTO>): List<GebruikerDTO> =
        gebruikerService.saveAll(gebruikerList)

    fun getJwtGebruiker(): Gebruiker {
        val jwt = SecurityContextHolder.getContext().authentication.principal as Jwt
        val email = jwt.claims["username"] as String
        val gebruikerOpt = gebruikerRepository.findByEmail(email)
        return if (gebruikerOpt.isPresent) {
            logger.debug("getJwtGebruiker met email: ${email} gevonden")
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
    val roles: List<String> = emptyList(),
    val vrijwilliger: String = "",
    val vrijwilligerbijnaam: String = ""
) {}

data class GebruikerMetHulpvragersDTO (
    val gebruiker: GebruikerDTO,
    val hulpvragers: List<GebruikerDTO>
)
