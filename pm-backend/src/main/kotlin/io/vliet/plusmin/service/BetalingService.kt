package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Betaling.BetalingDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.RekeningRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.jvm.optionals.getOrElse

@Service
class BetalingService {
    @Autowired
    lateinit var betalingRepository: BetalingRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, betalingenLijst: List<Betaling.BetalingDTO>): List<BetalingDTO> {
        return betalingenLijst.map { betalingDTO ->
            val betalingList = this.findMatchingBetaling(gebruiker, betalingDTO)
            val betaling = if (betalingList.size > 0) {
                logger.info("Betaling bestaat al: ${betalingList[0].omschrijving} met id ${betalingList[0].id} voor ${gebruiker.bijnaam}")
                betalingList[0]
            } else {
                val bron = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, betalingDTO.bron)
                if (bron.isEmpty) throw Exception("${betalingDTO.bron} bestaat niet voor ${gebruiker.bijnaam}.")
                val bestemming = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, betalingDTO.bestemming)
                if (bestemming.isEmpty) throw Exception("${betalingDTO.bron} bestaat niet voor ${gebruiker.bijnaam}.")
                logger.info("Opslaan betaling ${betalingDTO.omschrijving} voor ${gebruiker.bijnaam}")
                Betaling(
                    gebruiker = gebruiker,
                    boekingsdatum = LocalDate.parse(betalingDTO.boekingsdatum, DateTimeFormatter.BASIC_ISO_DATE),
                    bedrag = betalingDTO.bedrag.toBigDecimal(),
                    omschrijving = betalingDTO.omschrijving,
                    betalingsSoort = Betaling.BetalingsSoort.valueOf(betalingDTO.betalingsSoort),
                    bron = bron.get(),
                    bestemming = bestemming.get()
                )
            }
            betalingRepository.save(betaling).toDTO()
        }
    }

    fun findMatchingBetaling(gebruiker: Gebruiker, betalingDTO: BetalingDTO): List<Betaling> {
        return betalingRepository.findMatchingBetaling(
            gebruiker = gebruiker,
            boekingsdatum = LocalDate.parse(betalingDTO.boekingsdatum, DateTimeFormatter.BASIC_ISO_DATE),
            bedrag = betalingDTO.bedrag.toBigDecimal(),
            omschrijving = betalingDTO.omschrijving,
            betalingsSoort = Betaling.BetalingsSoort.valueOf(betalingDTO.betalingsSoort),
        )
    }
}