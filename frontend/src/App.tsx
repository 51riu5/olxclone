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
    <div className="container">
      <header className="header">
        <div className="nav">
          <Link to="/" style={{ fontWeight: 800 }}>OLX Clone</Link>
          <span className="badge">beta</span>
          <Link to="/messages">Messages</Link>
        </div>
        <div className="nav">
          {me ? (
            <>
              <span style={{ color: 'var(--muted)' }}>Hi, {me.name}</span>
              <Link to="/favorites">Favorites</Link>
              <Link to="/my">My Ads</Link>
              <Link to="/new"><button>Post Ad</button></Link>
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


