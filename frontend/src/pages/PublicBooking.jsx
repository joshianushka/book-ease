
/*import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })
}

export default function PublicBooking() {
  const { slug } = useParams()

  const [data, setData] = useState(null)
  const [service, setService] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState('')

  const [customer, setCustomer] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  })

  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    api
      .get(`/public/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => setMsg('Business not found'))
  }, [slug])

  useEffect(() => {
    if (!service || !date) {
      setSlots([])
      return
    }

    setTime('')
    setSlots([])

    api
      .get(`/public/${slug}/slots`, {
        params: { serviceId: service._id, date },
      })
      .then((r) => setSlots(r.data))
      .catch(() => setMsg('Could not load available time slots.'))
  }, [service, date, slug])

  const book = async (e) => {
    e.preventDefault()

    if (!service || !date || !time) {
      setMsg('Please select a service, date and time.')
      return
    }

    setMsg('')
    setIsProcessing(true)

    try {
      // 1. Load Razorpay Checkout
      const loaded = await loadRazorpayScript()

      if (!loaded) {
        setMsg('Could not load Razorpay. Please check your internet connection.')
        setIsProcessing(false)
        return
      }

      // 2. Ask the backend to create a Razorpay order
      const orderResponse = await api.post('/bookings/create-order', {
        slug,
        serviceId: service._id,
        date,
        startTime: time,
        ...customer,
      })

      const order = orderResponse.data

      // 3. Open Razorpay Checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: order.businessName || data.business.name,
        description: order.serviceName || service.name,
        order_id: order.orderId,

        prefill: {
          name: customer.customerName,
          email: customer.customerEmail,
          contact: customer.customerPhone,
        },

        theme: {
          color: '#4f46e5',
        },

        // 4. Send Razorpay's response to your backend for verification
        handler: async (response) => {
          try {
            const verificationResponse = await api.post(
              '/bookings/verify-payment',
              {
                bookingId: order.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            )

            if (verificationResponse.data.success) {
              setDone(true)
              setMsg('')
            } else {
              setMsg(
                verificationResponse.data.message ||
                  'Payment verification is incomplete. Please check your booking status.'
              )
            }
          } catch (err) {
            setMsg(
              err.response?.data?.message ||
                'We could not confirm the payment status. Please check your booking status before trying to pay again.'
            )
          } finally {
            setIsProcessing(false)
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            setMsg(
              'Checkout was closed. Your payment may still be processing; check its status before trying again.'
            )
          },
        },
      }

      const checkout = new window.Razorpay(options)

      checkout.on('payment.failed', (response) => {
        setIsProcessing(false)
        setMsg(
          response.error?.description ||
            'Payment failed. Check the payment status before trying again.'
        )
      })

      checkout.open()
    } catch (err) {
      setIsProcessing(false)
      setMsg(
        err.response?.data?.message ||
          'Could not start the booking or payment process.'
      )
    }
  }

  if (!data) {
    return (
      <p className="p-8 text-center text-gray-500">
        {msg || 'Loading...'}
      </p>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mb-3 text-5xl">✓</div>

          <h1 className="text-2xl font-bold text-green-600">
            Booking confirmed!
          </h1>

          <p className="mt-3 text-gray-600">
            Your payment was verified successfully.
          </p>

          <div className="mt-5 space-y-2 rounded-lg bg-gray-50 p-4 text-left text-sm">
            <p>
              <span className="font-medium">Service:</span>{' '}
              {service.name}
            </p>

            <p>
              <span className="font-medium">Date:</span> {date}
            </p>

            <p>
              <span className="font-medium">Time:</span> {time}
            </p>

            <p>
              <span className="font-medium">Amount:</span> ₹{service.price}
            </p>

            <p className="font-medium text-green-700">
              Payment status: Paid
            </p>
          </div>
        </div>
      </div>
    )
  }

  const input =
    'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  // Use local date rather than UTC to avoid date differences.
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          {data.business.name}
        </h1>

        {msg && (
          <p
            role="status"
            className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700"
          >
            {msg}
          </p>
        )}

        
        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-3 font-semibold">1. Choose a service</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.services.map((s) => (
              <button
                type="button"
                key={s._id}
                disabled={isProcessing}
                onClick={() => {
                  setService(s)
                  setDate('')
                  setTime('')
                  setMsg('')
                }}
                className={`rounded-lg border p-3 text-left transition ${
                  service?._id === s._id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'hover:border-indigo-300'
                }`}
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
                <p className="mt-1 text-sm">
                  ₹{s.price} · {s.duration} min
                </p>
              </button>
            ))}
          </div>
        </section>

    
        {service && (
          <section className="rounded-xl bg-white p-5 shadow">
            <h2 className="mb-3 font-semibold">
              2. Pick date and time
            </h2>

            <input
              type="date"
              min={today}
              className={input}
              value={date}
              disabled={isProcessing}
              onChange={(e) => {
                setDate(e.target.value)
                setMsg('')
              }}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {date && slots.length === 0 && (
                <p className="text-sm text-gray-500">
                  No slots available, or slots are still loading.
                </p>
              )}

              {slots.map((t) => (
                <button
                  type="button"
                  key={t}
                  disabled={isProcessing}
                  onClick={() => {
                    setTime(t)
                    setMsg('')
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    time === t
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'hover:bg-indigo-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        )}

        
        {time && (
          <form
            onSubmit={book}
            className="space-y-3 rounded-xl bg-white p-5 shadow"
          >
            <h2 className="font-semibold">
              3. Your details and payment
            </h2>

            <input
              className={input}
              placeholder="Name"
              autoComplete="name"
              required
              value={customer.customerName}
              disabled={isProcessing}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  customerName: e.target.value,
                })
              }
            />

            <input
              className={input}
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              value={customer.customerEmail}
              disabled={isProcessing}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  customerEmail: e.target.value,
                })
              }
            />

            <input
              className={input}
              type="tel"
              placeholder="Phone"
              autoComplete="tel"
              value={customer.customerPhone}
              disabled={isProcessing}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  customerPhone: e.target.value,
                })
              }
            />

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing
                ? 'Processing payment...'
                : `Pay ₹${service.price} and book`}
            </button>

            <p className="text-center text-xs text-gray-500">
              Your booking is confirmed only after payment verification.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}*/


