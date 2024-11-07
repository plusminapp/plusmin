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
    val vrijwilliger: Gebruiker? = null
) : UserDetails {

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return roles.map { SimpleGrantedAuthority(it.name) }.toMutableSet()
    }
    @JsonIgnore
    override fun getPassword(): String = ""

    @JsonIgnore
    override fun getUsername(): String = email

    fun fullCopy(
        email: String = this.email,
        bijnaam: String = this.bijnaam,
        roles: MutableSet<Role> = this.roles,
        vrijwilliger: Gebruiker? = this.vrijwilliger
    ) = Gebruiker(this.id, email, bijnaam, roles, vrijwilliger)
}

enum class Role {
    ROLE_ADMIN, ROLE_COORDINATOR, ROLE_VRIJWILLIGER, ROLE_HULPVRAGER
}
