'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { calculateEstimatedWaitTime, EstimatedWaitTime } from '@/lib/estimator'
import { Clock, Users } from 'lucide-react'

export default function LiveQueueTracker() {
  const [currentlyServing, setCurrentlyServing] = useState<number>(0)
  const [userToken] = useState<number>(5)
  const [estimate, setEstimate] = useState<EstimatedWaitTime | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchInitialStatus() {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('appointments')
        .select('token_number')
        .eq('booking_date', today)
        .in('status', ['IN_CONSULTATION', 'CALLED'])
        .order('token_number', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        setCurrentlyServing(data[0].token_number)
      }
    }

    fetchInitialStatus()

    const channel = supabase
      .channel('realtime_queue')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.new.status === 'IN_CONSULTATION' || payload.new.status === 'CALLED') {
            setCurrentlyServing(payload.new.token_number)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const calc = calculateEstimatedWaitTime({
      userToken,
      currentlyServingToken: currentlyServing,
      avgConsultationMins: 15,
      activeBreaksMins: 0,
      noShowCount: 0
    })
    setEstimate(calc)
  }, [currentlyServing, userToken])

  return (
    <div className="min-h-screen bg-[#F7FAF8] p-8 text-[#253B32]">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#16845B]">Live Queue Tracker</h1>
        <p className="text-sm text-[#718078]">Realtime appointment status & estimated waiting times</p>
      </header>

      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm border border-gray-100">
          <p className="text-sm font-semibold uppercase text-[#718078]">Now Serving</p>
          <span className="mt-2 block text-6xl font-black text-[#16845B]">
            #{String(currentlyServing).padStart(3, '0')}
          </span>
        </div>

        {estimate && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <Users className="h-8 w-8 text-[#16845B]" />
              <div>
                <p className="text-xs text-[#718078]">Patients Ahead</p>
                <p className="text-2xl font-bold text-[#253B32]">{estimate.patientsAhead}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <Clock className="h-8 w-8 text-[#16845B]" />
              <div>
                <p className="text-xs text-[#718078]">Estimated Wait</p>
                <p className="text-lg font-bold text-[#16845B]">{estimate.formattedRange}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
