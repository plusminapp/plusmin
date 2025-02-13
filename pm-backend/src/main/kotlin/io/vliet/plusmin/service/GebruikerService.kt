package io.vliet.plusmin.service

import io.vliet.plusmin.controller.GebruikerController.GebruikerDTO
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Gebruiker.Role
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.PeriodeRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class GebruikerService {
    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @Autowired
    lateinit var periodeService: PeriodeService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruikersLijst: List<GebruikerDTO>): List<Gebruiker> {
        return gebruikersLijst.map { gebruikerDTO ->
            save(gebruikerDTO)
        }
    }

    fun save(gebruikerDTO: GebruikerDTO): Gebruiker {
        val vrijwilliger = if (gebruikerDTO.vrijwilligerEmail.isNotEmpty()) {
            gebruikerRepository.findByEmail(gebruikerDTO.vrijwilligerEmail)
        } else null
        logger.info("gebruiker: ${gebruikerDTO.vrijwilligerEmail}, vrijwilliger: ${vrijwilliger?.email}")
        val gebruikerOpt = gebruikerRepository.findByEmail(gebruikerDTO.email)
        val gebruiker = gebruikerRepository.save(
            if (gebruikerOpt != null) {
                gebruikerOpt.fullCopy(
                    bijnaam = gebruikerDTO.bijnaam,
                    roles = gebruikerDTO.roles.map { enumValueOf<Role>(it) }.toMutableSet(),
                    vrijwilliger = vrijwilliger,
                )
            } else {
                Gebruiker(
                    email = gebruikerDTO.email,
                    bijnaam = gebruikerDTO.bijnaam,
                    roles = gebruikerDTO.roles.map { enumValueOf<Role>(it) }.toMutableSet(),
                    vrijwilliger = vrijwilliger,
                )
            }
        )

        if (gebruiker.periodeDag != gebruikerDTO.periodeDag) {
            if (gebruikerDTO.periodeDag > 28) {
                logger.warn("Periodedag moet kleiner of gelijk zijn aan 28 (gevraagd: ${gebruikerDTO.periodeDag})")
            } else {
                logger.info("Periodedag wordt aangepast voor gebruiker ${gebruiker.email} van ${gebruiker.periodeDag} -> ${gebruikerDTO.periodeDag}")
                periodeService.pasPeriodeDagAan(gebruiker, gebruikerDTO)
                gebruikerRepository.save(gebruiker.fullCopy(periodeDag = gebruikerDTO.periodeDag))
            }
        }


//        val initielePeriodeStartDatum: LocalDate = if (gebruikerDTO.periodes.size > 0) {
//            LocalDate.parse(gebruikerDTO.periodes.sortedBy { it.periodeStartDatum }[0].periodeStartDatum)
//        } else {
//            periodeService.berekenPeriodeDatums(gebruikerDTO.periodeDag, LocalDate.now()).first
//        }
//        logger.warn("initielePeriodeStartDatum $initielePeriodeStartDatum")
//        periodeService.creeerInitielePeriode(gebruiker, initielePeriodeStartDatum)
        return gebruiker
    }
}