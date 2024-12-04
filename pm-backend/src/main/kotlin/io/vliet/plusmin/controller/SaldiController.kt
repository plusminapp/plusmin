package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Saldi
import io.vliet.plusmin.domain.Saldi.SaldiDTO
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.SaldiRepository
import io.vliet.plusmin.service.SaldiService
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/saldi")
class SaldiController {
    @Autowired
    lateinit var saldiRepository: SaldiRepository

    @Autowired
    lateinit var saldiService: SaldiService

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var gebruikerController: GebruikerController

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    // Iedereen mag de eigen saldi opvragen
    @Operation(summary = "GET de eigen saldi op basis van de JWT")
    @GetMapping("/")
    fun findSaldi(): List<Saldi> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET SaldiController.findSaldi() voor gebruiker ${gebruiker.email}.")
        return saldiRepository.findSaldiVoorGebruiker(gebruiker)
    }

    @Operation(summary = "GET de saldi op basis van de JWT van een saldi")
    @GetMapping("/hulpvrager/{hulpvragerId}")
    fun getAlleSaldiVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any> {
        val hulpvragerOpt = gebruikerRepository.findById(hulpvragerId)
        if (hulpvragerOpt.isEmpty)
            return ResponseEntity("Hulpvrager met Id $hulpvragerId bestaat niet.", HttpStatus.NOT_FOUND)
        val hulpvrager = hulpvragerOpt.get()

        val vrijwilliger = gebruikerController.getJwtGebruiker()
        if (hulpvrager.id != vrijwilliger.id && hulpvrager.vrijwilliger?.id != vrijwilliger.id) {
            logger.error("${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}")
            return ResponseEntity(
                "${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}",
                HttpStatus.UNAUTHORIZED
            )
        }
        logger.info("GET BetalingController.getAlleSaldiVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(saldiRepository.findSaldiVoorGebruiker(hulpvrager))
    }

    // Nieuwe eigen saldi
    @PostMapping("")
    fun creeerNieuweSaldi(@Valid @RequestBody saldiList: List<SaldiDTO>): List<SaldiDTO> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        return saldiService.saveAll(gebruiker, saldiList)
    }
}

