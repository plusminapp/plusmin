package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/*
    De Saldi tabel bevat de saldi van de rekeningen van een gebruiker (hulpvrager) op 1 moment in de tijd
    uitgangspunt: 1ste van de maand worden
    - de resultaatrekeningen op 0 gezet,
    - alle resultaat boekingen van de vorige maand op 0 gezet,
    - een nieuw Saldi record in de database bewaard
 */

@Entity
@Table(name = "saldi",
    uniqueConstraints = [UniqueConstraint(columnNames = ["gebruiker", "datum"])])
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
    @OneToMany(cascade = arrayOf(CascadeType.ALL), fetch = FetchType.EAGER)
    @JoinColumn(name = "saldi_id", referencedColumnName = "id")
    var saldi: Set<Saldo>
) {
    fun with(saldi: Set<Saldo>): Saldi {
        this.saldi = saldi
        return this
    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        datum: LocalDate = this.datum,
        saldi: Set<Saldo> = this.saldi
    ) = Saldi(this.id, gebruiker, datum, saldi)

    data class SaldiDTO(
        val id: Long = 0,
        val datum: String,
        var saldi: List<Saldo.SaldoDTO>
    )

    fun toDTO(): SaldiDTO {
        return SaldiDTO(
            this.id,
            this.datum.format(DateTimeFormatter.BASIC_ISO_DATE),
            this.saldi.map { it.toDTO() }
        )
    }
}