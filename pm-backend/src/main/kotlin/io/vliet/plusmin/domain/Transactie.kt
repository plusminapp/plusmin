package io.vliet.plusmin.domain


import com.fasterxml.jackson.annotation.JsonInclude
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(name = "transactie")
@JsonInclude(JsonInclude.Include.NON_NULL)
class Transactie(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence", 
        sequenceName = "hibernate_sequence", 
        allocationSize = 1)
    val id: Long = 0,
    @Column(unique = true)
    val referentie: String,
    val boekingsdatum: LocalDate,
    val tegenrekening: String? = null,
    val naam_tegenrekening: String? = null,
    val saldo_vooraf: BigDecimal? = null,
    val bedrag: BigDecimal,
    val betalingskenmerk: String? = null,
    val omschrijving_bank: String? = null,
    val omschrijving: String? = null,
    val categorie: String? = null,
    val status: String = "open"
) {}

