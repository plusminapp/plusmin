package io.vliet.plusmin.service

import io.vliet.camt053parser.Camt053Parser
import iso.std.iso._20022.tech.xsd.camt_053_001.CreditDebitCode

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Rekening
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.repository.RekeningRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import java.io.BufferedReader

@Service
class Camt053Service {
    @Autowired
    lateinit var betalingRepository: BetalingRepository

    @Autowired
    lateinit var rekeningRepository: RekeningRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun loadCamt053File(gebruiker: Gebruiker, reader: BufferedReader, debug: Boolean = true): String {
        val rekeningen = rekeningRepository.findRekeningenVoorGebruiker(gebruiker)
        val inkomstenRekening = rekeningen.filter { it.rekeningSoort == Rekening.RekeningSoort.INKOMSTEN }[0]
        val uitgavenRekening = rekeningen.filter { it.rekeningSoort == Rekening.RekeningSoort.UITGAVEN }[0]
        val betaalRekening = rekeningen.filter { it.rekeningSoort == Rekening.RekeningSoort.BETAALREKENING }[0]

        val camt053Parser = Camt053Parser()
        var aantalBetalingen = 0
        var aantalOpgeslagenBetalingen = 0

        try {
            val camt053Document = camt053Parser.parse(reader)

            logger.info("Account IBAN: " + camt053Document.bkToCstmrStmt.stmt[0].acct.id.iban)
            logger.info("Bank afschrift volgnummer: " + camt053Document.bkToCstmrStmt.stmt[0].elctrncSeqNb.toInt())

            val accountStatement2List = camt053Document.bkToCstmrStmt.stmt

            for (accountStatement2 in accountStatement2List) {
                aantalBetalingen = accountStatement2.ntry.size
                logger.info("Aantal betalingen : ${aantalBetalingen}")
                for (reportEntry2 in accountStatement2.ntry) {
                    if (reportEntry2.ntryDtls.isEmpty()) {
                        logger.warn("reportEntry2.ntryDtls is leeg ${reportEntry2.acctSvcrRef}  ")
                    }
                    val isDebit = (reportEntry2.cdtDbtInd == CreditDebitCode.DBIT)
                    val boekingsDatum = reportEntry2.bookgDt.dt.toGregorianCalendar().toZonedDateTime().toLocalDate()
                    val naamTegenrekening =
                        if (!reportEntry2.ntryDtls.isEmpty() && !reportEntry2.ntryDtls[0].txDtls.isEmpty()) {
                            val rltdPties = reportEntry2.ntryDtls[0].txDtls[0]?.rltdPties
                            if (isDebit)
                                (rltdPties?.cdtr?.nm ?: "")
                            else
                                (rltdPties?.dbtr?.nm ?: "")
                        } else {
                            ""
                        }
                    val omschrijving = naamTegenrekening + reportEntry2.addtlNtryInf
                    if (debug) {
                        logger.info(
                            "${if (isDebit) "Af" else "Bij"}, " +
                                    "Bedrag: ${reportEntry2.amt.value}, " +
                                    "Boekingsdatum: ${boekingsDatum}, " +
                                    "Omschrijving: ${naamTegenrekening}, ${omschrijving}"
                        )
                    } else {
                        try {
                            betalingRepository.save(
                                Betaling(
                                    boekingsdatum = reportEntry2.bookgDt.dt.toGregorianCalendar().toZonedDateTime()
                                        .toLocalDate(),
                                    bedrag = reportEntry2.amt.value,
                                    gebruiker = gebruiker,
                                    omschrijving = omschrijving,
                                    betalingsSoort = if (isDebit) Betaling.BetalingsSoort.UITGAVEN else Betaling.BetalingsSoort.INKOMSTEN,
                                    bron = if (isDebit) betaalRekening else inkomstenRekening,
                                    bestemming = if (isDebit) uitgavenRekening else betaalRekening
                                )
                            )
                            aantalOpgeslagenBetalingen++
                        } catch (_: DataIntegrityViolationException) {
                        }
                    }
                }
                logger.info("Aantal opgeslagen betalingen: ${aantalOpgeslagenBetalingen}")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return "Aantal opgeslagen betalingen: ${aantalOpgeslagenBetalingen} van totaal ${aantalBetalingen} betalingen."
    }
}