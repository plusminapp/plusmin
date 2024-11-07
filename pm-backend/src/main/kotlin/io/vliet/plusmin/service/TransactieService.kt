package io.vliet.plusmin.service

import io.vliet.camt053parser.Camt053Parser
import iso.std.iso._20022.tech.xsd.camt_053_001.CreditDebitCode

import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Transactie
import io.vliet.plusmin.repository.TransactieRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import java.io.BufferedReader
import java.math.BigDecimal

@Service
class TransactieService {
    @Autowired
    lateinit var transactieRepository: TransactieRepository

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun loadCamt053File(gebruiker: Gebruiker, reader: BufferedReader) {
        val camt053Parser = Camt053Parser()

        try {
            val camt053Document = camt053Parser.parse(reader)

            logger.info("Account IBAN: " + camt053Document.bkToCstmrStmt.stmt[0].acct.id.iban)
            logger.info("Bank afschrift volgnummer: " + camt053Document.bkToCstmrStmt.stmt[0].elctrncSeqNb.toInt())

            val accountStatement2List = camt053Document.bkToCstmrStmt.stmt

            for (accountStatement2 in accountStatement2List) {
                logger.info("Aantal transacties : " + accountStatement2.ntry.size)
                var count = 0

                for (reportEntry2 in accountStatement2.ntry) {
                    if (reportEntry2.ntryDtls[0].btch != null) {
                        logger.warn("Batch transacties worden niet verwerkt; Entry reference: " + reportEntry2.ntryRef)
                        break
                    }
                    val entryDetails = reportEntry2.ntryDtls[0].txDtls[0]

                    val isDebit = (reportEntry2.cdtDbtInd == CreditDebitCode.DBIT)

                    try {
                        transactieRepository.save(
                            Transactie(
                                referentie = reportEntry2.ntryRef,
                                boekingsdatum = reportEntry2.bookgDt.dt.toGregorianCalendar().toZonedDateTime()
                                    .toLocalDate(),
                                tegenrekening = if (isDebit)
                                    (entryDetails.rltdPties?.cdtrAcct?.id?.iban ?: "onbekend")
                                else
                                    (entryDetails.rltdPties?.dbtrAcct?.id?.iban ?: "onbekend"),
                                naam_tegenrekening = if (isDebit)
                                    (entryDetails.rltdPties?.cdtr?.nm ?: "onbekend")
                                else
                                    (entryDetails.rltdPties?.dbtr?.nm ?: "onbekend"),
                                saldo_vooraf = BigDecimal(0),
                                bedrag = if (isDebit)
                                    -reportEntry2.amt.value
                                else
                                    reportEntry2.amt.value,
                                omschrijving_bank = reportEntry2.addtlNtryInf,
                                gebruiker = gebruiker
                            )
                        )
                        count++
                    } catch (_: DataIntegrityViolationException) { }
                }
                logger.info("Aantal opgeslagen transacties: $count")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

