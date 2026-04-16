import { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ProfileMenu from '../components/ProfileMenu.jsx'
import './ViewRegistrations.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

function ViewRegistrations() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth0()
  const { eventId } = useParams()
  const [event, setEvent] = useState(location.state?.event ?? null)
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyRegistrationId, setBusyRegistrationId] = useState(null)

  useEffect(() => {
    async function loadViewRegistrations() {
      const numericEventId = Number(eventId)
      if (Number.isNaN(numericEventId) || numericEventId <= 0) {
        setError('Invalid event identifier.')
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const [eventResponse, registrationsResponse] = await Promise.all([
          event ? Promise.resolve(null) : fetch(`${API_BASE}/events/${numericEventId}`),
          fetch(`${API_BASE}/registrations`),
        ])

        let resolvedEvent = event

        if (!resolvedEvent && eventResponse) {
          const eventData = await eventResponse.json()
          if (!eventResponse.ok) {
            throw new Error(eventData?.error ?? 'Unable to load this event.')
          }

          resolvedEvent = eventData
          setEvent(eventData)
        }

        const registrationsData = await registrationsResponse.json()
        if (!registrationsResponse.ok) {
          throw new Error(registrationsData?.error ?? 'Unable to load registrations.')
        }

        const allRegistrations = Array.isArray(registrationsData) ? registrationsData : []
        setRegistrations(
          allRegistrations
            .filter((registration) => Number(registration.event_id) === Number(numericEventId))
            .sort((first, second) => String(first.registration_time ?? '').localeCompare(String(second.registration_time ?? ''))),
        )

        if (!resolvedEvent) {
          setError('Unable to load event details.')
        }
      } catch (loadError) {
        setRegistrations([])
        setError(loadError instanceof Error ? loadError.message : 'Unable to load registrations.')
      } finally {
        setIsLoading(false)
      }
    }

    loadViewRegistrations()
  }, [eventId])

  function registrationStatusClass(status) {
    const normalizedStatus = String(status ?? '').toLowerCase().trim()

    if (normalizedStatus === 'registered' || normalizedStatus === 'confirmed' || normalizedStatus === 'approved') {
      return 'status-registered'
    }

    if (normalizedStatus === 'pending' || normalizedStatus === 'waitlisted') {
      return 'status-pending'
    }

    if (normalizedStatus === 'denied' || normalizedStatus === 'cancelled' || normalizedStatus === 'rejected') {
      return 'status-denied'
    }

    if (normalizedStatus === 'failed') {
      return 'status-failed'
    }

    return 'status-unknown'
  }

  function registrationStatusLabel(status) {
    const normalizedStatus = String(status ?? '').toLowerCase().trim()

    if (normalizedStatus === 'confirmed' || normalizedStatus === 'approved') {
      return 'Registered'
    }

    if (normalizedStatus === 'rejected') {
      return 'Denied'
    }

    if (normalizedStatus === 'cancelled') {
      return 'Cancelled'
    }

    if (normalizedStatus === 'pending') {
      return 'Pending'
    }

    if (normalizedStatus === 'failed') {
      return 'Failed'
    }

    if (!normalizedStatus) {
      return 'Unknown'
    }

    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
  }

  function isRsvpEvent() {
    return String(event?.registration_type ?? '').toLowerCase().trim() === 'rsvp'
  }

  async function updateRegistrationStatus(registrationId, nextStatus) {
    setActionMessage('')
    setActionError('')
    setBusyRegistrationId(registrationId)

    try {
      const response = await fetch(`${API_BASE}/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to update registration.')
      }

      setRegistrations((previousRegistrations) =>
        previousRegistrations.map((registration) =>
          registration.reg_id === registrationId
            ? { ...registration, status: data?.status ?? nextStatus }
            : registration,
        ),
      )
      setActionMessage(
        nextStatus === 'registered'
          ? 'Registration approved successfully!'
          : 'Registration denied successfully!',
      )
    } catch (updateError) {
      setRegistrations((previousRegistrations) =>
        previousRegistrations.map((registration) =>
          registration.reg_id === registrationId
            ? { ...registration, status: 'failed' }
            : registration,
        ),
      )
      setActionError(
        updateError instanceof Error ? updateError.message : 'Unable to update registration.',
      )
    } finally {
      setBusyRegistrationId(null)
    }
  }

  const registrationCountLabel = useMemo(() => {
    return `${registrations.length} registrant${registrations.length === 1 ? '' : 's'}`
  }, [registrations.length])

  return (
    <div className="view-registrations-page">
      <header className="view-registrations-nav" aria-label="View registrations navigation">
        <div className="view-registrations-nav-left">
          <button type="button" className="back-button" onClick={() => navigate('/my-events')} aria-label="Back to My Events">
            ←
          </button>
          <div>
            <p className="view-registrations-kicker">View Registrations</p>
          </div>
        </div>

        <div className="view-registrations-nav-right">
          <ProfileMenu
            user={user}
            onEditName={() => navigate('/edit-name')}
            onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          />
        </div>
      </header>

      <section className="view-registrations-summary">
        <h2 className="view-registrations-event-title">{event?.title ?? 'Event Registrations'}</h2>
        <p>{registrationCountLabel}</p>
      </section>

      <section className="view-registrations-content" aria-label="Registrants list">
        {actionMessage && (
          <p className="events-success-message" role="status">
            {actionMessage}
          </p>
        )}
        {actionError && (
          <p className="events-error-message" role="alert">
            {actionError}
          </p>
        )}

        {isLoading && <p className="events-empty">Loading registrations...</p>}
        {!isLoading && error && <p className="events-error-message">{error}</p>}
        {!isLoading && !error && registrations.length === 0 && (
          <p className="events-empty">No one has registered for this event yet.</p>
        )}

        {!isLoading && !error && registrations.length > 0 && (
          <div className="registrations-list">
            {registrations.map((registration) => (
              <article key={registration.reg_id} className="registration-card">
                <div className="registration-card-header">
                  <div>
                    <h3>{registration.user_name ?? 'Unknown Registrant'}</h3>
                  </div>

                  <div className="registration-status-wrap">
                    <span
                      className={`registration-status-icon ${registrationStatusClass(registration.status)}`}
                      aria-hidden="true"
                    />
                    <span className="registration-status-label">{registrationStatusLabel(registration.status)}</span>
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>Registered At</dt>
                    <dd>{registration.registration_time ? new Date(registration.registration_time).toLocaleString() : 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{registrationStatusLabel(registration.status)}</dd>
                  </div>
                  {String(registration.status ?? '').toLowerCase().trim() === 'waitlisted' && Number(registration.waitlist_position) > 0 && (
                    <div>
                      <dt>Waitlist Position</dt>
                      <dd>{Number(registration.waitlist_position)}</dd>
                    </div>
                  )}
                </dl>

                {isRsvpEvent() && String(registration.status ?? '').toLowerCase().trim() === 'pending' && (
                  <div className="registration-card-actions">
                    <button
                      type="button"
                      className="registration-card-action approve"
                      onClick={() => updateRegistrationStatus(registration.reg_id, 'registered')}
                      disabled={busyRegistrationId === registration.reg_id}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="registration-card-action reject"
                      onClick={() => updateRegistrationStatus(registration.reg_id, 'denied')}
                      disabled={busyRegistrationId === registration.reg_id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ViewRegistrations