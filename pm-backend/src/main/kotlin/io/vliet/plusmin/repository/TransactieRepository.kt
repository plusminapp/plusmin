package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Transactie
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TransactieRepository : JpaRepository<Transactie, Long> {
    override fun findAll(): List<Transactie>
}
