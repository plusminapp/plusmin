package io.vliet.plusmin.domain

import java.time.Instant
import jakarta.persistence.*

@Entity
@Table(name = "gebruiker")
data class Gebruiker(
    @Id
    val id: String,
    val email: String = "",
    @ElementCollection(fetch = FetchType.EAGER, targetClass = Role::class)
    @Enumerated(EnumType.STRING)
    val roles: List<Role> = emptyList(),
    val isUserLocked: Boolean = false,
    val failedAttemps: Int = 0,
    val lastFailedLogin: Instant? = null
) {
    fun fullCopy(email: String = this.email,
                 roles: List<Role> = this.roles,
                 isLocked: Boolean = this.isUserLocked,
                 failedAttemps: Int = this.failedAttemps,
                 lastFailedLogin: Instant? = this.lastFailedLogin) =
        Gebruiker(this.id, email, roles, isLocked, failedAttemps, lastFailedLogin)
}

enum class Role {
    ROLE_ADMIN
}

