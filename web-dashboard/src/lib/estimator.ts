export interface QueueMetrics {
  userToken: number
  currentlyServingToken: number
  avgConsultationMins: number
  activeBreaksMins: number
  noShowCount: number
}

export interface EstimatedWaitTime {
  patientsAhead: number
  minWaitMins: number
  maxWaitMins: number
  formattedRange: string
}

export function calculateEstimatedWaitTime(metrics: QueueMetrics): EstimatedWaitTime {
  const { userToken, currentlyServingToken, avgConsultationMins, activeBreaksMins, noShowCount } = metrics

  const patientsAhead = Math.max(0, userToken - currentlyServingToken - 1 - noShowCount)
  
  if (patientsAhead === 0) {
    return {
      patientsAhead: 0,
      minWaitMins: 0,
      maxWaitMins: 5,
      formattedRange: '5 mins or less'
    }
  }

  // Minimum estimate (-20% margin)
  const minWaitMins = Math.max(0, Math.round(patientsAhead * (avgConsultationMins * 0.8) + activeBreaksMins))

  // Maximum estimate (+30% margin for delays)
  const maxWaitMins = Math.round(patientsAhead * (avgConsultationMins * 1.3) + activeBreaksMins + 10)

  return {
    patientsAhead,
    minWaitMins,
    maxWaitMins,
    formattedRange: ${minWaitMins} -  mins
  }
}
