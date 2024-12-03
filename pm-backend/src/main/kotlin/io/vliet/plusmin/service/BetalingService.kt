package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Betaling.BetalingDTO
import io.vliet.plusmin.domain.BetalingsSoort
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.GebruikerRepository
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

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, betalingenLijst: List<Betaling.BetalingDTO>): List<BetalingDTO> {
        return betalingenLijst.map { betalingDTO ->
            val betalingList = betalingRepository.findBetalingGebruikerEnDto(gebruiker, betalingDTO.omschrijving)
            val betaling = if (betalingList.size > 0) {
                logger.info("Betaling bestaat al: ${betalingList[0].omschrijving} met id ${betalingList[0].id} voor ${gebruiker.bijnaam}")
                betalingList[0]
            } else {
                val bron = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, betalingDTO.bron)
                val bestemming = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, betalingDTO.bestemming)
                Betaling(
                    gebruiker = gebruiker,
                    boekingsdatum = LocalDate.parse(betalingDTO.boekingsdatum, DateTimeFormatter.BASIC_ISO_DATE),
                    bedrag = betalingDTO.bedrag.toBigDecimal(),
                    omschrijving = betalingDTO.omschrijving,
                    betalingsSoort = BetalingsSoort.valueOf(betalingDTO.betalingsSoort),
                    bron = bron.get(),
                    bestemming = bestemming.get()
                )
            }
            logger.info("Opslaan betaling ${betaling.omschrijving} voor ${gebruiker.bijnaam}")
            betalingRepository.save(betaling).toDTO()
        }
    }
}