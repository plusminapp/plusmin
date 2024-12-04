package io.vliet.plusmin.repository

import io.vliet.plusmin.domain.Saldi
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SaldiRepository : JpaRepository<Saldi, Long> {}
