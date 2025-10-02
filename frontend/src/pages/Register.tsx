import { useState } from 'react'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register', { email, name, password })
      await api.post('/auth/login', { email, password })
      nav(0)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h2>Register</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button>Create account</button>
    </form>
  )
}


