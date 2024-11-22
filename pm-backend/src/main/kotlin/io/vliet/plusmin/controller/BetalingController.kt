package io.vliet.plusmin.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.repository.BetalingDao
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.service.Camt053Service
import io.vliet.plusmin.service.PagingService
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
    lateinit var betalingDao: BetalingDao

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var camt053Service: Camt053Service

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @Operation(summary = "GET alle eigen betalingen (voor alle gebruikers)")
    @GetMapping("")
    fun getAlleBetalingen(
        @RequestParam("size", defaultValue = "25", required = false) sizeAsString: String,
        @RequestParam("page", defaultValue = "0", required = false) pageAsString: String,
        @RequestParam("sort", defaultValue = "boekingsdatum:asc", required = false) sort: String,
        @RequestParam("query", defaultValue = "", required = false) query: String,
        @RequestParam("status", required = false) status: String?,
        @RequestParam("fromDate", defaultValue = "", required = false) fromDate: String,
        @RequestParam("toDate", defaultValue = "", required = false) toDate: String,
        ): ResponseEntity<PagingService.ContentWrapper> {
        val gebruiker = gebruikerController.getJwtGebruiker()
        logger.info("GET BetalingController.getAlleBetalingen voor ${gebruiker.email}")
        val betalingen = betalingDao.search(gebruiker, sizeAsString, pageAsString, sort, query, status, fromDate, toDate)
        return ResponseEntity.ok().body(betalingen)
    }
    @Operation(summary = "Get betalingen hulpvrager", description = "GET alle betalingen van een hulpvrager (alleen voor VRIJWILLIGERs)")
    @RolesAllowed("VRIJWILLIGER", "HULPVRAGER")
    @GetMapping("/{hulpvragerId}")
    fun getAlleBetalingenVanHulpvrager(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @RequestParam("size", defaultValue = "25", required = false) sizeAsString: String,
        @RequestParam("page", defaultValue = "0", required = false) pageAsString: String,
        @RequestParam("sort", defaultValue = "boekingsdatum:asc", required = false) sort: String,
        @RequestParam("query", defaultValue = "", required = false) query: String,
        @RequestParam("status", required = false) status: String?,
        @Parameter(description = "Formaat: yyyy-mm-dd")
        @RequestParam("fromDate", defaultValue = "", required = false) fromDate: String,
        @Parameter(description = "Formaat: yyyy-mm-dd")
        @RequestParam("toDate", defaultValue = "", required = false) toDate: String,
        ): ResponseEntity<Any> {
        val vrijwilliger = gebruikerController.getJwtGebruiker()
        val hulpvragerOpt = gebruikerRepository.findById(hulpvragerId)
        if (hulpvragerOpt.isEmpty)
            return ResponseEntity("Hulpvrager met Id $hulpvragerId bestaat niet.", HttpStatus.NOT_FOUND)
        val hulpvrager = hulpvragerOpt.get()
        if (hulpvrager.id != vrijwilliger.id && hulpvrager.vrijwilliger?.id != vrijwilliger.id) {
            logger.error("${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}")
            return ResponseEntity(
                "${vrijwilliger.email} vraagt toegang tot ${hulpvrager.email}",
                HttpStatus.UNAUTHORIZED
            )
        }
        logger.info("GET BetalingController.getAlleBetalingenVanHulpvrager voor ${hulpvrager.email}")
        val betalingen = betalingDao.search(hulpvrager, sizeAsString, pageAsString, sort, query, status, fromDate, toDate)
        return ResponseEntity.ok().body(betalingen)
    }

    @Operation(summary = "DELETE alle betalingen (alleen voor ADMINs)")
    @RolesAllowed("ADMIN")
    @DeleteMapping("")
    fun deleteAlleBetalingen(): ResponseEntity<Any> {
        return ResponseEntity.ok().body(betalingRepository.deleteAll())
    }

    @PostMapping("")
    fun creeerNieuweBetaling(@Valid @RequestBody betalingList: List<Betaling>): List<Betaling> =
        betalingRepository.saveAll(betalingList)

    @PutMapping("")
    fun wijzigBetaling(@Valid @RequestBody betaling: Betaling): Betaling =
        betalingRepository.save(betaling)

    @Operation(summary = "POST CAMT053 betalingen (voor HULPVRAGERS en VRIJWILLIGERs)")
    @PostMapping("/camt053/{hulpvragerId}", consumes = ["multipart/form-data"])
    fun verwerkCamt053(
        @PathVariable("hulpvragerId") hulpvragerId: Long,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Any> {
        if (file.size > 4000000) {
            logger.warn("BetalingController.verwerkCamt053 bestand te groot voor gebruiker $hulpvragerId")
            return ResponseEntity(HttpStatus.PAYLOAD_TOO_LARGE)
        }
        val hulpvragerOpt = gebruikerRepository.findById(hulpvragerId)
        if (hulpvragerOpt.isEmpty) {
            logger.error("BetalingController.verwerkCamt053: gebruiker $hulpvragerId bestaat niet")
            return ResponseEntity(
                "BetalingController.verwerkCamt053: gebruiker $hulpvragerId bestaat niet",
                HttpStatus.NOT_FOUND
            )
        }
        val hulpvrager = hulpvragerOpt.get()
        val jwtGebruiker = gebruikerController.getJwtGebruiker()
        if (jwtGebruiker.id != hulpvrager.id && jwtGebruiker.id != hulpvrager.vrijwilliger?.id) {
            logger.error("BetalingController.verwerkCamt053: gebruiker ${jwtGebruiker.email} wil een camt053 bestand uploaden voor ${hulpvrager.email}")
            return ResponseEntity(
                "BetalingController.verwerkCamt053: gebruiker ${jwtGebruiker.email} wil een camt053 bestand uploaden voor ${hulpvrager.email}",
                HttpStatus.FORBIDDEN
            )
        }
        logger.info("BetalingController.verwerkCamt053: gebruiker ${jwtGebruiker.email} upload camt053 bestand voor ${hulpvrager.email}")
        val result = camt053Service.loadCamt053File(
            hulpvrager,
            BufferedReader(
                InputStreamReader(
                    BOMInputStream.builder()
                        .setInputStream(file.inputStream)
                        .get()
                )
            )
        )
        return ResponseEntity.ok().body(result)
    }
}
