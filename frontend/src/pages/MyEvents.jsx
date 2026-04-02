import { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../App.css'
import './MyEvents.css'

function MyEvents() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth0()
  const [activeTab, setActiveTab] = useState('created')
  const [successMessage, setSuccessMessage] = useState('')
  const [createdEvents, setCreatedEvents] = useState([])
  const [createdEventsLoading, setCreatedEventsLoading] = useState(false)
  const [createdEventsError, setCreatedEventsError] = useState('')

  useEffect(() => {
    const routedMessage = location.state?.successMessage
    if (!routedMessage) {
      return
    }

    setSuccessMessage(routedMessage)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    async function loadCreatedEvents() {
      if (activeTab !== 'created') {
        return
      }

      const userEmail = String(user?.email ?? '').toLowerCase().trim()
      if (!userEmail) {
        setCreatedEvents([])
        setCreatedEventsError('Missing email identity.')
        return
      }

      setCreatedEventsLoading(true)
      setCreatedEventsError('')

      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        const events = Array.isArray(data)
          ? data.filter((event) => String(event.creator_email ?? '').toLowerCase().trim() === userEmail)
          : []
        setCreatedEvents(events)
      } catch {
        setCreatedEvents([])
        setCreatedEventsError('Unable to load your created events.')
      } finally {
        setCreatedEventsLoading(false)
      }
    }

    loadCreatedEvents()
  }, [activeTab, user?.email])

  async function handleDelete(eventId) {
    const shouldDelete = window.confirm('Delete this event?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to delete event.')
      }

      setCreatedEvents((previousEvents) =>
        previousEvents.filter((event) => event.event_id !== eventId),
      )
      setCreatedEventsError('')
      setSuccessMessage('Event deleted successfully!')
    } catch {
      setCreatedEventsError('Unable to delete the event right now.')
    }
  }

  const createdEventsView = useMemo(() => {
    if (createdEventsLoading) {
      return <p className="events-empty">Loading your created events...</p>
    }

    if (createdEventsError) {
      return <p className="events-empty">{createdEventsError}</p>
    }

    if (createdEvents.length === 0) {
      return <p className="events-empty">You have not created any events yet.</p>
    }

    return (
      <div className="events-list">
        {createdEvents.map((event) => (
          <article key={event.event_id} className="event-card">
            <div className="event-card-header">
              <div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
              <div className="event-card-actions">
                <button
                  type="button"
                  className="event-card-action"
                  onClick={() => navigate(`/events/edit/${event.event_id}`, { state: { event } })}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="event-card-action danger"
                  onClick={() => handleDelete(event.event_id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <dl>
              <div>
                <dt>When</dt>
                <dd>{new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{event.location}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{event.registration_type}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{event.event_type}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    )
  }, [createdEvents, createdEventsError, createdEventsLoading])

  function handleBack() {
    navigate('/home')
  }

  return (
    <div className="home-page my-events-page">
      <header className="events-nav" aria-label="My events navigation">
        <div className="events-nav-left">
          <button type="button" className="back-button" onClick={handleBack} aria-label="Back to Home">
            ←
          </button>

          <button
            type="button"
            className={activeTab === 'created' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('created')}
          >
            Events Created
          </button>
          <button
            type="button"
            className={activeTab === 'registered' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('registered')}
          >
            Events Registered
          </button>
        </div>

        <button
          type="button"
          className="create-event-button"
          onClick={() => navigate('/events/new')}
        >
          Create Event
        </button>
      </header>

      {successMessage && (
        <p className="events-success-message" role="status">
          {successMessage}
        </p>
      )}

      <section className="events-content" aria-label="My events content">
        {activeTab === 'created' ? (
          <div className="events-panel">
            <h2>Events Created</h2>
            {createdEventsView}
          </div>
        ) : (
          <div className="events-panel">
            <h2>Events Registered</h2>
            <p>You are not registered for any events yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default MyEvents
