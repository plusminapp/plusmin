package io.vliet.plusmin

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import io.vliet.plusmin.repository.RekeningRepository
import io.vliet.plusmin.repository.GebruikerRepository
import io.vliet.plusmin.repository.BetalingRepository
import io.vliet.plusmin.service.BetalingService
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Rekening
import java.util.Optional
import java.time.LocalDate
import java.math.BigDecimal
import io.vliet.plusmin.TestFixtures.testGebruiker
import io.vliet.plusmin.TestFixtures.testBetaalrekening
import io.vliet.plusmin.TestFixtures.testUitgave
import io.vliet.plusmin.TestFixtures.testBetalingDTO
import io.vliet.plusmin.TestFixtures.testBetalingenLijst
import io.vliet.plusmin.TestFixtures.testBetaling

class BetalingServiceTest {

    @Mock
    lateinit var rekeningRepository: RekeningRepository
    

    @Mock
    lateinit var gebruikerRepository: GebruikerRepository

    @Mock
    lateinit var betalingRepository: BetalingRepository

    @InjectMocks
    lateinit var betalingService: BetalingService

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun testSaveAll() {
        `when`(rekeningRepository.findRekeningGebruikerEnNaam(testGebruiker, "Betaalrekening"))
            .thenReturn(Optional.of(testBetaalrekening))
        `when`(rekeningRepository.findRekeningGebruikerEnNaam(testGebruiker, "Uitgave"))
            .thenReturn(Optional.of(testUitgave))
        `when`(betalingRepository.save(any(Betaling::class.java))).thenReturn(testBetaling)

        val result = betalingService.saveAll(testGebruiker, testBetalingenLijst)

        assertEquals(1, result.size)
        assertEquals("Test betaling", result[0].omschrijving)
    }

    @Test
    fun testSaveAllThrowsExceptionWhenRekeningNotFound() {
        `when`(rekeningRepository.findRekeningGebruikerEnNaam(testGebruiker, "Rekening1")).thenReturn(Optional.empty())

        assertThrows<Exception> {
            betalingService.saveAll(testGebruiker, testBetalingenLijst)
        }
    }
}