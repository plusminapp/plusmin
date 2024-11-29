package io.vliet.plusmin.service

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Gebruiker.GebruikerDTO
import io.vliet.plusmin.domain.Role
import io.vliet.plusmin.repository.GebruikerRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class GebruikerService {
    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)


    fun saveAll(gebruikersLijst: List<GebruikerDTO>): List<Gebruiker> {
        return gebruikersLijst.map { gebruikerDTO ->
            val vrijwilligerOpt = if (gebruikerDTO.vrijwilligerEmail.isNotEmpty()) {
                gebruikerRepository.findByEmail(gebruikerDTO.vrijwilligerEmail)
            } else null
            val vrijwilliger = if (vrijwilligerOpt != null && vrijwilligerOpt.isPresent) {
                vrijwilligerOpt.get()
            } else null
            logger.info("gebruiker: ${gebruikerDTO.vrijwilligerEmail}, vrijwilliger: ${vrijwilliger?.email}")
            val gebruikerOpt = gebruikerRepository.findByEmail(gebruikerDTO.email)
            val gebruiker = if (gebruikerOpt.isPresent) {
                gebruikerOpt.get().fullCopy(
                    bijnaam = gebruikerDTO.bijnaam,
                    roles = gebruikerDTO.roles.map { enumValueOf<Role>(it) }.toMutableSet(),
                    vrijwilliger = vrijwilliger
                )
            } else (
                Gebruiker(
                    email = gebruikerDTO.email,
                    bijnaam = gebruikerDTO.bijnaam,
                    roles = gebruikerDTO.roles.map { enumValueOf<Role>(it) }.toMutableSet(),
                    vrijwilliger = vrijwilliger
                )
            )

            gebruikerRepository.save(gebruiker)
            gebruiker
        }
    }
}