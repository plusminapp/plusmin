package io.vliet.plusmin.domain

import jakarta.persistence.*

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
    val roles: List<Role> = emptyList(),
    @OneToOne
    val vrijwilliger: Gebruiker? = null
) {
    fun fullCopy(
        email: String = this.email,
        bijnaam: String = this.bijnaam,
        roles: List<Role> = this.roles,
        vrijwilliger: Gebruiker? = this.vrijwilliger
    ) = Gebruiker(this.id, email, bijnaam, roles, vrijwilliger)
}

enum class Role {
    ROLE_ADMIN, ROLE_COORDINATOR, ROLE_VRIJWILLIGER, ROLE_HULPVRAGER
}
