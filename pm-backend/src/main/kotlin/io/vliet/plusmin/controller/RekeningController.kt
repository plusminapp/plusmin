package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Rekening
import io.vliet.plusmin.domain.Rekening.RekeningDTO
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.service.RekeningService
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/rekening")
class RekeningController {
    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var rekeningService: RekeningService

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var gebruikerController: GebruikerController

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    // Iedereen mag de eigen rekening opvragen
    @Operation(summary = "GET de eigen rekeningen op basis van de JWT")
    @GetMapping("/")
    fun findRekeningen(): List<Rekening> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET RekeningController.findRekeningen() voor gebruiker ${gebruiker.email}.")
        return rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
    }

    @Operation(summary = "GET de rekening op basis van de JWT van een rekening")
    @GetMapping("/hulpvrager/{hulpvragerId}")
    fun getAlleRekeningenVoorHulpvrager(
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
        logger.info("GET BetalingController.getAlleRekeningenVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(rekeningRepository.findRekeningenVoorGebruiker(hulpvrager))
    }

    // Nieuwe eigen rekeningen
    @PostMapping("")
    fun creeerNieuweRekening(@Valid @RequestBody rekeningList: List<RekeningDTO>): List<RekeningDTO> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        return rekeningService.saveAll(gebruiker, rekeningList)
    }
}
