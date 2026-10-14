
/*import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const business = JSON.parse(localStorage.getItem('business'))
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  })
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      setServices((await api.get('/services')).data)
      setBookings((await api.get('/bookings')).data)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to load dashboard data')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addService = async (e) => {
    e.preventDefault()
    setMsg('')

    try {
      await api.post('/services', form)
      setForm({ name: '', description: '', price: '', duration: '' })
      await load()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add service')
    }
  }

  const generate = async () => {
    setMsg('')

    try {
      const { data } = await api.post('/ai/describe', {
        serviceName: form.name,
        businessName: business.name,
      })

      setForm({ ...form, description: data.description })
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to generate description')
    }
  }

  const setStatus = async (id, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this booking as "${status}"? Once changed, its status cannot be changed again.`
    )

    if (!confirmed) return

    setMsg('')

    try {
      await api.patch(`/bookings/${id}`, { status })
      await load()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update booking status')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const revenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.service?.price || 0), 0)

  const input =
    'rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold text-indigo-600">{business.name}</h1>

        <div className="flex items-center gap-4 text-sm">
          <a
            className="text-indigo-600 underline"
            href={`/b/${business.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            Public page
          </a>

          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl space-y-8 p-6">
        {msg && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-600">
            {msg}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Total bookings', bookings.length],
            ['Services', services.length],
            ['Revenue (completed)', '₹' + revenue],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Add a service</h2>

          <form onSubmit={addService} className="grid gap-3 sm:grid-cols-2">
            <input
              className={input}
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />

            <input
              className={input}
              placeholder="Price (₹)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
            />

            <input
              className={input}
              placeholder="Duration (minutes)"
              type="number"
              min="1"
              step="1"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
              required
            />

            <div className="flex gap-2">
              <input
                className={input + ' flex-1'}
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <button
                type="button"
                onClick={generate}
                disabled={!form.name.trim()}
                className="rounded-lg bg-purple-100 px-3 text-sm font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
              >
                ✨ AI
              </button>
            </div>

            <button className="rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 sm:col-span-2">
              Add service
            </button>
          </form>

          <ul className="mt-4 divide-y">
            {services.map((s) => (
              <li
                key={s._id}
                className="flex justify-between py-2 text-sm"
              >
                <span>{s.name} · {s.duration} min</span>
                <span className="font-medium">₹{s.price}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Bookings</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2">Customer</th>
                  <th>Service</th>
                  <th>When</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-2">{b.customerName}</td>
                    <td>{b.service?.name}</td>
                    <td>{b.date} {b.startTime}</td>

                    <td>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        {b.status}
                      </span>
                    </td>

                    <td className="py-2">
                      {b.status === 'confirmed' ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <button
                            onClick={() => setStatus(b._id, 'completed')}
                            className="text-green-600 hover:underline"
                          >
                            Done
                          </button>

                          <button
                            onClick={() => setStatus(b._id, 'no-show')}
                            className="text-orange-600 hover:underline"
                          >
                            No-show
                          </button>

                          <button
                            onClick={() => setStatus(b._id, 'cancelled')}
                            className="text-red-600 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Status locked
                        </span>
                      )}
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
}*/


