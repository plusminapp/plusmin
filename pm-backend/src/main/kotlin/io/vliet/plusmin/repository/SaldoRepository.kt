package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Saldo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SaldoRepository : JpaRepository<Saldo, Long>