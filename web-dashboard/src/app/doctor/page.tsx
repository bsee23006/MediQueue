'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { UserCheck, Play, CheckCircle2, Clock, Pause } from 'lucide-react'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeToken, setActiveToken] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchQueue() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('appointments')
        .select('*, profiles(full_name, phone_number)')
        .eq('booking_date', today)
        .order('token_number', { ascending: true })

      if (data) {
        setAppointments(data)
        const current = data.find((a) => a.status === 'IN_CONSULTATION' || a.status === 'CALLED')
        setActiveToken(current || null)
      }
      setLoading(false)
    }

    fetchQueue()
  }, [])

  async function updateStatus(appointmentId: string, newStatus: string) {
    const supabase = createClient()
    await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)

    // Refresh queue state
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('appointments')
      .select('*, profiles(full_name, phone_number)')
      .eq('booking_date', today)
      .order('token_number', { ascending: true })

    if (data) {
      setAppointments(data)
      const current = data.find((a) => a.status === 'IN_CONSULTATION' || a.status === 'CALLED')
      setActiveToken(current || null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8] p-8 text-[#253B32]">
      <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16845B]">Doctor Dashboard</h1>
          <p className="text-sm text-[#718078]">MediQueue Live Token Management</p>
        </div>
        <div className="rounded-lg bg-[#E9F5EF] px-4 py-2 font-medium text-[#16845B]">
          Today&apos;s Queue
        </div>
      </header>

      {/* Active Serving Banner */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#718078]">
          Currently Serving
        </h2>
        {activeToken ? (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-5xl font-black text-[#16845B]">
                #{String(activeToken.token_number).padStart(3, '0')}
              </span>
              <p className="mt-1 text-lg font-medium text-[#253B32]">
                {activeToken.profiles?.full_name || 'Walk-in Patient'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(activeToken.id, 'COMPLETED')}
                className="flex items-center gap-2 rounded-lg bg-[#16845B] px-5 py-2.5 text-white hover:bg-[#126b49]"
              >
                <CheckCircle2 className="h-5 w-5" /> Complete Consultation
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[#718078]">No patient currently in consultation.</p>
        )}
      </div>

      {/* Queue List */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-4 text-lg font-bold text-[#253B32]">Patient Queue</h2>
        {loading ? (
          <p className="text-[#718078]">Loading queue...</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((app) => (
              <div key={app.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-[#16845B]">
                    #{String(app.token_number).padStart(3, '0')}
                  </span>
                  <div>
                    <p className="font-semibold text-[#253B32]">
                      {app.profiles?.full_name || 'Walk-in Patient'}
                    </p>
                    <span className="text-xs text-[#718078] uppercase">{app.source}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#E9F5EF] px-3 py-1 text-xs font-semibold text-[#16845B]">
                    {app.status}
                  </span>
                  {app.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => updateStatus(app.id, 'CALLED')}
                      className="flex items-center gap-1 rounded-md bg-[#16845B] px-3 py-1.5 text-xs text-white"
                    >
                      <Play className="h-4 w-4" /> Call Next
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
