package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

/*
    De Saldo tabel bevat het saldo van een rekening; door de relatie naar de Saldi tabel
    is het van 1 gebruiker, op 1 moment in de tijd
 */

@Entity
@Table(name = "saldo")
class Saldo(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence",
        sequenceName = "hibernate_sequence",
        allocationSize = 1
    )
    val id: Long = 0,
    @OneToOne
    val rekening: Rekening,
    val bedrag: BigDecimal
) {
    fun fullCopy(
        rekening: Rekening = this.rekening,
        bedrag: BigDecimal = this.bedrag
    ) = Saldo(this.id, rekening, bedrag)

    data class SaldoDTO(
        val id: Long = 0,
        val rekening: String,
        val bedrag: String,
    )

    fun toDTO(): SaldoDTO {
        return SaldoDTO(
            this.id,
            this.rekening.naam,
            this.bedrag.toString(),
        )
    }
}