package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonInclude
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.NotNull
import javax.validation.constraints.PastOrPresent

@Entity
@Table(name = "transactie")
class Transactie(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence", 
        sequenceName = "hibernate_sequence", 
        allocationSize = 1)
    val id: Long = 0,
    @Column(unique = true)
    @field:NotNull(message = "Referentie mag niet null zijn")
    @field:NotBlank(message = "Referentie mag niet leeg zijn")
    val referentie: String,
    @field:PastOrPresent(message = "Boekingsdatum mag niet in de toekomst liggen")
    val boekingsdatum: LocalDate,
    val tegenrekening: String? = null,
    val naam_tegenrekening: String? = null,
    val saldo_vooraf: BigDecimal? = null,
    @field:NotEmpty(message = "Bedrag mag niet leeg zijn")
    val bedrag: BigDecimal,
    val betalingskenmerk: String? = null,
    val omschrijving_bank: String? = null,
    val omschrijving: String? = null,
    val categorie: String? = null,
    val status: String = "open"
) {}

