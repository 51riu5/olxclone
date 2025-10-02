import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'

export default function MyAds() {
  const [items, setItems] = useState<any[]>([])
  const nav = useNavigate()

  useEffect(() => {
    api.get('/auth/me').catch(() => nav('/login'))
    api.get('/listings/mine').then(r => setItems(r.data))
  }, [])

  return (
    <div>
      <h2>My Ads</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {items.map(it => (
          <div key={it.id} style={{ border: '1px solid #ddd', padding: 8 }}>
            <img src={it.images[0]?.url} style={{ width: '100%', height: 140, objectFit: 'cover', background: '#f3f3f3' }} />
            <div style={{ marginTop: 8, fontWeight: 600 }}>{it.title}</div>
            <div>₹ {it.price}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to={`/listing/${it.id}`}>View</Link>
              <Link to={`/edit/${it.id}`}>Edit</Link>
              <button onClick={async () => { if (confirm('Delete this ad?')) { await api.delete(`/listings/${it.id}`); setItems(items.filter(x => x.id !== it.id)) } }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


