//package io.vliet.plusmin.service
//
//import io.vliet.camt053parser.Camt053Parser
//import iso.std.iso._20022.tech.xsd.camt_053_001.CreditDebitCode
//
//import io.vliet.plusmin.domain.Gebruiker
//import io.vliet.plusmin.domain.Betaling
//import io.vliet.plusmin.repository.BetalingRepository
//import org.slf4j.Logger
//import org.slf4j.LoggerFactory
//import org.springframework.beans.factory.annotation.Autowired
//import org.springframework.dao.DataIntegrityViolationException
//import org.springframework.stereotype.Service
//import java.io.BufferedReader
//import java.math.BigDecimal
//
//@Service
//class Camt053Service {
//    @Autowired
//    lateinit var betalingRepository: BetalingRepository
//
//    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)
//
//    fun loadCamt053File(gebruiker: Gebruiker, reader: BufferedReader): String {
//        val camt053Parser = Camt053Parser()
//        var aantalBetalingen = 0
//        var aantalOpgeslagenBetalingen = 0
//
//        try {
//            val camt053Document = camt053Parser.parse(reader)
//
//            logger.info("Account IBAN: " + camt053Document.bkToCstmrStmt.stmt[0].acct.id.iban)
//            logger.info("Bank afschrift volgnummer: " + camt053Document.bkToCstmrStmt.stmt[0].elctrncSeqNb.toInt())
//
//            val accountStatement2List = camt053Document.bkToCstmrStmt.stmt
//
//            for (accountStatement2 in accountStatement2List) {
//                aantalBetalingen = accountStatement2.ntry.size
//                logger.info("Aantal betalingen : ${aantalBetalingen}")
//
//                for (reportEntry2 in accountStatement2.ntry) {
//                    if (reportEntry2.ntryDtls[0].btch != null) {
//                        logger.warn("Batch betalingen worden niet verwerkt; Entry reference: " + reportEntry2.ntryRef)
//                        break
//                    }
//                    val entryDetails = reportEntry2.ntryDtls[0].txDtls[0]
//
//                    val isDebit = (reportEntry2.cdtDbtInd == CreditDebitCode.DBIT)
//
//                    val tegenrekening = if (isDebit)
//                        (entryDetails.rltdPties?.cdtrAcct?.id?.iban ?: "onbekend")
//                    else
//                        (entryDetails.rltdPties?.dbtrAcct?.id?.iban ?: "onbekend")
//                    val naam_tegenrekening = if (isDebit)
//                        (entryDetails.rltdPties?.cdtr?.nm ?: "onbekend")
//                    else
//                        (entryDetails.rltdPties?.dbtr?.nm ?: "onbekend")
//                    val bank_informatie = "${reportEntry2.addtlNtryInf}\n $tegenrekening, $naam_tegenrekening"
//
//
//                    try {
//                        betalingRepository.save(
//                            Betaling(
//                                boekingsdatum = reportEntry2.bookgDt.dt.toGregorianCalendar().toZonedDateTime()
//                                    .toLocalDate(),
//                                bedrag = if (isDebit)
//                                    -reportEntry2.amt.value
//                                else
//                                    reportEntry2.amt.value,
//                                gebruiker = gebruiker
//                            )
//                        )
//                        aantalOpgeslagenBetalingen++
//                    } catch (_: DataIntegrityViolationException) {
//                    }
//                }
//                logger.info("Aantal opgeslagen betalingen: ${aantalOpgeslagenBetalingen}")
//            }
//        } catch (e: Exception) {
//            e.printStackTrace()
//        }
//        return "Aantal opgeslagen betalingen: ${aantalOpgeslagenBetalingen} van totaal ${aantalBetalingen} betalingen."
//    }
//}
//
