package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Saldi
import io.vliet.plusmin.domain.Saldi.SaldiDTO
import io.vliet.plusmin.domain.SaldiSoort
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.SaldiRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class SaldiService {
    @Autowired
    lateinit var saldiRepository: SaldiRepository

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, saldiLijst: List<SaldiDTO>): List<SaldiDTO> {
        return saldiLijst.map { saldiDTO ->
            val saldiOpt = saldiRepository.findSaldiGebruikerEnNaam(gebruiker, saldiDTO.naam)
            val saldi = if (saldiOpt.isPresent) {
                logger.info("Saldi bestaat al: ${saldiOpt.get().naam} met id ${saldiOpt.get().id} voor ${gebruiker.bijnaam}")
                saldiOpt.get().fullCopy(
                    saldiSoort = enumValueOf<SaldiSoort>(saldiDTO.saldiSoort),
                    nummer = saldiDTO.nummer,
                    afkorting = saldiDTO.afkorting
                )
            } else {
                Saldi(
                    gebruiker = gebruiker,
                    saldiSoort = enumValueOf<SaldiSoort>(saldiDTO.saldiSoort),
                    nummer = saldiDTO.nummer,
                    naam = saldiDTO.naam,
                    afkorting = saldiDTO.afkorting
                )
            }
            logger.info("Opslaan saldi ${saldi.naam} voor ${gebruiker.bijnaam}")
            saldiRepository.save(saldi).toDTO()
        }
    }
}