package io.vliet.plusmin.service

import io.vliet.plusmin.domain.*
import io.vliet.plusmin.domain.Saldi.SaldiDTO
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.SaldiRepository
import io.vliet.plusmin.repository.SaldoRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class SaldiService {
    @Autowired
    lateinit var saldiRepository: SaldiRepository

    @Autowired
    lateinit var saldoRepository: SaldoRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    @Autowired
    lateinit var betalingService: BetalingService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun getSaldiOpDatum(gebruiker: Gebruiker, datum: LocalDate): Saldi {
        val openingsSaldiOpt = saldiRepository.getOpeningsSaldiVoorDatum(gebruiker.id, datum)
        val openingsSaldi = if (openingsSaldiOpt.isEmpty)
            this.creeerNulSaldi(gebruiker, datum)
        else openingsSaldiOpt.get()

        val mutatieLijst = betalingService.creeerMutatieLijst(gebruiker)
        val saldi = openingsSaldi.saldi.map { saldo: Saldo ->
            val mutatie: BigDecimal? = mutatieLijst.find { it.rekeningNaam == saldo.rekening.naam }?.bedrag
            saldo.fullCopy(bedrag = saldo.bedrag + (mutatie ?: BigDecimal(0))
        ) }.toSet()
        return openingsSaldi.fullCopy(saldi = saldi)
    }

    fun creeerNulSaldi(gebruiker: Gebruiker, datum: LocalDate): Saldi {
        val rekeningen = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        val saldoLijst = rekeningen.map { saldoRepository.save(Saldo(0, it, BigDecimal(0))) }.toSet()
        return saldiRepository.save(Saldi(0, gebruiker, datum, saldoLijst))
    }

    fun saveAll(gebruiker: Gebruiker, saldiDtoLijst: List<SaldiDTO>): List<SaldiDTO> {
        return saldiDtoLijst.map { saldiDTO ->
            val datum = LocalDate.parse(saldiDTO.datum, DateTimeFormatter.BASIC_ISO_DATE)
            val saldiOpt = saldiRepository.findSaldiGebruikerEnDatum(gebruiker, datum)
            val saldi = if (saldiOpt.isPresent) {
                logger.info("Saldi bestaat al: ${saldiOpt.get().datum} met id ${saldiOpt.get().id} voor ${gebruiker.bijnaam}")
                saldiOpt.get()
            } else {
                saldiRepository.save(
                    Saldi(
                        gebruiker = gebruiker,
                        datum = datum,
                        saldi = saldiDTO.saldi.map { dto2Saldo(gebruiker, it) }.toSet(),
                    )
                )
            }
            logger.info("Opslaan saldi ${saldi.datum} voor ${gebruiker.bijnaam}")
            saldiRepository.save(saldi).toDTO()
        }
    }

    fun dto2Saldo(gebruiker: Gebruiker, saldoDTO: Saldo.SaldoDTO): Saldo {
        val rekening = rekeningRepository.findRekeningGebruikerEnNaam(gebruiker, saldoDTO.rekening)
        val bedrag = saldoDTO.bedrag.toBigDecimal()
        return Saldo(0, rekening.get(), bedrag)
    }
}