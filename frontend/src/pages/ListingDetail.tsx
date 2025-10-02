import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function ListingDetail() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const nav = useNavigate()
  const [favorited, setFavorited] = useState<boolean>(false)

  useEffect(() => {
    if (!id) return
    api.get(`/listings/${id}`).then(r => setData(r.data))
    api.get(`/listings/${id}/favorite`).then(r => setFavorited(!!r.data?.favorited)).catch(() => setFavorited(false))
  }, [id])

  if (!data) return <div>Loading...</div>

  return (
    <div>
      <h2>{data.title}</h2>
      <div className="carousel">
        <Carousel images={data.images?.map((i: any) => i.url) || []} />
      </div>
      <div style={{ marginTop: 8 }}>Price: ₹ {data.price}</div>
      <div>Location: {data.location}</div>
      <p>{data.description}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={async () => {
          try {
            const r = await api.post('/messages/start', { listingId: data.id, sellerId: data.seller.id })
            nav(`/messages?active=${r.data.id}`)
          } catch (e) {
            alert('Unable to start conversation')
          }
        }}>Contact seller</button>
        <button onClick={async () => {
          try {
            if (favorited) {
              await api.delete(`/listings/${data.id}/favorite`)
              setFavorited(false)
            } else {
              await api.post(`/listings/${data.id}/favorite`)
              setFavorited(true)
            }
          } catch {}
        }}>{favorited ? 'Unfavorite' : 'Favorite'}</button>
      </div>
    </div>
  )
}

function Carousel({ images }: { images: string[] }) {
  const [i, setI] = useState(0)
  if (!images.length) return null
  function prev() { setI((i - 1 + images.length) % images.length) }
  function next() { setI((i + 1) % images.length) }
  return (
    <div style={{ position: 'relative', width: '100%', height: 300, marginBottom: 8 }}>
      <img src={images[i]} style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#f3f3f3' }} />
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', top: '50%', left: 8 }}>‹</button>
          <button onClick={next} style={{ position: 'absolute', top: '50%', right: 8 }}>›</button>
        </>
      )}
    </div>
  )
}


