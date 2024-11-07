package io.vliet.plusmin.controller

import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.service.BetalingService
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import org.apache.commons.io.input.BOMInputStream
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.BufferedReader
import java.io.InputStreamReader

@RestController
@RequestMapping("/betalingen")

class BetalingController {

    @Autowired
    lateinit var gebruikerController: GebruikerController

    @Autowired
    lateinit var betalingRepository: BetalingRepository

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var betalingService: BetalingService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @GetMapping("")
    fun getAlleBetalingen(): ResponseEntity<List<Betaling>> {
        // TODO pagineren, min/max datum
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET BetalingController.getAlleBetalingen voor ${gebruiker.email}")
        return ResponseEntity.ok().body(betalingRepository.findAllByGebruiker(gebruiker))
    }

    @RolesAllowed("VRIJWILLIGER")
    @GetMapping("/{hulpvragerId}")
    fun getAlleBetalingenVanHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
    ): ResponseEntity<Any> {
        // TODO pagineren, min/max datum
        val vrijwilliger = gebruikerController.getJwtGebruiker()
        val hulpvragerOpt = gebruikerRepository.findById(hulpvragerId)
        if (hulpvragerOpt.isEmpty)
            return ResponseEntity("Hulpvrager met Id ${hulpvragerId} bestaat niet.", HttpStatus.NOT_FOUND)
        val hulpvrager = hulpvragerOpt.get()
        if (hulpvrager.id != vrijwilliger.id && hulpvrager.vrijwilliger?.id != vrijwilliger.id) {
            logger.error("${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}")
            return ResponseEntity(
                "${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}",
                HttpStatus.UNAUTHORIZED
            )
        }
        logger.info("GET BetalingController.getAlleBetalingen voor ${vrijwilliger.email}")
        return ResponseEntity.ok().body(betalingRepository.findAllByGebruiker(hulpvrager))
    }

    @RolesAllowed("ADMIN")
    @DeleteMapping("")
    fun deleteAlleBetalingen(): ResponseEntity<Any> {
        return ResponseEntity.ok().body(betalingRepository.deleteAll())
    }

    @PostMapping("")
    fun creeerNieuweBetaling(@Valid @RequestBody betalingList: List<Betaling>): List<Betaling> =
        betalingRepository.saveAll(betalingList)

    @PostMapping("/camt053/{gebruikersId}", consumes = ["multipart/form-data"])
    fun verwerkCamt053(
        @PathVariable("gebruikersId") gebruikersId: Long,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Any> {
        logger.info("camt053 voor gebruiker ${gebruikersId}")
        if (file.size > 4000000)
            return ResponseEntity(HttpStatus.PAYLOAD_TOO_LARGE)
        val gebruikerOpt = gebruikerRepository.findById(gebruikersId)
        if (gebruikerOpt.isPresent) {
            logger.info("camt053 voor gebruiker ${gebruikersId} is aanwezig")
            betalingService.loadCamt053File(
                gebruikerOpt.get(),
                BufferedReader(
                    InputStreamReader(
                        BOMInputStream.builder()
                            .setInputStream(file.inputStream)
                            .get()
                    )
                )
            )
            return ResponseEntity(HttpStatus.OK)
        }
        return ResponseEntity(HttpStatus.NOT_FOUND)
    }
}
