import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditListing() {
  const { id } = useParams()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [location, setLocation] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/me').catch(() => nav('/login'))
    api.get('/listings/categories').then(r => setCategories(r.data))
    if (id) {
      api.get(`/listings/${id}`).then(r => {
        const d = r.data
        setTitle(d.title); setDescription(d.description); setPrice(d.price); setLocation(d.location); setCategoryId(d.categoryId); setImages(d.images?.map((i: any) => i.url) || [])
      })
    }
  }, [id])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const payload: any = { title, description, price, location, categoryId }
      // Keep existing images as-is for simplicity
      payload.images = images
      await api.put(`/listings/${id}`, payload)
      nav(`/listing/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Update failed')
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
      <h2>Edit ad</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} />
      <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
      <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
        <option value="">Select category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {images.map((src, i) => (
          <img key={i} src={src} style={{ width: 100, height: 100, objectFit: 'cover', border: '1px solid #eee' }} />
        ))}
      </div>
      <button>Save</button>
    </form>
  )
}


