import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import ProfileMenu from '../components/ProfileMenu.jsx'
import './Home.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

function Home({ user, onLogout }) {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(user?.name ?? 'VibeCheck user')
  const email = user?.email ?? ''

  useEffect(() => {
    let isActive = true

    async function loadDisplayName() {
      const userEmail = String(email ?? '').toLowerCase().trim()
      if (!userEmail) {
        return
      }

      try {
        const response = await fetch(`${API_BASE}/users`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? 'Unable to load your name.')
        }

        const users = Array.isArray(data) ? data : []
        const currentUser = users.find(
          (candidate) => String(candidate.email ?? '').toLowerCase().trim() === userEmail,
        )

        if (isActive) {
          setDisplayName(currentUser?.name ?? user?.name ?? 'VibeCheck user')
        }
      } catch {
        if (isActive) {
          setDisplayName(user?.name ?? 'VibeCheck user')
        }
      }
    }

    loadDisplayName()

    return () => {
      isActive = false
    }
  }, [email, user?.name])

  return (
    <div className="home-page dashboard-page">
      <header className="top-nav" aria-label="Primary navigation">
        <p className="brand">VibeCheck</p>
        <nav className="nav-links">
          <button type="button" onClick={() => navigate('/my-events')}>My Events</button>
          <button type="button" className="primary-action" onClick={() => navigate('/browse-events')}>Browse Events</button>
          <ProfileMenu
            user={user}
            onEditName={() => navigate('/edit-name')}
            onLogout={onLogout}
          />
        </nav>
      </header>

      <section className="hero-panel dashboard-hero">
        <h1>Welcome back, {displayName}.</h1>
        <p className="hero-copy">
          Manage and browse local events to connect with your campus community.
        </p>

        <div className="status-card" role="status">
          <span>Signed in as</span>
          <strong>{email}</strong>
        </div>
      </section>
    </div>
  )
}

export default Home
