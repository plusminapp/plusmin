package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Rekening
import io.vliet.plusmin.domain.Rekening.RekeningDTO
import io.vliet.plusmin.domain.BetaalMethode
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
                logger.info("rekening bestaat al: ${rekeningOpt.get().id}")
                rekeningOpt.get().fullCopy(
                    betaalMethode = enumValueOf<BetaalMethode>(rekeningDTO.type),
                    nummer = rekeningDTO.nummer,
                    afkorting = rekeningDTO.afkorting
                )
            } else {
                Rekening(
                    gebruiker = gebruiker,
                    betaalMethode = enumValueOf<BetaalMethode>(rekeningDTO.type),
                    nummer = rekeningDTO.nummer,
                    naam = rekeningDTO.naam,
                    afkorting = rekeningDTO.afkorting
                )
            }
            val savedRekening = rekeningRepository.save(rekening)
            logger.info("rekeningid: ${savedRekening.id}")
            val savedGebruiker = gebruikerRepository.save(gebruiker.with(savedRekening))
            logger.info("rekeningen ${savedGebruiker.rekeningen.map { it.naam }}")
            rekening.toDTO()
        }
    }
}