package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Betaling.BetalingDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.BudgetRepository
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
    lateinit var budgetRepository: BudgetRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun creeerAll(gebruiker: Gebruiker, betalingenLijst: List<BetalingDTO>): List<BetalingDTO> {
        return betalingenLijst.map { betalingDTO ->
            val betalingList = this.findMatchingBetaling(gebruiker, betalingDTO)
            val betaling = if (betalingList.isNotEmpty()) {
                logger.info("Betaling bestaat al: ${betalingList[0].omschrijving} met id ${betalingList[0].id} voor ${gebruiker.bijnaam}")
                update(betalingList[0], betalingDTO)
            } else {
                val bron = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, betalingDTO.bron)
                    ?: throw Exception("${betalingDTO.bron} bestaat niet voor ${gebruiker.bijnaam}.")
                val bestemming = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, betalingDTO.bestemming)
                    ?: throw Exception("${betalingDTO.bron} bestaat niet voor ${gebruiker.bijnaam}.")
                val budget: Budget? = if (!betalingDTO.budgetNaam.isNullOrBlank()) {
                    budgetRepository.findByRekeningEnBudgetNaam(bestemming, betalingDTO.budgetNaam)
                        ?: run {
                            logger.warn("Budget ${betalingDTO.budgetNaam} niet gevonden bij rekening ${bestemming} voor ${gebruiker.bijnaam}.")
                            null
                        }
                } else null

                logger.info("Opslaan betaling ${betalingDTO.omschrijving} voor ${gebruiker.bijnaam}")
                Betaling(
                    gebruiker = gebruiker,
                    boekingsdatum = LocalDate.parse(betalingDTO.boekingsdatum, DateTimeFormatter.ISO_LOCAL_DATE),
                    bedrag = betalingDTO.bedrag.toBigDecimal(),
                    omschrijving = betalingDTO.omschrijving,
                    betalingsSoort = Betaling.BetalingsSoort.valueOf(betalingDTO.betalingsSoort),
                    bron = bron,
                    bestemming = bestemming,
                    budget = budget
                )
            }
            betalingRepository.save(betaling).toDTO()
        }
    }

    fun update(oldBetaling: Betaling, newBetalingDTO: BetalingDTO): Betaling {
        val gebruiker = oldBetaling.gebruiker
        val bron = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, newBetalingDTO.bron)
            ?: oldBetaling.bron
        val bestemming = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, newBetalingDTO.bestemming)
            ?: oldBetaling.bestemming
        val budget = if (!newBetalingDTO.budgetNaam.isNullOrBlank()) {
            budgetRepository.findByRekeningEnBudgetNaam(bestemming, newBetalingDTO.budgetNaam)
                ?: run {
                    logger.warn("Budget ${newBetalingDTO.budgetNaam} niet gevonden bij rekening ${bestemming} voor ${gebruiker.bijnaam}.")
                    null
                }
        } else null
        logger.info("Update betaling ${oldBetaling.id}/${newBetalingDTO.omschrijving} voor ${gebruiker.bijnaam} met budget ${budget?.id} ?: (${newBetalingDTO.budgetNaam} niet gevonden) ")
        val newBetaling = oldBetaling.fullCopy(
            boekingsdatum = LocalDate.parse(newBetalingDTO.boekingsdatum, DateTimeFormatter.ISO_LOCAL_DATE),
            bedrag = newBetalingDTO.bedrag.toBigDecimal(),
            omschrijving = newBetalingDTO.omschrijving,
            betalingsSoort = Betaling.BetalingsSoort.valueOf(newBetalingDTO.betalingsSoort),
            bron = bron,
            bestemming = bestemming,
            budget = budget
        )
        return betalingRepository.save(newBetaling)
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