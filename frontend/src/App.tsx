import { Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from './lib/api'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NewListing from './pages/NewListing'
import ListingDetail from './pages/ListingDetail'
import Messages from './pages/Messages'
import MyAds from './pages/MyAds'
import Favorites from './pages/Favorites'
import EditListing from './pages/EditListing'

function Layout() {
  const [me, setMe] = useState<any>(null)
  const nav = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then(r => setMe(r.data)).catch(() => setMe(null))
  }, [])

  async function logout() {
    await api.post('/auth/logout')
    setMe(null)
    nav('/')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/">OLX Clone</Link>
          <Link to="/messages">Messages</Link>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {me ? (
            <>
              <span>Hello, {me.name}</span>
              <Link to="/favorites">Favorites</Link>
              <Link to="/my">My Ads</Link>
              <Link to="/new">Post Ad</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}> 
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/new" element={<NewListing />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my" element={<MyAds />} />
        <Route path="/edit/:id" element={<EditListing />} />
      </Route>
    </Routes>
  )
}


