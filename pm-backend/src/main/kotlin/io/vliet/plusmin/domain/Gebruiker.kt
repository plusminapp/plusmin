package io.vliet.plusmin.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails


@Entity
@Table(name = "gebruiker")
class Gebruiker(
    @Id
    @GeneratedValue(generator = "hibernate_sequence", strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(
        name = "hibernate_sequence",
        sequenceName = "hibernate_sequence",
        allocationSize = 1)
    val id: Long = 0,
    @Column(unique = true)
    val email: String,
    val bijnaam: String = "Gebruiker zonder bijnaam :-)",
    @ElementCollection(fetch = FetchType.EAGER, targetClass = Role::class)
    @Enumerated(EnumType.STRING)
    val roles: MutableSet<Role> = mutableSetOf<Role>(),
    @OneToOne
    val vrijwilliger: Gebruiker? = null,
    @OneToMany(mappedBy = "gebruiker", fetch = FetchType.EAGER)
    var rekeningen: List<Rekening> = emptyList(),
    @OneToMany(mappedBy = "gebruiker", fetch = FetchType.EAGER)
    var saldi: List<Saldi> = emptyList()
) : UserDetails {

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return roles.map { SimpleGrantedAuthority(it.name) }.toMutableSet()
    }
    @JsonIgnore
    override fun getPassword(): String = ""

    @JsonIgnore
    override fun getUsername(): String = email

    fun with(rekening: Rekening): Gebruiker {
        this.rekeningen += rekening
        return this
    }

    fun fullCopy(
        email: String = this.email,
        bijnaam: String = this.bijnaam,
        roles: MutableSet<Role> = this.roles,
        vrijwilliger: Gebruiker? = this.vrijwilliger,
        rekeningen: List<Rekening> = this.rekeningen
    ) = Gebruiker(this.id, email, bijnaam, roles, vrijwilliger, rekeningen)

    /**
     * Een Data Transfer Object voor de Gebruiker
     *
     * Deze data class wordt gebruikt om:
     *  - als invoer: een nieuwe gebruiker aan te maken
     *  - als uitvoer: de hulpvragers bij een vrijwilliger mee te geven
     *
     *  Let op: de DTO bevat NIET de rekeningen
     */
    data class GebruikerDTO (
        val id: Long = 0,
        val email: String,
        val bijnaam: String = "Gebruiker zonder bijnaam :-)",
        val roles: List<String> = emptyList(),
        val vrijwilligerEmail: String = "",
    )

    fun toDTO(): GebruikerDTO {
        return GebruikerDTO(
            this.id,
            this.email,
            this.bijnaam,
            this.roles.map { it.toString() },
            this.vrijwilliger?.email ?: "",
        )
    }
}

enum class Role {
    ROLE_ADMIN, ROLE_COORDINATOR, ROLE_VRIJWILLIGER, ROLE_HULPVRAGER
}
