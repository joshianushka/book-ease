import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    email: '',
    password: ''
  })
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
      await api.post('/auth/register', form)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const input =
    'w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10'

  return (
    <div className="min-h-screen bg-[#f8f7fc] lg:grid lg:grid-cols-2">

      {/* Left section */}
      <div className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-indigo-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">

        {/* Decorative background */}
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Brand */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-700 shadow-lg">
            <svg
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Your business journey starts here
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
            Your business.
            <br />
            <span className="text-violet-300">
              Your bookings.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100/85">
            Create your business profile and make it easier
            for customers to discover your services and book
            appointments online.
          </p>

          {/* Feature cards */}
          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </div>

              <div>
                <p className="font-semibold">Your own booking page</p>
                <p className="mt-1 text-sm text-indigo-100/75">
                  Give your services a dedicated online presence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <circle cx="9" cy="8" r="4" />
                  <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
                  <path d="m16 11 2 2 4-4" />
                </svg>
              </div>

              <div>
                <p className="font-semibold">Manage customers easily</p>
                <p className="mt-1 text-sm text-indigo-100/75">
                  Keep your appointments organized in one place.
                </p>
              </div>
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
            className="mb-8 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <svg
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

            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Bookly<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Registration card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-indigo-950/[0.04] sm:p-10">

            <div className="mb-7">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Get started
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Create your business
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Set up your profile and start accepting online bookings.
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

              {/* Business name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Business name
                </label>

                <input
                  id="name"
                  className={input}
                  name="name"
                  placeholder="e.g. Glow Beauty Studio"
                  value={form.name}
                  onChange={change}
                  autoComplete="organization"
                  required
                />
              </div>

              {/* Booking URL */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Booking page URL
                </label>

                <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                  <div className="flex items-center border-r border-gray-200 bg-gray-100 px-3 text-sm text-gray-500">
                    /
                  </div>

                  <input
                    id="slug"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    name="slug"
                    placeholder="glow-salon"
                    value={form.slug}
                    onChange={change}
                    autoComplete="off"
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    title="Use lowercase letters, numbers, and single hyphens between words."
                    required
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Business email
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

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Create password
                </label>

                <input
                  id="password"
                  className={input}
                  name="password"
                  type="password"
                  placeholder="6–20 characters"
                  value={form.password}
                  onChange={change}
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={20}
                  required
                />

                <p className="mt-2 text-xs text-gray-400">
                  Choose a password between 6 and 20 characters.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Creating account...' : 'Create business account'}

                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">ALREADY REGISTERED?</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Have an account?{' '}
              <Link
                className="font-semibold text-indigo-600 transition hover:text-indigo-800"
                to="/login"
              >
                Log in
              </Link>
            </p>

            <p className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Your account information stays protected.
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            By creating an account, you agree to our{' '}
            <Link
              to="/terms"
              className="text-gray-600 underline underline-offset-2"
            >
              Terms
            </Link>
            {' '}and{' '}
            <Link
              to="/privacy"
              className="text-gray-600 underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
