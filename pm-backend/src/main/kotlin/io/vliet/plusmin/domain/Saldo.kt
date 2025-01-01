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
    @ManyToOne
    @JoinColumn(name = "rekening_id", referencedColumnName = "id")
    val rekening: Rekening,
    val bedrag: BigDecimal
) {
    fun fullCopy(
        rekening: Rekening = this.rekening,
        bedrag: BigDecimal = this.bedrag
    ) = Saldo(this.id, rekening, bedrag)

    data class SaldoDTO(
        val id: Long = 0,
        val rekening: Rekening.RekeningDTO,
        val bedrag: BigDecimal,
    )

    fun toDTO(): SaldoDTO {
        return SaldoDTO(
            this.id,
            this.rekening.toDTO(),
            this.bedrag,
        )
    }
    fun toResultaatDTO(): SaldoDTO {
        return SaldoDTO(
            this.id,
            this.rekening.toDTO(),
            -this.bedrag,
        )
    }
}
