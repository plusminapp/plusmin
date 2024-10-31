package io.vliet.plusmin.controller

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class GebruikerController {

    @GetMapping("/gebruiker")
    fun getGebruikernaam(): String {
        val authentication = SecurityContextHolder.getContext().authentication
        val jwt = authentication.principal as Jwt
        return jwt.claims["username"] as String
    }
}
