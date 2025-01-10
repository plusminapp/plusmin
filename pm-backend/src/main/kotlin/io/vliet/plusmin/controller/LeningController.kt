package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import io.vliet.plusmin.repository.LeningRepository
import io.vliet.plusmin.domain.Lening.LeningDTO
import io.vliet.plusmin.service.LeningService
import jakarta.validation.Valid

@RestController
@RequestMapping("/lening")
class LeningController {
    @Autowired
    lateinit var leningRepository: LeningRepository

    @Autowired
    lateinit var leningService: LeningService

    @Autowired
    lateinit var gebruikerController: GebruikerController

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @Operation(summary = "GET de leningen van een hulpvrager")
    @GetMapping("/hulpvrager/{hulpvragerId}")
    fun getLeningenVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET LeningController.getLeningenVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(leningRepository.findLeningenVoorGebruiker(hulpvrager))
    }

    @Operation(summary = "GET de saldi leningen van een hulpvrager op datum")
    @GetMapping("/hulpvrager/{hulpvragerId}/datum/{datum}")
    fun getLeningenSaldiVoorHulpvragerOpDatum(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @PathVariable("datum") datum: String,
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET LeningController.getLeningenSaldiVoorHulpvragerOpDatum voor ${hulpvrager.email} op ${datum} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(leningService.berekenLeningDTOOpDatum (hulpvrager, datum))
    }

    @Operation(summary = "PUT (upsert) (nieuwe) leningen van een hulpvrager")
    @PutMapping("/hulpvrager/{hulpvragerId}")
    fun creeerNieuweleningVoorHulpvrager(
        @Valid @RequestBody leningList: List<LeningDTO>,
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any>  {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("POST BetalingController.creeerNieuweleningVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(leningService.saveAll(hulpvrager, leningList))
    }
}