import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })
}

export default function PublicBooking() {
  const { slug } = useParams()

  const [data, setData] = useState(null)
  const [service, setService] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState('')

  const [customer, setCustomer] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  })

  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    api
      .get(`/public/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => setMsg('Business not found'))
  }, [slug])

  useEffect(() => {
    if (!service || !date) {
      setSlots([])
      return
    }

    setTime('')
    setSlots([])

    api
      .get(`/public/${slug}/slots`, {
        params: { serviceId: service._id, date },
      })
      .then((r) => setSlots(r.data))
      .catch(() => setMsg('Could not load available time slots.'))
  }, [service, date, slug])

  const book = async (e) => {
    e.preventDefault()

    if (!service || !date || !time) {
      setMsg('Please select a service, date and time.')
      return
    }

    setMsg('')
    setIsProcessing(true)

    try {
      // 1. Load Razorpay Checkout
      const loaded = await loadRazorpayScript()

      if (!loaded) {
        setMsg('Could not load Razorpay. Please check your internet connection.')
        setIsProcessing(false)
        return
      }

      // 2. Ask the backend to create a Razorpay order
      const orderResponse = await api.post('/bookings/create-order', {
        slug,
        serviceId: service._id,
        date,
        startTime: time,
        ...customer,
      })

      const order = orderResponse.data

      // 3. Open Razorpay Checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: order.businessName || data.business.name,
        description: order.serviceName || service.name,
        order_id: order.orderId,

        prefill: {
          name: customer.customerName,
          email: customer.customerEmail,
          contact: customer.customerPhone,
        },

        theme: {
          color: '#4f46e5',
        },

        // 4. Verify payment on the backend
        handler: async (response) => {
          try {
            const verificationResponse = await api.post(
              '/bookings/verify-payment',
              {
                bookingId: order.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            )

            if (verificationResponse.data.success) {
              setDone(true)
              setMsg('')
            } else {
              setMsg(
                verificationResponse.data.message ||
                  'Payment verification is incomplete. Please check your booking status.'
              )
            }
          } catch (err) {
            setMsg(
              err.response?.data?.message ||
                'We could not confirm the payment status. Please check your booking status before trying to pay again.'
            )
          } finally {
            setIsProcessing(false)
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            setMsg(
              'Checkout was closed. Your payment may still be processing; check its status before trying again.'
            )
          },
        },
      }

      const checkout = new window.Razorpay(options)

      checkout.on('payment.failed', (response) => {
        setIsProcessing(false)
        setMsg(
          response.error?.description ||
            'Payment failed. Check the payment status before trying again.'
        )
      })

      checkout.open()
    } catch (err) {
      setIsProcessing(false)
      setMsg(
        err.response?.data?.message ||
          'Could not start the booking or payment process.'
      )
    }
  }

  // Loading state
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7fc] p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="text-sm text-gray-500">
            {msg || 'Loading booking page...'}
          </p>
        </div>
      </div>
    )
  }

  // Booking success state
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7fc] p-4">
        <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-indigo-950/[0.04] sm:p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-9 w-9"
            >
              <path
                d="M5 12.5 10 17l9-10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mt-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Payment successful
          </p>

          <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Booking confirmed!
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-gray-500">
            Your payment has been verified successfully. Your appointment details are below.
          </p>

          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Appointment summary
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Business</span>
                <span className="text-right font-medium text-gray-900">
                  {data.business.name}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Service</span>
                <span className="text-right font-medium text-gray-900">
                  {service.name}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Date</span>
                <span className="text-right font-medium text-gray-900">
                  {date}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Time</span>
                <span className="text-right font-medium text-gray-900">
                  {time}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Amount paid</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{service.price}
                  </span>
                </div>

                <p className="mt-2 text-right text-xs font-medium text-emerald-600">
                  ✓ Payment verified
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Thank you for booking with {data.business.name}.
          </p>
        </div>
      </div>
    )
  }

  const input =
    'w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10'

  // Use local date instead of UTC
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return (
    <div className="min-h-screen bg-[#f8f7fc] px-4 py-8 sm:px-6 sm:py-12">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7"
            >
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M16 3v4M8 3v4M3 10h18" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Online appointments
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {data.business.name}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
            Choose your preferred service, select a convenient time,
            and book your appointment in just a few steps.
          </p>
        </header>

        {/* Booking steps */}
        <div className="mx-auto max-w-3xl">

          {/* Step indicators */}
          <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { number: '01', label: 'Service', active: true },
              { number: '02', label: 'Date & time', active: Boolean(service) },
              { number: '03', label: 'Your details', active: Boolean(time) },
            ].map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-2 rounded-xl border p-3 sm:gap-3 sm:p-4 ${
                  step.active
                    ? 'border-indigo-100 bg-white shadow-sm'
                    : 'border-transparent bg-gray-100/70'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    step.active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-400'
                  }`}
                >
                  {step.number}
                </div>

                <span
                  className={`text-xs font-semibold sm:text-sm ${
                    step.active ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Messages */}
          {msg && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
            >
              <span className="font-bold">!</span>
              <p>{msg}</p>
            </div>
          )}

          {/* Step 1: Choose service */}
          <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-indigo-950/[0.03] sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                >
                  <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Choose a service
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select the service you want to book.
                </p>
              </div>
            </div>

            {data.services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="font-medium text-gray-700">
                  No services available yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.services.map((s) => (
                  <button
                    type="button"
                    key={s._id}
                    disabled={isProcessing}
                    onClick={() => {
                      setService(s)
                      setDate('')
                      setTime('')
                      setMsg('')
                    }}
                    className={`group rounded-2xl border p-4 text-left transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      service?._id === s._id
                        ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/10'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-indigo-600 transition group-hover:bg-indigo-100">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5"
                        >
                          <rect x="3" y="5" width="18" height="16" rx="3" />
                          <path d="M16 3v4M8 3v4M3 10h18" />
                        </svg>
                      </div>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                          service?._id === s._id
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-gray-300 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                      {s.name}
                    </h3>

                    {s.description && (
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                        {s.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-xs text-gray-500">
                        {s.duration} minutes
                      </span>

                      <span className="text-lg font-bold text-indigo-700">
                        ₹{s.price}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Step 2: Choose date and time */}
          {service && (
            <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-indigo-950/[0.03] sm:p-7">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="3" />
                    <path d="M16 3v4M8 3v4M3 10h18" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Pick date and time
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose an available appointment slot.
                  </p>
                </div>
              </div>

              <label
                htmlFor="booking-date"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Appointment date
              </label>

              <input
                id="booking-date"
                type="date"
                min={today}
                className={input}
                value={date}
                disabled={isProcessing}
                onChange={(e) => {
                  setDate(e.target.value)
                  setMsg('')
                }}
              />

              {date && (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Available times
                  </p>

                  {slots.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                      No slots available, or slots are still loading.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((t) => (
                        <button
                          type="button"
                          key={t}
                          disabled={isProcessing}
                          onClick={() => {
                            setTime(t)
                            setMsg('')
                          }}
                          className={`rounded-xl border px-2 py-3 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                            time === t
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Step 3: Customer details and payment */}
          {time && (
            <form
              onSubmit={book}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-indigo-950/[0.03] sm:p-7"
            >
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Your details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your contact details to complete the booking.
                  </p>
                </div>
              </div>

              {/* Booking summary */}
              <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  Your appointment
                </p>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {service.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {date} · {time}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {service.duration} minutes
                    </p>
                  </div>

                  <p className="shrink-0 text-xl font-bold text-indigo-700">
                    ₹{service.price}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full name
                  </label>

                  <input
                    id="customer-name"
                    className={input}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    value={customer.customerName}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        customerName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email address
                  </label>

                  <input
                    id="customer-email"
                    className={input}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={customer.customerEmail}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        customerEmail: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone number
                    <span className="ml-1 font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="customer-phone"
                    className={input}
                    type="tel"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    value={customer.customerPhone}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        customerPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isProcessing
                  ? 'Processing payment...'
                  : `Pay ₹${service.price} and book`}

                {!isProcessing && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-5 text-gray-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-4 w-4 shrink-0"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                Secure checkout powered by Razorpay
              </p>

              <p className="mt-2 text-center text-xs text-gray-400">
                Your booking is confirmed after payment verification.
              </p>
            </form>
          )}

          {/* Footer */}
          <footer className="py-8 text-center">
            <p className="text-xs text-gray-400">
              Booking with {data.business.name}
            </p>
          </footer>

        </div>
      </div>
    </div>
  )
}

