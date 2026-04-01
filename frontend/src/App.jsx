import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

const VIBE_OPTIONS = [
  { label: 'Happy',     emoji: '😊' },
  { label: 'Excited',   emoji: '🎉' },
  { label: 'Chill',     emoji: '😎' },
  { label: 'Anxious',   emoji: '😬' },
  { label: 'Grateful',  emoji: '🙏' },
  { label: 'Tired',     emoji: '😴' },
  { label: 'Focused',   emoji: '🎯' },
  { label: 'Creative',  emoji: '🎨' },
]

function VibeCard({ vibe }) {
  return (
    <div className="vibe-card">
      <span className="vibe-emoji">{vibe.emoji}</span>
      <div className="vibe-info">
        <strong>{vibe.label}</strong>
        <span className="vibe-meta">by {vibe.username ?? 'anonymous'}</span>
      </div>
    </div>
  )
}

function App() {
  const [vibes, setVibes]       = useState([])
  const [selected, setSelected] = useState(null)
  const [status, setStatus]     = useState('idle') // idle | loading | success | error

  useEffect(() => {
    fetch(`${API_BASE}/vibes`)
      .then(r => r.json())
      .then(data => setVibes(Array.isArray(data) ? data : []))
      .catch(() => setVibes([]))
  }, [])

  async function submitVibe() {
    if (!selected) return
    setStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/vibes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selected, user_id: 1 }),
      })
      const data = await res.json()
      if (res.ok) {
        setVibes(prev => [data, ...prev])
        setStatus('success')
        setSelected(null)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>✨ VibeCheck</h1>
        <p className="app-subtitle">How are you feeling right now?</p>
      </header>

      <main className="app-main">
        <section className="vibe-picker">
          <div className="vibe-grid">
            {VIBE_OPTIONS.map(v => (
              <button
                key={v.label}
                className={`vibe-btn${selected?.label === v.label ? ' selected' : ''}`}
                onClick={() => setSelected(v)}
              >
                <span>{v.emoji}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
          <button
            className="submit-btn"
            disabled={!selected || status === 'loading'}
            onClick={submitVibe}
          >
            {status === 'loading' ? 'Checking…' : 'Check My Vibe'}
          </button>
          {status === 'success' && <p className="feedback success">Vibe posted! 🎉</p>}
          {status === 'error'   && <p className="feedback error">Something went wrong. Try again.</p>}
        </section>

        <section className="vibe-feed">
          <h2>Recent Vibes</h2>
          {vibes.length === 0
            ? <p className="empty">No vibes yet — be the first! 👆</p>
            : vibes.map((v, i) => <VibeCard key={v.id ?? i} vibe={v} />)
          }
        </section>
      </main>
    </div>
  )
}

export default App
