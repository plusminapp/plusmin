package io.vliet.plusmin.controller

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.*
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.DataRetrievalFailureException
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.web.servlet.resource.NoResourceFoundException

@ControllerAdvice
class GlobalExceptionHandler {

    val logger: Logger = LoggerFactory.getLogger(this.javaClass.name)

    @ExceptionHandler(DataRetrievalFailureException::class)
    fun handleResourceNotFound(ex: DataRetrievalFailureException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            errorCode = "NOT_FOUND",
            errorMessage = ex.message ?: "Resource not found"
        )
        return ResponseEntity(error, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(NoResourceFoundException::class)
    fun handleResourceNotFound(ex: NoResourceFoundException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            errorCode = "NOT_FOUND",
            errorMessage = ex.message ?: "Resource not found"
        )
        return ResponseEntity(error, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolation(ex: DataIntegrityViolationException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            errorCode = "BAD_REQUEST",
            errorMessage = ex.message ?: "Reference already exists"
        )
        logger.error(ex.stackTraceToString())
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            errorCode = "BAD_REQUEST",
            errorMessage = ex.message ?: "Illegal argument used"
        )
        logger.error(ex.message)
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errorMessage = ex.bindingResult.allErrors.joinToString("; ") { it.defaultMessage ?: "Invalid input" }
        val error = ErrorResponse(
            errorCode = "BAD_REQUEST",
            errorMessage = errorMessage
        )
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        val errorMessage = ex.message ?: "Invalid input"
        val error = ErrorResponse(
            errorCode = "BAD_REQUEST",
            errorMessage = errorMessage
        )
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(AuthorizationDeniedException::class)
    fun handleAuthorizationDeniedException(ex: AuthorizationDeniedException): ResponseEntity<ErrorResponse> {
        val errorMessage = ex.message ?: "Access denied"
        val error = ErrorResponse(
            errorCode = "UNAUTHORIZED",
            errorMessage = errorMessage
        )
        return ResponseEntity(error, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            errorCode = "INTERNAL_SERVER_ERROR",
            errorMessage = ex.message ?: "An unexpected error occurred"
        )
        logger.error(ex.stackTraceToString())
        return ResponseEntity(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    data class ErrorResponse(
        val errorCode: String,
        val errorMessage: String
    )
}
