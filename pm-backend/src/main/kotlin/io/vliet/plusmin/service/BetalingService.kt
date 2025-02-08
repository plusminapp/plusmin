package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Betaling.BetalingDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.RekeningRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class BetalingService {
    @Autowired
    lateinit var betalingRepository: BetalingRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, betalingenLijst: List<BetalingDTO>): List<BetalingDTO> {
        return betalingenLijst.map { betalingDTO ->
            val betalingList = this.findMatchingBetaling(gebruiker, betalingDTO)
            val betaling = if (betalingList.isNotEmpty()) {
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
                    boekingsdatum = LocalDate.parse(betalingDTO.boekingsdatum, DateTimeFormatter.ISO_LOCAL_DATE),
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

    fun save(oldBetaling: Betaling, newBetalingDTO: BetalingDTO): BetalingDTO {
        val gebruiker = oldBetaling.gebruiker
        val bronOpt = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, newBetalingDTO.bron)
        val bron = if (bronOpt.isEmpty) {
            logger.warn("${newBetalingDTO.bron} bestaat niet voor ${gebruiker.bijnaam}.")
            oldBetaling.bron
        } else bronOpt.get()
        val bestemmingOpt = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, newBetalingDTO.bestemming)
        val bestemming = if (bestemmingOpt.isEmpty) {
            logger.warn("${newBetalingDTO.bestemming} bestaat niet voor ${gebruiker.bijnaam}.")
            oldBetaling.bestemming
        } else bestemmingOpt.get()
        logger.info("Opslaan betaling ${newBetalingDTO.omschrijving} voor ${gebruiker.bijnaam}")
        val newBetaling = oldBetaling.fullCopy(
            boekingsdatum = LocalDate.parse(newBetalingDTO.boekingsdatum, DateTimeFormatter.ISO_LOCAL_DATE),
            bedrag = newBetalingDTO.bedrag.toBigDecimal(),
            omschrijving = newBetalingDTO.omschrijving,
            betalingsSoort = Betaling.BetalingsSoort.valueOf(newBetalingDTO.betalingsSoort),
            bron = bron,
            bestemming = bestemming
        )
        return betalingRepository.save(newBetaling).toDTO()
    }

    fun findMatchingBetaling(gebruiker: Gebruiker, betalingDTO: BetalingDTO): List<Betaling> {
        return betalingRepository.findMatchingBetaling(
            gebruiker = gebruiker,
            boekingsdatum = LocalDate.parse(betalingDTO.boekingsdatum, DateTimeFormatter.ISO_LOCAL_DATE),
            bedrag = betalingDTO.bedrag.toBigDecimal(),
            omschrijving = betalingDTO.omschrijving,
            betalingsSoort = Betaling.BetalingsSoort.valueOf(betalingDTO.betalingsSoort),
        )
    }
}