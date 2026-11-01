'use client';

import { useState, useEffect } from 'react';
import { calculateEstimatedWaitTime, QueueMetrics, EstimatedWaitTime } from '@/lib/estimator';

export default function QueuePage() {
  const [metrics] = useState<QueueMetrics>({
    userToken: 12,
    currentlyServingToken: 5,
    avgConsultationMins: 10,
    activeBreaksMins: 0,
    noShowCount: 1
  });

  const [estimate, setEstimate] = useState<EstimatedWaitTime | null>(null);

  useEffect(() => {
    const result = calculateEstimatedWaitTime(metrics);
    setEstimate(result);
  }, [metrics]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Queue Live Status</h1>
      {estimate ? (
        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
          <p className="text-lg font-semibold">Patients Ahead: {estimate.patientsAhead}</p>
          <p className="text-muted-foreground">Estimated Wait Time: {estimate.formattedRange}</p>
        </div>
      ) : (
        <p>Calculating estimate...</p>
      )}
    </main>
  );
}