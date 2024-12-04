package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "saldi")
class Saldi(
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
    @JoinColumn(name = "gebruiker_id")
    val gebruiker: Gebruiker,
    val datum: LocalDate,
    @OneToMany(mappedBy = "saldi", fetch = FetchType.EAGER)
    var saldi: Set<Saldo>
)
