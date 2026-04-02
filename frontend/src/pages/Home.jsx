import { useNavigate } from 'react-router-dom'
import '../App.css'
import './Home.css'

function Home({ user, onLogout }) {
  const navigate = useNavigate()
  const displayName = user?.name ?? 'VibeCheck user'
  const email = user?.email ?? ''

  return (
    <div className="home-page dashboard-page">
      <header className="top-nav" aria-label="Primary navigation">
        <p className="brand">VibeCheck</p>
        <nav className="nav-links">
          <button type="button" onClick={() => navigate('/my-events')}>My Events</button>
          <button type="button" className="primary-action" onClick={() => navigate('/browse-events')}>Browse Events</button>
          <button type="button" className="secondary-action" onClick={onLogout}>Sign out</button>
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
