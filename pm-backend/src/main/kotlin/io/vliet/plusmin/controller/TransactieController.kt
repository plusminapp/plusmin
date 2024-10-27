package io.vliet.plusmin.controller

import io.vliet.plusmin.domain.Transactie
import io.vliet.plusmin.repository.TransactieRepository
import io.vliet.plusmin.service.TransactieService
import jakarta.validation.Valid
import org.apache.commons.io.input.BOMInputStream
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
    lateinit var transactieService: TransactieService

    @GetMapping("")
    fun getAlleTransacties(): ResponseEntity<Any> {
        return ResponseEntity.ok().body(transactieRepository.findAll())
    }
    @DeleteMapping("")
    fun deleteAlleTransacties(): ResponseEntity<Any> {
        return ResponseEntity.ok().body(transactieRepository.deleteAll())
    }

    @PostMapping("")
    fun creeerNieuweTransactie(@Valid @RequestBody transactieList: List<Transactie>): List<Transactie> =
        transactieRepository.saveAll(transactieList)

    @PostMapping("/camt053", consumes = ["multipart/form-data"])
    fun verwerkCamt053(
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Any> {
        if (file.size > 4000000)
            return ResponseEntity(HttpStatus.PAYLOAD_TOO_LARGE)
        transactieService.loadCamt053File(
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
}
