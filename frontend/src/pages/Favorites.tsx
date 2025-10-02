import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Favorites() {
  const [items, setItems] = useState<any[]>([])
  const nav = useNavigate()

  useEffect(() => {
    api.get('/auth/me').catch(() => nav('/login'))
    api.get('/listings/favorites').then(r => setItems(r.data))
  }, [])

  return (
    <div>
      <h2>Favorites</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {items.map(it => (
          <Link key={it.id} to={`/listing/${it.id}`} style={{ display: 'block', border: '1px solid #ddd', padding: 8, textDecoration: 'none', color: 'inherit' }}>
            <img src={it.images[0]?.url} style={{ width: '100%', height: 140, objectFit: 'cover', background: '#f3f3f3' }} />
            <div style={{ marginTop: 8, fontWeight: 600 }}>{it.title}</div>
            <div>₹ {it.price}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}


