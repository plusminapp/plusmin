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
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.security.authorization.AuthorizationResult
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.resource.NoResourceFoundException

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
    @GetMapping("")
    fun getAlleGebruikers(): List<GebruikerDTO> {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.getAlleGebruikers() voor gebruiker ${gebruiker.email} met rollen ${gebruiker.roles}.")
        return gebruikerRepository.findAll().map { it.toDTO() }
    }

    // Iedereen mag de eigen gebruiker (incl. eventueel gekoppelde hulpvragers) opvragen; ADMIN krijgt iedereen terug als hulpvrager
    @Operation(summary = "GET de gebruiker incl. eventuele hulpvragers op basis van de JWT van een gebruiker")
    @GetMapping("/zelf")
    fun findGebruikerInclusiefHulpvragers(): GebruikerMetHulpvragersDTO {
        val gebruiker = getJwtGebruiker()
        logger.info("GET GebruikerController.findHulpvragersVoorVrijwilliger() voor vrijwilliger ${gebruiker.email}.")
        val hulpvragers = if (gebruiker.roles.contains(Gebruiker.Role.ROLE_ADMIN)) {
            gebruikerRepository.findAll().filter { it.id != gebruiker.id }
        } else {
            gebruikerRepository.findHulpvragersVoorVrijwilliger(gebruiker)
        }
        return GebruikerMetHulpvragersDTO(gebruiker.toDTO(), hulpvragers.map { it.toDTO() })
    }

    @Throws(AuthorizationDeniedException::class)
    @PostMapping("")
    fun creeerNieuweGebruiker(@Valid @RequestBody gebruikerList: List<GebruikerDTO>): List<Gebruiker> {
        val gebruiker = getJwtGebruiker()
        logger.info("POST GebruikerController.creeerNieuweGebruiker() door vrijwilliger ${gebruiker.email}: " +
                gebruikerList.map { it.email }.joinToString { ", " })
        if (gebruiker.roles.contains(Gebruiker.Role.ROLE_COORDINATOR)) {
            throw AuthorizationDeniedException(
                "${gebruiker.email} wil nieuwe gebruikers ${
                    gebruikerList.map { it.email }.joinToString { ", " }
                } aanmaken maar is geen coördinator.") { false }
        }
        return gebruikerService.saveAll(gebruikerList)
    }

    fun getJwtGebruiker(): Gebruiker {
        val jwt = SecurityContextHolder.getContext().authentication.principal as Jwt
        val email = jwt.claims["username"] as String
        val gebruikerOpt = gebruikerRepository.findByEmail(email)
        return if (gebruikerOpt.isPresent) {
            logger.info("getJwtGebruiker met email: ${email} gevonden.")
            gebruikerOpt.get()
        } else {
            logger.error("GET /gebruiker met email: ${email} bestaat nog niet")
            throw IllegalStateException("Gebruiker met email ${email} bestaat nog niet")
        }
    }

    @Throws(AuthorizationDeniedException::class)
    fun checkAccess(hulpvragerId: Long): Pair<Gebruiker, Gebruiker> {
        val hulpvragerOpt = gebruikerRepository.findById(hulpvragerId)
        if (hulpvragerOpt.isEmpty)
            throw NoResourceFoundException(HttpMethod.HEAD, "Hulpvrager met Id $hulpvragerId bestaat niet.")
        val hulpvrager = hulpvragerOpt.get()

        val vrijwilliger = getJwtGebruiker()
        if (hulpvrager.id != vrijwilliger.id &&
            hulpvrager.vrijwilliger?.id != vrijwilliger.id &&
            !vrijwilliger.roles.contains(Gebruiker.Role.ROLE_ADMIN)
        ) {
            logger.error("${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}")
            throw AuthorizationDeniedException(
                "${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}"
            ) { false }
        }
        return Pair(hulpvrager, vrijwilliger)
    }
}

data class GebruikerMetHulpvragersDTO(
    val gebruiker: GebruikerDTO,
    val hulpvragers: List<GebruikerDTO>
)
