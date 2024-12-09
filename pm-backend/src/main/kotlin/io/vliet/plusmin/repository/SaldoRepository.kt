package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Rekening
import io.vliet.plusmin.domain.Saldi
import io.vliet.plusmin.domain.Saldo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface SaldoRepository : JpaRepository<Saldo, Long>