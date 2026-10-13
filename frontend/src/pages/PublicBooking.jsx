
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

        {/* Step 1: Choose service */}
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

        {/* Step 2: Choose date and time */}
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

        {/* Step 3: Customer details and payment */}
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
}
