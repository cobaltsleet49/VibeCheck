import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './EventForm.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

const initialFormState = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  capacity: '',
  registration_type: '',
  event_type: '',
}

function EventForm() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth0()
  const [form, setForm] = useState(initialFormState)
  const [originalForm, setOriginalForm] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEvent, setIsLoadingEvent] = useState(Boolean(eventId))
  const [message, setMessage] = useState({ type: '', text: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const isEditing = Boolean(eventId)

  function toDateTimeLocal(value) {
    if (!value) {
      return ''
    }

    const normalized = String(value).replace(' ', 'T')
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) {
      return ''
    }

    const pad = (number) => String(number).padStart(2, '0')
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  function mapEventToForm(event) {
    return {
      title: String(event?.title ?? ''),
      description: String(event?.description ?? ''),
      start_time: toDateTimeLocal(event?.start_time),
      end_time: toDateTimeLocal(event?.end_time),
      location: String(event?.location ?? ''),
      capacity: String(event?.capacity ?? ''),
      registration_type: String(event?.registration_type ?? ''),
      event_type: String(event?.event_type ?? ''),
    }
  }

  useEffect(() => {
    const routedEvent = location.state?.event

    if (routedEvent) {
      const nextForm = mapEventToForm(routedEvent)
      setForm(nextForm)
      setOriginalForm(nextForm)
      setIsLoadingEvent(false)
      return
    }

    if (!isEditing) {
      setIsLoadingEvent(false)
      return
    }

    let isActive = true

    async function loadEvent() {
      setIsLoadingEvent(true)
      try {
        const response = await fetch(`${API_BASE}/events/${eventId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? 'Unable to load event.')
        }

        if (!isActive) {
          return
        }

        const nextForm = mapEventToForm(data)
        setForm(nextForm)
        setOriginalForm(nextForm)
      } catch {
        if (isActive) {
          setMessage({ type: 'error', text: 'Unable to load event for editing.' })
        }
      } finally {
        if (isActive) {
          setIsLoadingEvent(false)
        }
      }
    }

    loadEvent()

    return () => {
      isActive = false
    }
  }, [eventId, isEditing, location.state])

  function onChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev
      }

      const nextErrors = { ...prev }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function onReset() {
    setForm(isEditing ? originalForm : initialFormState)
    setMessage({ type: '', text: '' })
    setFieldErrors({})
  }

  async function onSubmit(event) {
    event.preventDefault()
    setMessage({ type: '', text: '' })

    const nextFieldErrors = {}
    if (!form.title.trim()) nextFieldErrors.title = 'Title is required.'
    if (!form.description.trim()) nextFieldErrors.description = 'Description is required.'
    if (!form.start_time.trim()) nextFieldErrors.start_time = 'Start time is required.'
    if (!form.end_time.trim()) nextFieldErrors.end_time = 'End time is required.'
    if (!form.location.trim()) nextFieldErrors.location = 'Location is required.'
    if (!form.capacity.trim() || Number(form.capacity) <= 0) nextFieldErrors.capacity = 'Capacity must be greater than 0.'
    if (!form.registration_type.trim()) nextFieldErrors.registration_type = 'Access level is required.'
    if (!form.event_type.trim()) nextFieldErrors.event_type = 'Event type is required.'

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setMessage({ type: 'error', text: 'Please complete the highlighted fields before submitting.' })
      return
    }

    const start = new Date(form.start_time)
    const end = new Date(form.end_time)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setFieldErrors((prev) => ({
        ...prev,
        end_time: 'End time must be after start time.',
      }))
      setMessage({
        type: 'error',
        text: 'End time must be after start time.',
      })
      return
    }

    const payload = {
      creator_name: String(user?.name ?? user?.email ?? '').trim(),
      creator_email: String(user?.email ?? '').trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      start_time: form.start_time,
      end_time: form.end_time,
      location: form.location.trim(),
      capacity: Number(form.capacity),
      registration_type: form.registration_type.trim(),
      event_type: form.event_type.trim(),
    }

    if (!payload.creator_email || !payload.creator_name) {
      setMessage({ type: 'error', text: 'Missing email identity. Please sign in again.' })
      return
    }

    if (!Number.isInteger(payload.capacity) || payload.capacity <= 0) {
      setMessage({ type: 'error', text: 'Capacity must be a positive whole number.' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(isEditing ? `${API_BASE}/events/${eventId}` : `${API_BASE}/events`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        const errorText = data?.error ?? (isEditing ? 'Failed to update event.' : 'Failed to create event.')
        setMessage({ type: 'error', text: errorText })
        return
      }

      setForm(initialFormState)
      setFieldErrors({})
      navigate('/my-events', {
        state: { successMessage: isEditing ? 'Event updated successfully!' : 'Event created successfully!' },
      })
    } catch {
      setMessage({
        type: 'error',
        text: isEditing ? 'Network error while updating event.' : 'Network error while creating event.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="event-form-page">
      <header className="event-form-header" aria-label="Create event header">
        <h1>{isEditing ? 'Edit Event' : 'Create Event'}</h1>
        <p>{isEditing ? 'Update the event details below.' : 'Fill in the event details based on your schema fields.'}</p>
      </header>

      <form className="event-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={onChange}
          required
          maxLength={255}
          className={fieldErrors.title ? 'field-error' : ''}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
        />
        {fieldErrors.title && <p id="title-error" className="field-error-message">{fieldErrors.title}</p>}

        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={onChange}
          rows="4"
          required
          className={fieldErrors.description ? 'field-error' : ''}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? 'description-error' : undefined}
        />
        {fieldErrors.description && <p id="description-error" className="field-error-message">{fieldErrors.description}</p>}

        <div className="event-form-grid">
          <div>
            <label htmlFor="start_time">Start Time *</label>
            <input
              id="start_time"
              name="start_time"
              type="datetime-local"
              value={form.start_time}
              onChange={onChange}
              required
              className={fieldErrors.start_time ? 'field-error' : ''}
              aria-invalid={Boolean(fieldErrors.start_time)}
              aria-describedby={fieldErrors.start_time ? 'start_time-error' : undefined}
            />
            {fieldErrors.start_time && <p id="start_time-error" className="field-error-message">{fieldErrors.start_time}</p>}
          </div>
          <div>
            <label htmlFor="end_time">End Time *</label>
            <input
              id="end_time"
              name="end_time"
              type="datetime-local"
              value={form.end_time}
              onChange={onChange}
              required
              className={fieldErrors.end_time ? 'field-error' : ''}
              aria-invalid={Boolean(fieldErrors.end_time)}
              aria-describedby={fieldErrors.end_time ? 'end_time-error' : undefined}
            />
            {fieldErrors.end_time && <p id="end_time-error" className="field-error-message">{fieldErrors.end_time}</p>}
          </div>
        </div>

        <div className="event-form-grid">
          <div>
            <label htmlFor="location">Location (Street Address) *</label>
            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={onChange}
              maxLength={255}
              required
              className={fieldErrors.location ? 'field-error' : ''}
              aria-invalid={Boolean(fieldErrors.location)}
              aria-describedby={fieldErrors.location ? 'location-error' : undefined}
            />
            {fieldErrors.location && <p id="location-error" className="field-error-message">{fieldErrors.location}</p>}
          </div>
          <div>
            <label htmlFor="capacity">Capacity *</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              step="1"
              value={form.capacity}
              onChange={onChange}
              required
              className={fieldErrors.capacity ? 'field-error' : ''}
              aria-invalid={Boolean(fieldErrors.capacity)}
              aria-describedby={fieldErrors.capacity ? 'capacity-error' : undefined}
            />
            {fieldErrors.capacity && <p id="capacity-error" className="field-error-message">{fieldErrors.capacity}</p>}
          </div>
        </div>

        <div className="event-form-grid">
          <div>
            <label htmlFor="registration_type">Access Level *</label>
            <select
              id="registration_type"
              name="registration_type"
              value={form.registration_type}
              onChange={onChange}
              required
              className={fieldErrors.registration_type ? 'field-error' : ''}
              aria-invalid={Boolean(fieldErrors.registration_type)}
              aria-describedby={fieldErrors.registration_type ? 'registration_type-error' : undefined}
            >
              <option value="">Select access level</option>
              <option value="Public">Public</option>
              <option value="RSVP">RSVP</option>
            </select>
            {fieldErrors.registration_type && <p id="registration_type-error" className="field-error-message">{fieldErrors.registration_type}</p>}
          </div>
          <div>
            <label htmlFor="event_type">Event Type *</label>
            <select
              id="event_type"
              name="event_type"
              value={form.event_type}
              onChange={onChange}
              required
              className={fieldErrors.event_type ? 'field-error' : ''}
              aria-invalid={Boolean(fieldErrors.event_type)}
              aria-describedby={fieldErrors.event_type ? 'event_type-error' : undefined}
            >
              <option value="">Select event type</option>
              <option value="Study Group">Study Group</option>
              <option value="Party">Party</option>
              <option value="Club Meeting">Club Meeting</option>
              <option value="Mixer">Mixer</option>
              <option value="Professional Development">Professional Development</option>
              <option value="Other">Other</option>
            </select>
            {fieldErrors.event_type && <p id="event_type-error" className="field-error-message">{fieldErrors.event_type}</p>}
          </div>
        </div>

        {message.text && (
          <p className={`event-form-message ${message.type}`} role="status">
            {message.text}
          </p>
        )}

        <div className="event-form-actions">
          <button type="reset" className="secondary-action" onClick={onReset}>
            Reset
          </button>
          <button type="submit" className="primary-action" disabled={isSubmitting || isLoadingEvent}>
            {isSubmitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
          </button>
          <button type="button" className="secondary-action" onClick={() => navigate('/my-events')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventForm
