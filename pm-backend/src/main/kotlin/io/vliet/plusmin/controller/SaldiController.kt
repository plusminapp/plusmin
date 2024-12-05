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
        logger.info("GET SaldiController.findSaldi() voor gebruiker ${gebruiker.email}.")
        val openingsSaldi = saldiRepository.getOpeningsSaldiVoorDatum(
            gebruiker, LocalDate.now()
        )
        return if (openingsSaldi.isPresent)
            ResponseEntity.ok(toSaldiResponse(openingsSaldi.get()))
        else ResponseEntity.status(404).body("Nog geen openingssaldi beschikbaar")
    }

    @Operation(summary = "GET de eigen saldi op datum op basis van de JWT")
    @GetMapping("/{datum}")
    fun getSaldiOpDatum(@PathVariable("datum") datum: String): SaldiResponse {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET SaldiController.findSaldi() voor gebruiker ${gebruiker.email}.")
        return toSaldiResponse(
            saldiService.getSaldiOpDatum(
                gebruiker,
                LocalDate.parse(datum, DateTimeFormatter.ISO_LOCAL_DATE)
            )
        )
    }

    // Nieuwe eigen saldi
    @PostMapping("")
    fun creeerNieuweSaldi(@Valid @RequestBody saldiDtoLijst: List<SaldiDTO>): List<SaldiDTO> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        return saldiService.saveAll(gebruiker, saldiDtoLijst)
    }

    fun toSaldiResponse(saldi: Saldi): SaldiResponse {
        val saldoResponseLijst = saldi.saldi.map { SaldoResponse(it.rekening.naam, it.bedrag) }
        return SaldiResponse(saldi.datum.format(DateTimeFormatter.ISO_LOCAL_DATE), saldoResponseLijst)
    }

    data class SaldiResponse(
        val datum: String,
        val saldi: List<SaldoResponse>
    )

    data class SaldoResponse(
        val rekening: String,
        val bedrag: BigDecimal
    )
}
