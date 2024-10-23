package io.vliet.plusmin

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PlusMinApplication

fun main(args: Array<String>) {
	runApplication<PlusMinApplication>(*args)
}
