import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const business = JSON.parse(localStorage.getItem('business'))
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '' })

  const load = async () => {
    setServices((await api.get('/services')).data)
    setBookings((await api.get('/bookings')).data)
  }
  useEffect(() => { load() }, [])

  const addService = async (e) => {
    e.preventDefault()
    await api.post('/services', form)
    setForm({ name: '', description: '', price: '', duration: '' })
    load()
  }

  const generate = async () => {
    const { data } = await api.post('/ai/describe', {
      serviceName: form.name, businessName: business.name,
    })
    setForm({ ...form, description: data.description })
  }

  const setStatus = async (id, status) => { await api.patch(`/bookings/${id}`, { status }); load() }

  const logout = () => { localStorage.clear(); navigate('/login') }

  const revenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.service.price, 0)

  const input = 'rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold text-indigo-600">{business.name}</h1>
        <div className="flex items-center gap-4 text-sm">
          <a className="text-indigo-600 underline" href={`/b/${business.slug}`} target="_blank">Public page</a>
          <button onClick={logout} className="text-gray-500 hover:text-gray-800">Logout</button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl space-y-8 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[['Total bookings', bookings.length], ['Services', services.length], ['Revenue (completed)', '₹' + revenue]]
            .map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
        </div>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Add a service</h2>
          <form onSubmit={addService} className="grid gap-3 sm:grid-cols-2">
            <input className={input} placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className={input} placeholder="Price (₹)" type="number" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className={input} placeholder="Duration (minutes)" type="number" value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
            <div className="flex gap-2">
              <input className={input + ' flex-1'} placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button type="button" onClick={generate} disabled={!form.name}
                className="rounded-lg bg-purple-100 px-3 text-sm font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                ✨ AI
              </button>
            </div>
            <button className="rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 sm:col-span-2">
              Add service
            </button>
          </form>
          <ul className="mt-4 divide-y">
            {services.map((s) => (
              <li key={s._id} className="flex justify-between py-2 text-sm">
                <span>{s.name} · {s.duration} min</span><span className="font-medium">₹{s.price}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr><th className="py-2">Customer</th><th>Service</th><th>When</th><th>Status</th><th></th></tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-2">{b.customerName}</td>
                    <td>{b.service?.name}</td>
                    <td>{b.date} {b.startTime}</td>
                    <td><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{b.status}</span></td>
                    <td className="space-x-2 text-xs">
                      <button onClick={() => setStatus(b._id, 'completed')} className="text-green-600">Done</button>
                      <button onClick={() => setStatus(b._id, 'no-show')} className="text-orange-600">No-show</button>
                      <button onClick={() => setStatus(b._id, 'cancelled')} className="text-red-600">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}