import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

type Category = { id: number; name: string }

export default function NewListing() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [location, setLocation] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const nav = useNavigate()

  useEffect(() => {
    // require login
    api.get('/auth/me').catch(() => nav('/login'))
    api.get('/listings/categories').then(r => setCategories(r.data))
      .catch(() => setCategories([]))
  }, [])

  async function onUpload(): Promise<string[]> {
    const fd = new FormData()
    images.forEach(f => fd.append('images', f))
    const r = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return r.data.urls as string[]
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    try {
      // basic client-side validation to avoid roundtrip
      if (description.trim().length < 10) {
        setError('Description must be at least 10 characters')
        return
      }
      const urls = images.length ? await onUpload() : []
      const payload = { title, description, price: Number(price), location, categoryId: Number(categoryId), images: urls }
      const r = await api.post('/listings', payload)
      nav(`/listing/${r.data.id}`)
    } catch (e: any) {
      const data = e?.response?.data
      if (data?.error === 'ValidationError' && data?.details?.fieldErrors) {
        setError('Please fix the errors below')
        setFieldErrors(data.details.fieldErrors as Record<string, string[]>)
      } else {
        setError(data?.error || 'Failed to create listing')
      }
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
      <h2>Post a new ad</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      {fieldErrors.title && <small style={{ color: 'crimson' }}>{fieldErrors.title.join(', ')}</small>}
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      {fieldErrors.description && <small style={{ color: 'crimson' }}>{fieldErrors.description.join(', ')}</small>}
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} />
      {fieldErrors.price && <small style={{ color: 'crimson' }}>{fieldErrors.price.join(', ')}</small>}
      <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
      {fieldErrors.location && <small style={{ color: 'crimson' }}>{fieldErrors.location.join(', ')}</small>}
      <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
        <option value="">Select category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {fieldErrors.categoryId && <small style={{ color: 'crimson' }}>{fieldErrors.categoryId.join(', ')}</small>}
      <input type="file" accept="image/*" multiple onChange={e => {
        const files = Array.from(e.target.files || [])
        setImages(files)
        setPreviews(files.map(f => URL.createObjectURL(f)))
      }} />
      {!!previews.length && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {previews.map((src, i) => (
            <img key={i} src={src} style={{ width: 100, height: 100, objectFit: 'cover', border: '1px solid #eee' }} />
          ))}
        </div>
      )}
      <button>Create</button>
    </form>
  )
}


