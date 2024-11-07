package io.vliet.plusmin.repository

import io.vliet.plusmin.controller.BetalingDatumFilter
import io.vliet.plusmin.domain.Betaling
import io.vliet.plusmin.domain.Gebruiker
import io.vliet.plusmin.service.PagingService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.stereotype.Component
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext

@Component
class BetalingDao {

    @PersistenceContext
    lateinit var entityManager: EntityManager
    @Autowired
    lateinit var pagingService: PagingService

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    fun search(gebruiker: Gebruiker, sizeAsString: String, pageAsString: String, sort: String, queryString: String, statusString: String?, dateFilter: BetalingDatumFilter?): PagingService.ContentWrapper {

        val pageRequest = pagingService.toPageRequest(pageAsString, sizeAsString, sort, Betaling.sortableFields, "boekingsdatum")
        val sortSplitted = sort.trim().split(":")
        val sortField = if (Betaling.sortableFields.contains(sortSplitted[0])) sortSplitted[0] else "boekingsdatum"

        val selectClause = "SELECT b FROM Betaling b "
        val countClause = "SELECT COUNT(*) FROM Betaling b "

        val gebruikerSelectBody = "b.gebruiker.id = ${gebruiker.id}"

        val queryTokens = queryString.trim().split(" ")
        val fields = listOf("referentie", "tegenrekening", "naam_tegenrekening", "betalingskenmerk", "omschrijving_bank", "omschrijving", "categorie")
        val querySelectBody = if (queryTokens[0].isNotBlank()) {
            (queryTokens.indices).joinToString(prefix = " (", separator = ") AND (", postfix = ") ") { index ->
                fields.joinToString(" OR ") { field -> "LOWER(b.$field) LIKE :q$index" }
            }
        } else null
        logger.info("querySelectBody: ${querySelectBody}")

        val statusTokens: List<String>? = statusString?.trim()?.split(",")
        val statusSelectBody = if (statusTokens != null && statusTokens[0].isNotBlank()) {
            statusTokens.joinToString(separator = " OR ") { " b.status = '$it'" }
        } else null

        val dateSelectBody = if (dateFilter != null && dateFilter.literal.isNotEmpty()) {
            if (dateFilter.literal === "?") {
                " (boekingsdatum IS NULL) "
            } else {
                " (boekingsdatum ${dateFilter.literal} current_date) "
            }
        } else null

        val queryBodyList = listOf(gebruikerSelectBody, querySelectBody, statusSelectBody, dateSelectBody).mapNotNull { it }
        val queryBody = if (queryBodyList.isNotEmpty())
            queryBodyList.joinToString(prefix = " WHERE (", separator = ") AND (", postfix = ") ")
        else ""

        val querySelect = selectClause + queryBody + " ORDER BY b.$sortField " +
                if (sortSplitted.size >= 2 && sortSplitted[1] == "desc") "DESC" else ""
        val queryCount = countClause + queryBody

        val qSelect = entityManager
            .createQuery(querySelect, Betaling::class.java)
            .setFirstResult(pageRequest.offset.toInt())
            .setMaxResults(pageRequest.pageSize)

        val qCount = entityManager
            .createQuery(queryCount, Long::class.javaObjectType)

        val parameterMap: Map<String, String> = queryTokens.mapIndexed { index, s -> "q$index" to s }.toMap()
        if (queryTokens[0].isNotBlank()) parameterMap.forEach {
            qSelect.setParameter(it.key, "%${it.value}%")
            qCount.setParameter(it.key, "%${it.value}%")
        }

        val content = (qSelect.resultList as List<Betaling>)
        val count = (qCount.singleResult)

        val page = PageImpl(content, pageRequest, count)
        return PagingService.ContentWrapper(
            data = page as Page<Any>,
            gebruikersId = gebruiker.id,
            gebruikersEmail = gebruiker.email,
            gebruikersBijnaam = gebruiker.bijnaam
            )
    }
}
