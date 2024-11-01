package io.vliet.plusmin.controller

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Role
import io.vliet.plusmin.repository.GebruikerRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class GebruikerController {
    @Autowired
    lateinit var gebruikerRepository: GebruikerRepository

    @GetMapping("/gebruiker")
    fun getGebruikernaam(): Gebruiker {
        val jwt = SecurityContextHolder.getContext().authentication.principal as Jwt
        val email = jwt.claims["username"] as String
        val gebruikerOpt = gebruikerRepository.findByEmail(email)
        return if (gebruikerOpt.isPresent)
            gebruikerOpt.get()
        else
            gebruikerRepository.save(Gebruiker(email = email))
    }
}
