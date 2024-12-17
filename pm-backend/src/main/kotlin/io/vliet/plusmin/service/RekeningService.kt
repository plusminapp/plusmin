package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Rekening
import io.vliet.plusmin.domain.Rekening.RekeningDTO
import io.vliet.plusmin.domain.RekeningSoort
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.RekeningRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class RekeningService {
    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun saveAll(gebruiker: Gebruiker, rekeningenLijst: List<RekeningDTO>): List<RekeningDTO> {
        return rekeningenLijst.map { rekeningDTO ->
            val rekeningOpt = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, rekeningDTO.naam)
            val rekening = if (rekeningOpt.isPresent) {
                logger.info("Rekening bestaat al: ${rekeningOpt.get().naam} met id ${rekeningOpt.get().id} voor ${gebruiker.bijnaam}")
                rekeningOpt.get().fullCopy(
                    rekeningSoort = enumValueOf<RekeningSoort>(rekeningDTO.rekeningSoort),
                    nummer = rekeningDTO.nummer,
                    afkorting = rekeningDTO.afkorting
                )
            } else {
                Rekening(
                    gebruiker = gebruiker,
                    rekeningSoort = enumValueOf<RekeningSoort>(rekeningDTO.rekeningSoort),
                    nummer = rekeningDTO.nummer,
                    naam = rekeningDTO.naam,
                    afkorting = rekeningDTO.afkorting,
                    sortOrder = rekeningDTO.sortOrder
                )
            }
            logger.info("Opslaan rekening ${rekening.naam} voor ${gebruiker.bijnaam}")
            rekeningRepository.save(rekening).toDTO()
        }
    }
}