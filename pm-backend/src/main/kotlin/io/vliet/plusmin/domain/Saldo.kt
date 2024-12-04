package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal

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
    @JsonIgnore
    @JoinColumn(name = "saldi_id")
    val saldi: Saldi,
    rekening: Rekening,
    bedrag: BigDecimal
)
