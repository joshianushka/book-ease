import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function PublicBooking() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [service, setService] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState('')
  const [customer, setCustomer] = useState({ customerName: '', customerEmail: '', customerPhone: '' })
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    api.get(`/public/${slug}`).then((r) => setData(r.data)).catch(() => setMsg('Business not found'))
  }, [slug])

  useEffect(() => {
    if (service && date) {
      setTime('')
      api.get(`/public/${slug}/slots`, { params: { serviceId: service._id, date } })
        .then((r) => setSlots(r.data))
    }
  }, [service, date, slug])

  const book = async (e) => {
    e.preventDefault()
    try {
      await api.post('/bookings', { slug, serviceId: service._id, date, startTime: time, ...customer })
      setDone(true)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Booking failed')
    }
  }

  if (!data) return <p className="p-8 text-center text-gray-500">{msg || 'Loading...'}</p>
  if (done)
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-green-600">Booking confirmed 🎉</h1>
          <p className="mt-2 text-gray-600">{service.name} on {date} at {time}. Check your email.</p>
        </div>
      </div>
    )

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-center text-3xl font-bold text-gray-900">{data.business.name}</h1>
        {msg && <p className="rounded bg-red-50 p-2 text-center text-sm text-red-600">{msg}</p>}

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-3 font-semibold">1. Choose a service</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.services.map((s) => (
              <button key={s._id} onClick={() => setService(s)}
                className={`rounded-lg border p-3 text-left transition ${
                  service?._id === s._id ? 'border-indigo-600 bg-indigo-50' : 'hover:border-indigo-300'}`}>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
                <p className="mt-1 text-sm">₹{s.price} · {s.duration} min</p>
              </button>
            ))}
          </div>
        </section>

        {service && (
          <section className="rounded-xl bg-white p-5 shadow">
            <h2 className="mb-3 font-semibold">2. Pick date and time</h2>
            <input type="date" min={today} className={input} value={date}
              onChange={(e) => setDate(e.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              {date && slots.length === 0 && <p className="text-sm text-gray-500">No slots available.</p>}
              {slots.map((t) => (
                <button key={t} onClick={() => setTime(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    time === t ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </section>
        )}

        {time && (
          <form onSubmit={book} className="space-y-3 rounded-xl bg-white p-5 shadow">
            <h2 className="font-semibold">3. Your details</h2>
            <input className={input} placeholder="Name" required
              onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })} />
            <input className={input} type="email" placeholder="Email" required
              onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })} />
            <input className={input} placeholder="Phone"
              onChange={(e) => setCustomer({ ...customer, customerPhone: e.target.value })} />
            <button className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700">
              Confirm booking
            </button>
          </form>
        )}
      </div>
    </div>
  )
}