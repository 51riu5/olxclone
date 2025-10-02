import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type Listing = {
  id: number
  title: string
  price: number
  images: { url: string }[]
}

export default function Home() {
  const [items, setItems] = useState<Listing[]>([])
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [sort, setSort] = useState<string>('newest')

  useEffect(() => {
    api.get('/listings').then(r => setItems(r.data))
    api.get('/listings/categories').then(r => setCategories(r.data))
  }, [])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    const r = await api.get('/listings', { params: { q, categoryId, minPrice, maxPrice, sort } })
    setItems(r.data)
  }

  return (
    <div>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." />
        <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="Min price" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 120 }} />
        <input type="number" placeholder="Max price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 120 }} />
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button>Search</button>
      </form>
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