import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const business = JSON.parse(localStorage.getItem('business'))
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  })
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      setServices((await api.get('/services')).data)
      setBookings((await api.get('/bookings')).data)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to load dashboard data')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addService = async (e) => {
    e.preventDefault()
    setMsg('')

    try {
      await api.post('/services', form)
      setForm({ name: '', description: '', price: '', duration: '' })
      await load()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add service')
    }
  }

  const generate = async () => {
    setMsg('')

    try {
      const { data } = await api.post('/ai/describe', {
        serviceName: form.name,
        businessName: business.name,
      })

      setForm({ ...form, description: data.description })
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to generate description')
    }
  }

  const setStatus = async (id, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this booking as "${status}"? Once changed, its status cannot be changed again.`
    )

    if (!confirmed) return

    setMsg('')

    try {
      await api.patch(`/bookings/${id}`, { status })
      await load()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update booking status')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const revenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.service?.price || 0), 0)

  const input =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'

  const statusStyles = {
    confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/10',
    'no-show': 'bg-orange-50 text-orange-700 ring-orange-600/10',
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h3M8 16h6" />
              </svg>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                {business.name}
              </h1>
              <p className="text-xs text-gray-500">Business dashboard</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <a
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
              href={`/b/${business.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path d="M14 4h6v6M20 4l-9 9" />
                <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
              </svg>
              <span className="hidden sm:inline">Public page</span>
              <span className="sm:hidden">View page</span>
            </a>

            <button
              onClick={logout}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-indigo-600">
              OVERVIEW
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage your services, appointments and business activity.
            </p>
          </div>

          <a
            href={`/b/${business.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            View booking page
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {/* Error message */}
        {msg && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 h-5 w-5 shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5h.01" />
            </svg>
            <p>{msg}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total bookings
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {bookings.length}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  All recorded appointments
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                  <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h3M8 16h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active services
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {services.length}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Services listed on your page
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
                  <path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21M8 5.3l8 4.6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 sm:p-6 xl:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed revenue
                </p>
                <p className="mt-3 break-all text-3xl font-bold tracking-tight text-gray-900">
                  ₹{revenue.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  From completed bookings only
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M3 10h18M8 15h3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Add service */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
            <h2 className="text-lg font-bold text-gray-900">
              Manage services
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a service that customers can book through your public page.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <form onSubmit={addService} className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Service name
                </label>
                <input
                  className={input}
                  placeholder="e.g. Haircut and styling"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Price (₹)
                </label>
                <input
                  className={input}
                  placeholder="e.g. 499"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Duration
                </label>
                <div className="relative">
                  <input
                    className={`${input} pr-24`}
                    placeholder="e.g. 45"
                    type="number"
                    min="1"
                    step="1"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    required
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                <div className="flex gap-2">
                  <input
                    className={input}
                    placeholder="Describe what the service includes"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />

                  <button
                    type="button"
                    onClick={generate}
                    disabled={!form.name.trim()}
                    className="shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                    title="Generate a service description"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-gray-500">
                  Keep your service details clear so customers know what to expect.
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add service
                </button>
              </div>
            </form>
          </div>

          {/* Service list */}
          <div className="border-t border-gray-100">
            <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-7">
              <h3 className="font-semibold text-gray-900">Your services</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {services.length} total
              </span>
            </div>

            {services.length === 0 ? (
              <div className="px-5 pb-7 pt-2 text-center sm:px-7">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
                    <path d="M12 12v9" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-800">
                  No services added yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first service using the form above.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {services.map((s) => (
                  <li
                    key={s._id}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
                          <path d="M12 12v9" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-gray-900">
                          {s.name}
                        </p>
                        {s.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {s.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {s.duration} minutes
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-base font-bold text-gray-900 sm:text-right">
                      ₹{Number(s.price).toLocaleString('en-IN')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Bookings */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review customer appointments and update their status.
              </p>
            </div>

            <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {bookings.length} bookings
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                  <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-800">
                No bookings yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Customer appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Service</th>
                    <th className="px-6 py-4 font-semibold">Date & time</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr
                      key={b._id}
                      className="transition hover:bg-gray-50/80"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {b.customerName}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {b.service?.name || 'Service unavailable'}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {b.date}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {b.startTime}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                            statusStyles[b.status] ||
                            'bg-gray-100 text-gray-600 ring-gray-500/10'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {b.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {b.status === 'confirmed' ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setStatus(b._id, 'completed')}
                              className="font-semibold text-emerald-600 transition hover:text-emerald-800 hover:underline"
                            >
                              Done
                            </button>

                            <button
                              onClick={() => setStatus(b._id, 'no-show')}
                              className="font-medium text-orange-600 transition hover:text-orange-800 hover:underline"
                            >
                              No-show
                            </button>

                            <button
                              onClick={() => setStatus(b._id, 'cancelled')}
                              className="font-medium text-red-600 transition hover:text-red-800 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Status locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {bookings.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 sm:px-7">
              <p className="text-xs text-gray-500">
                Booking status becomes locked after an update.
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-5 text-center">
          <p className="text-xs text-gray-400">
            {business.name} · Business management dashboard
          </p>
        </footer>
      </main>
    </div>
  )
}

