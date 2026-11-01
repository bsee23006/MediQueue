package com.mediqueue.domain

import kotlin.math.max
import kotlin.math.roundToInt

data class QueueMetrics(
    val userToken: Int,
    val currentlyServingToken: Int,
    val avgConsultationMins: Int = 15,
    val activeBreaksMins: Int = 0,
    val noShowCount: Int = 0
)

data class WaitTimeEstimate(
    val patientsAhead: Int,
    val minWaitMins: Int,
    val maxWaitMins: Int,
    val formattedRange: String
)

object QueueEstimator {

    fun calculate(metrics: QueueMetrics): WaitTimeEstimate {
        val patientsAhead = max(0, metrics.userToken - metrics.currentlyServingToken - 1 - metrics.noShowCount)

        if (patientsAhead == 0) {
            return WaitTimeEstimate(
                patientsAhead = 0,
                minWaitMins = 0,
                maxWaitMins = 5,
                formattedRange = "5 mins or less"
            )
        }

        val minWait = max(0, (patientsAhead * (metrics.avgConsultationMins * 0.8) + metrics.activeBreaksMins).roundToInt())
        val maxWait = (patientsAhead * (metrics.avgConsultationMins * 1.3) + metrics.activeBreaksMins + 10).roundToInt()

        return WaitTimeEstimate(
            patientsAhead = patientsAhead,
            minWaitMins = minWait,
            maxWaitMins = maxWait,
            formattedRange = " -  mins"
        )
    }
}
