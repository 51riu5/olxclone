import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Messages() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const [convos, setConvos] = useState<any[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [body, setBody] = useState('')

  useEffect(() => {
    api.get('/auth/me').catch(() => nav('/login'))
    api.get('/messages/conversations').then(r => {
      setConvos(r.data)
      const target = Number(params.get('active'))
      if (target) setActive(target)
    })
  }, [])

  useEffect(() => {
    if (!active) return
    api.get(`/messages/${active}/messages`).then(r => setMessages(r.data))
  }, [active])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!active) return
    if (!body.trim()) return
    const r = await api.post('/messages/send', { conversationId: active, body })
    setMessages(m => [...m, r.data])
    setBody('')
  }

  return (
    <div className="msg-layout">
      <div className="msg-list">
        {convos.map(c => (
          <div key={c.id} onClick={() => { setActive(c.id); params.set('active', String(c.id)); setParams(params, { replace: true }) }} style={{ padding: 8, cursor: 'pointer', background: active === c.id ? 'rgba(32,201,151,.12)' : undefined }}>
            <div style={{ fontWeight: 600 }}>{c.listing.title}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{c.messages[0]?.body}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="msg-thread" style={{ display: 'flex', flexDirection: 'column' }}>
          {messages.map(m => (
            <div key={m.id} className={`bubble ${m.senderId ? (m.senderId === (window as any).meId ? 'me' : 'them') : 'them'}`}>{m.body}</div>
          ))}
        </div>
        <form onSubmit={send} className="actions" style={{ marginTop: 8 }}>
          <input value={body} onChange={e => setBody(e.target.value)} placeholder="Type a message" style={{ flex: 1 }} />
          <button>Send</button>
        </form>
      </div>
    </div>
  )
}


