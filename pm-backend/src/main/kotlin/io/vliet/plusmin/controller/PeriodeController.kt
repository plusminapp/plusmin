package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.vliet.plusmin.domain.Periode.PeriodeDTO
import io.vliet.plusmin.service.PeriodeService
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/periode")
class PeriodeController {

    @Autowired
    lateinit var periodeService: PeriodeService

    @Autowired
    lateinit var gebruikerController: GebruikerController

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @Operation(summary = "GET de stand voor hulpvrager op datum")
    @GetMapping("/hulpvrager/{hulpvragerId}/stand/{datum}")
    fun getStandOpDatumVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @PathVariable("datum") datum: String,
    ): StandDTO {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("GET SaldiController.getStandOpDatumVoorHulpvrager() voor ${hulpvrager.email} door ${vrijwilliger.email}")
        return periodeService.getStandOpDatum(
                hulpvrager,
                LocalDate.parse(datum, DateTimeFormatter.ISO_LOCAL_DATE)
            )
    }

    @Operation(summary = "PUT de saldi voor hulpvrager")
    @PutMapping("/hulpvrager/{hulpvragerId}")
    fun upsertSaldiVoorHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @Valid @RequestBody periodeDTO: PeriodeDTO): ResponseEntity<Any> {
        val (hulpvrager, vrijwilliger) = gebruikerController.checkAccess(hulpvragerId)
        logger.info("PUT SaldiController.getStandOpDatumVoorHulpvrager() voor ${hulpvrager.email} door ${vrijwilliger.email} met datum ${periodeDTO.periodeStartDatum}")
        return ResponseEntity.ok().body(periodeService.upsert(hulpvrager, periodeDTO))
    }

    data class StandDTO(
        val openingsBalans: PeriodeDTO,
        val mutatiesOpDatum: PeriodeDTO,
        val balansOpDatum: PeriodeDTO,
        val resultaatOpDatum: PeriodeDTO
    )
}

