package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Rekening
import io.vliet.plusmin.domain.Saldi
import io.vliet.plusmin.domain.Saldi.SaldiDTO
import io.vliet.plusmin.repository.SaldiRepository
import io.vliet.plusmin.service.SaldiService
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/saldi")
class SaldiController {
    @Autowired
    lateinit var saldiRepository: SaldiRepository

    @Autowired
    lateinit var saldiService: SaldiService

    @Autowired
    lateinit var gebruikerController: GebruikerController

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    // Iedereen mag de eigen saldi opvragen
    @Operation(summary = "GET de eigen saldi op basis van de JWT")
    @GetMapping("/")
    fun getSaldi(): List<Saldi> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET SaldiController.findSaldi() voor gebruiker ${gebruiker.email}.")
        return saldiRepository.findSaldiVoorGebruiker(gebruiker)
    }

    @Operation(summary = "GET de eigen laatste openingssaldi (dus huidige periode) op basis van de JWT")
    @GetMapping("/opening")
    fun getOpeningsSaldi(): ResponseEntity<Any> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET SaldiController.getOpeningsSaldi() voor gebruiker ${gebruiker.email}.")
        val openingsSaldi = saldiService.getOpeningSaldi(gebruiker)
        return ResponseEntity.ok(toSaldiResponse(openingsSaldi))
    }

    @Operation(summary = "GET de eigen saldi op datum op basis van de JWT")
    @GetMapping("/{datum}")
    fun getSaldiOpDatum(@PathVariable("datum") datum: String): SaldiResponse {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET SaldiController.getSaldiOpDatum() voor gebruiker ${gebruiker.email}.")
        return toSaldiResponse(
            saldiService.getSaldiOpDatum(
                gebruiker,
                LocalDate.parse(datum, DateTimeFormatter.ISO_LOCAL_DATE)
            )
        )
    }

    @Operation(summary = "GET de eigen stand op datum op basis van de JWT")
    @GetMapping("/stand/{datum}")
    fun getStandOpDatum(@PathVariable("datum") datum: String): SaldiService.StandDTO {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET SaldiController.getStandOpDatum() voor gebruiker ${gebruiker.email}.")
        return saldiService.getStandOpDatum(
                gebruiker,
                LocalDate.parse(datum, DateTimeFormatter.ISO_LOCAL_DATE)
            )
    }

    @Operation(summary = "GET de eigen stand op datum op basis van de JWT")
    @GetMapping("/hulpvrager/{hulpvragerId}/stand/{datum}")
    fun getStandOpDatumVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @PathVariable("datum") datum: String,
    ): SaldiService.StandDTO {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET SaldiController.getStandOpDatumVoorHulpvrager() voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return saldiService.getStandOpDatum(
                hulpvrager,
                LocalDate.parse(datum, DateTimeFormatter.ISO_LOCAL_DATE)
            )
    }

    fun toSaldiResponse(saldi: Saldi): SaldiResponse {
        val saldoResponseLijst = saldi.saldi.map { SaldoResponse(it.rekening.toDTO(), it.bedrag) }
        return SaldiResponse(saldi.datum.format(DateTimeFormatter.ISO_LOCAL_DATE), saldoResponseLijst)
    }

    data class SaldiResponse(
        val datum: String,
        val saldi: List<SaldoResponse>
    )

    data class SaldoResponse(
        val rekening: Rekening.RekeningDTO,
        val bedrag: BigDecimal
    )
}

