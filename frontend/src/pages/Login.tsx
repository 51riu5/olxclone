import { useState } from 'react'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/login', { email, password })
      // force refresh of me state by reloading root
      nav(0)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button>Login</button>
    </form>
  )
}


