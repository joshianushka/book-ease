import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('business', JSON.stringify(data.business))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Create your business</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input className={input} name="name" placeholder="Business name" onChange={change} />
        <input className={input} name="slug" placeholder="URL name (e.g. glow-salon)" onChange={change} />
        <input className={input} name="email" type="email" placeholder="Email" onChange={change} value={form.email}/>
        <input className={input} name="password" type="password" placeholder="Password (6-20 characters)" onChange={change} minLength={6} maxLength={20} value={form.password}/>
        <button className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700">
          Sign up
        </button>
        <p className="text-center text-sm text-gray-500">
          Have an account? <Link className="text-indigo-600" to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}

