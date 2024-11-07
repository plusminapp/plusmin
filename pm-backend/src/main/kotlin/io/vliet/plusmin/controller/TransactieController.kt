package io.vliet.plusmin.controller

import io.vliet.plusmin.domain.Transactie
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.TransactieRepository
import io.vliet.plusmin.service.TransactieService
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
@RequestMapping("/transacties")

class TransactieController {
    @Autowired
    lateinit var transactieRepository: TransactieRepository

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var transactieService: TransactieService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @RolesAllowed("ADMIN")
    @GetMapping("")
    fun getAlleTransacties(): ResponseEntity<Any> {
        logger.info("TransactieController.getAlleTransacties")
        return ResponseEntity.ok().body(transactieRepository.findAll())
    }

    @DeleteMapping("")
    fun deleteAlleTransacties(): ResponseEntity<Any> {
        return ResponseEntity.ok().body(transactieRepository.deleteAll())
    }

    @PostMapping("")
    fun creeerNieuweTransactie(@Valid @RequestBody transactieList: List<Transactie>): List<Transactie> =
        transactieRepository.saveAll(transactieList)

    @PostMapping("/camt053/{gebruikersId}", consumes = ["multipart/form-data"])
    fun verwerkCamt053(
        @PathVariable("gebruikersId") gebruikersId: Long,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Any> {
        if (file.size > 4000000)
            return ResponseEntity(HttpStatus.PAYLOAD_TOO_LARGE)
        val gebruikerOpt = gebruikerRepository.findById(gebruikersId)
        if (gebruikerOpt.isPresent) {
            transactieService.loadCamt053File(
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
