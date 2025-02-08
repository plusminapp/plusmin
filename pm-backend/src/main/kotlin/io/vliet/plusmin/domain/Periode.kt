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
@Table(name = "periode",
    uniqueConstraints = [UniqueConstraint(columnNames = ["gebruiker", "periodeStartDatum"])])
class Periode(
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
    val periodeStartDatum: LocalDate,
    val periodeEindDatum: LocalDate,
    @Enumerated(EnumType.STRING)
    val periodeStatus: PeriodeStatus = PeriodeStatus.HUIDIG,
//    @OneToMany(cascade = arrayOf(CascadeType.ALL), fetch = FetchType.EAGER)
//    @JoinColumn(name = "periode_id", referencedColumnName = "id")
//    var saldoLijst: List<Saldo>
) {
//    fun with(saldoLijst: List<Saldo>): Periode {
//        this.saldoLijst = saldoLijst
//        return this
//    }

    fun fullCopy(
        gebruiker: Gebruiker = this.gebruiker,
        periodeStartDatum: LocalDate = this.periodeStartDatum,
        periodeEindDatum: LocalDate = this.periodeEindDatum,
        periodeStatus: PeriodeStatus = this.periodeStatus,
//        saldoLijst: List<Saldo> = this.saldoLijst
    ) = Periode(this.id, gebruiker, periodeStartDatum, periodeEindDatum, periodeStatus)

    data class PeriodeDTO(
        val id: Long = 0,
        val periodeStartDatum: String,
        val periodeStatus: PeriodeStatus,
        var saldoLijst: List<Saldo.SaldoDTO> = emptyList()
    )

    fun toDTO(): PeriodeDTO {
        return PeriodeDTO(
            this.id,
            this.periodeStartDatum.format(DateTimeFormatter.ISO_LOCAL_DATE),
            this.periodeStatus,
//            this.saldoLijst.map { it.toDTO() }
        )
    }
    enum class PeriodeStatus {
        HUIDIG, OPEN, GESLOTEN, OPGERUIMD
    }
}