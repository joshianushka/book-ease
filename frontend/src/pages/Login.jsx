


import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('business', JSON.stringify(data.business))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const input =
    'w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition duration-200 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10'

  return (
    <div className="min-h-screen bg-[#f8f7fc] lg:grid lg:grid-cols-2">

      {/* Left section */}
      <div className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-indigo-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">

        {/* Decorative background */}
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Brand */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg ring-1 ring-white/20">
            
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-6 w-6"
>
  <rect x="3" y="5" width="18" height="16" rx="3" />
  <path d="M16 3v4M8 3v4M3 10h18" />
  <path d="m9 15 2 2 4-4" />
</svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Bookly<span className="text-violet-300">.</span>
          </span>
        </Link>

        {/* Main content */}
        <div className="relative z-10 max-w-xl py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-violet-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Your services, all in one place
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
            Great service.
            <br />
            <span className="text-violet-300">
              Perfect timing.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100/85">
            Manage your business, accept appointments, and give
            your customers a smoother booking experience.
          </p>

          {/* Feature cards */}
          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                📅
              </div>
              <div>
                <p className="font-semibold">Effortless scheduling</p>
                <p className="mt-1 text-sm text-indigo-100/75">
                  Keep every appointment organized.
                </p>
              </div>
              <div className="ml-auto text-emerald-300">✓</div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                ⚡
              </div>
              <div>
                <p className="font-semibold">Bookings made simple</p>
                <p className="mt-1 text-sm text-indigo-100/75">
                  Spend less time managing, more time growing.
                </p>
              </div>
              <div className="ml-auto text-emerald-300">✓</div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-indigo-100/70">
          <p>Made for businesses that care.</p>
          <p>Simple. Smart. Seamless.</p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">

        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <Link
            to="/"
            className="mb-10 flex items-center justify-center gap-2 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl text-white">
             
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-6 w-6"
>
  <rect x="3" y="5" width="18" height="16" rx="3" />
  <path d="M16 3v4M8 3v4M3 10h18" />
  <path d="m9 15 2 2 4-4" />
</svg>

            </span>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Bookly<span className="text-violet-600">.</span>
            </span>
          </Link>

          {/* Login card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-indigo-950/[0.04] sm:p-10">

            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600 ring-1 ring-violet-100">
             
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-6 w-6"
>
  <rect x="3" y="5" width="18" height="16" rx="3" />
  <path d="M16 3v4M8 3v4M3 10h18" />
  <path d="m9 15 2 2 4-4" />
</svg>

              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Manage your services and keep your bookings running smoothly.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
              >
                <span>⚠</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  className={input}
                  name="email"
                  type="email"
                  placeholder="you@yourbusiness.com"
                  value={form.email}
                  onChange={change}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  {/* Add your forgot-password route here when available */}
                  <span className="text-xs text-gray-400">
                    Keep it secure
                  </span>
                </div>

                <input
                  id="password"
                  className={input}
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={change}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-600/25 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Signing in...' : 'Sign in to dashboard'}
                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">
                NEW TO BOOKLY?
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              Create your business account
            </Link>

            <p className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>🔒</span>
              Your account information stays protected.
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-gray-600 underline underline-offset-2">
              Terms
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-gray-600 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
