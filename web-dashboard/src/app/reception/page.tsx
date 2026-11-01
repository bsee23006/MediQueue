'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { UserPlus, Ticket } from 'lucide-react'

export default function ReceptionDashboard() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [allocatedToken, setAllocatedToken] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleWalkInBooking(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAllocatedToken(null)

    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data: doctor } = await supabase.from('doctors').select('id, branch_id, branches(clinic_id)').single()

      if (!doctor) throw new Error('No default doctor found.')

      const { data, error: rpcError } = await supabase.rpc('allocate_next_token', {
        p_clinic_id: (doctor.branches as any).clinic_id,
        p_branch_id: doctor.branch_id,
        p_doctor_id: doctor.id,
        p_patient_id: '00000000-0000-0000-0000-000000000000',
        p_booking_date: today,
        p_source: 'WALK_IN'
      })

      if (rpcError) throw rpcError

      if (data && data.length > 0) {
        setAllocatedToken(data[0].allocated_token)
        setFullName('')
        setPhone('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to issue token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8] p-8 text-[#253B32]">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#16845B]">Receptionist Desk</h1>
        <p className="text-sm text-[#718078]">Walk-in Registration & Cash Collection</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#253B32]">
            <UserPlus className="h-5 w-5 text-[#16845B]" /> Issue Walk-In Token
          </h2>

          <form onSubmit={handleWalkInBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#718078]">Patient Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#16845B] focus:outline-none"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#718078]">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#16845B] focus:outline-none"
                placeholder="+92 300 0000000"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#16845B] py-3 text-white font-medium hover:bg-[#126b49]"
            >
              {loading ? 'Processing...' : 'Collect Fee & Generate Token'}
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm border border-gray-100 text-center">
          {allocatedToken ? (
            <div className="w-full rounded-xl bg-[#E9F5EF] p-8">
              <Ticket className="mx-auto h-12 w-12 text-[#16845B]" />
              <p className="mt-2 text-sm uppercase text-[#718078]">Walk-in Token Issued</p>
              <span className="text-6xl font-black text-[#16845B]">
                #{String(allocatedToken).padStart(3, '0')}
              </span>
              <p className="mt-4 text-xs text-[#718078]">
                Status: CHECKED_IN | Source: WALK_IN | Payment: PAID
              </p>
            </div>
          ) : (
            <div className="text-[#718078]">
              <Ticket className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm">Enter patient details to issue a live token.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
