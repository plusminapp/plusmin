package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Aflossing.AflossingDTO
import io.vliet.plusmin.repository.AflossingRepository
import io.vliet.plusmin.service.AflossingGrafiekService
import io.vliet.plusmin.service.AflossingService
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/aflossing")
class AflossingController {
    @Autowired
    lateinit var aflossingRepository: AflossingRepository

    @Autowired
    lateinit var aflossingService: AflossingService

    @Autowired
    lateinit var aflossingGrafiekService: AflossingGrafiekService

    @Autowired
    lateinit var gebruikerController: GebruikerController

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @Operation(summary = "GET de aflossingen van een hulpvrager")
    @GetMapping("/hulpvrager/{hulpvragerId}")
    fun getAflossingenVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET AflossingController.getAflossingenVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(aflossingRepository.findAflossingenVoorGebruiker(hulpvrager))
    }

    @Operation(summary = "GET het totale aflossingsbedrag van een hulpvrager")
    @GetMapping("/hulpvrager/{hulpvragerId}/aflossingsbedrag")
    fun getAflossingsbedragVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET AflossingController.getAflossingenVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        val aflossingsBedrag = aflossingRepository.findAflossingenVoorGebruiker(hulpvrager)
            .fold(BigDecimal(0)) { acc, aflossing -> acc + aflossing.aflossingsBedrag }
        return ResponseEntity.ok().body(aflossingsBedrag)
    }

    @Operation(summary = "GET de saldi aflossingen van een hulpvrager op datum")
    @GetMapping("/hulpvrager/{hulpvragerId}/datum/{datum}")
    fun getAflossingenSaldiVoorHulpvragerOpDatum(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @PathVariable("datum") datum: String,
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET AflossingController.getAflossingenSaldiVoorHulpvragerOpDatum voor ${hulpvrager.email} op ${datum} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(aflossingService.berekenAflossingenOpDatum(hulpvrager, datum))
    }

    @Operation(summary = "PUT (upsert) (nieuwe) aflossingen van een hulpvrager")
    @PutMapping("/hulpvrager/{hulpvragerId}")
    fun creeerNieuweaflossingVoorHulpvrager(
        @Valid @RequestBody aflossingList: List<AflossingDTO>,
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("PUT AflossingController.creeerNieuweaflossingVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(aflossingService.creeerAflossingen(hulpvrager, aflossingList))
    }

    @Operation(summary = "GET de Aflossing GrafiekSeries voor hulpvrager")
    @GetMapping("/hulpvrager/{hulpvragerId}/series")
    fun getAflossingenGrafiekSeriesVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET AflossingController.getAflossingenSeriesVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(aflossingGrafiekService.genereerAflossingGrafiekSeries(hulpvrager))
    }

    @Operation(summary = "GET de Aflossing GrafiekData voor hulpvrager")
    @GetMapping("/hulpvrager/{hulpvragerId}/data")
    fun getAflossingenGrafiekDataVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET AflossingController.getAflossingenDataVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(aflossingGrafiekService.genereerAflossingGrafiekData(hulpvrager))
    }

    @Operation(summary = "GET de Aflossing GrafiekDataen GrafiekSerie voor hulpvrager")
    @GetMapping("/hulpvrager/{hulpvragerId}/aflossinggrafiek")
    fun getAflossingenGrafiekDTOVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long
    ): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET AflossingController.getAflossingenDataVoorHulpvrager voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return ResponseEntity.ok().body(
            AflossingGrafiekService.AflossingGrafiekDTO(
                aflossingGrafiekSerie = aflossingGrafiekService.genereerAflossingGrafiekSeries(hulpvrager),
                aflossingGrafiekData = aflossingGrafiekService.genereerAflossingGrafiekData(hulpvrager),
            ),

            )
    }
}

