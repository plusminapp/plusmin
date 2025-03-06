package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Betaling.BetalingOcrValidatie
import io.vliet.plusmin.repository.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.jvm.optionals.getOrNull

@Service
class BetalingOcrValidatieService {
    @Autowired
    lateinit var betalingRepository: BetalingRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var saldoRepository: SaldoRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun valideerOcrBetalingen(
        gebruiker: Gebruiker,
        betalingOcrValidatieWrapper: Betaling.BetalingOcrValidatieWrapper
    ): Betaling.BetalingOcrValidatieWrapper {
        val rekening = betalingOcrValidatieWrapper.saldoOpLaatsteBetalingDatum.let {
            rekeningRepository.findRekeningGebruikerEnNaam(
                gebruiker,
                it.rekeningNaam
            )
        } ?: throw IllegalStateException("betalingOcrValidatieWrapper.saldoOpLaatsteBetalingDatum.rekeningNaam is leeg")
        val openingsSaldo = saldoRepository.findLastSaldoByRekening(rekening).getOrNull()
            ?: throw IllegalStateException("Geen Saldo voor ${rekening.naam}  voor ${gebruiker.email}.")
        val betalingen = if (openingsSaldo.periode == null) {
            throw IllegalStateException("Geen Periode bij Saldo ${openingsSaldo.id} voor ${gebruiker.email}.")
        } else {
            betalingRepository.findAllByGebruikerTussenDatums(
                gebruiker,
                openingsSaldo.periode!!.periodeStartDatum,
                LocalDate.now()
            )
        }
        val saldoOpDatum = betalingen.fold(openingsSaldo.bedrag) { saldo, betaling ->
            saldo + berekenMutaties(betaling, rekening)
        }
        val validatedBetalingen = betalingOcrValidatieWrapper.betalingen.map { betalingOcrValidatie ->
            valideerOcrBetaling(gebruiker, betalingOcrValidatie)
        }
        val laatsteBetalingen = betalingRepository.findLaatsteBetaling(gebruiker)
        val laatsteBetalingDatum =
            if (laatsteBetalingen.size > 0) laatsteBetalingen[0].boekingsdatum else openingsSaldo.periode!!.periodeStartDatum


        return Betaling.BetalingOcrValidatieWrapper(
            laatsteBetalingDatum,
            Saldo.SaldoDTO(0, rekening.naam, saldoOpDatum),
            validatedBetalingen,
        )
    }

    fun berekenMutaties(betaling: Betaling, rekening: Rekening): BigDecimal {
        return if (betaling.bron.id == rekening.id) -betaling.bedrag else BigDecimal(0) +
                if (betaling.bestemming.id == rekening.id) betaling.bedrag else BigDecimal(0)
    }
    fun valideerOcrBetaling(gebruiker: Gebruiker, betalingOcrValidatie: BetalingOcrValidatie): BetalingOcrValidatie {
        val vergelijkbareBetalingen = betalingRepository.findVergelijkbareBetalingen(
            gebruiker,
            LocalDate.parse(betalingOcrValidatie.boekingsdatum, DateTimeFormatter.ISO_LOCAL_DATE),
            betalingOcrValidatie.bedrag.abs(),
        )
        return betalingOcrValidatie.fullCopy(
            bestaatAl = vergelijkbareBetalingen.isNotEmpty(),
            omschrijving = vergelijkbareBetalingen.map { it.omschrijving }.joinToString(", "))
    }
}