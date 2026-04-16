import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import './EditName.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

function EditName() {
  const navigate = useNavigate()
  const { user } = useAuth0()
  const [userRecord, setUserRecord] = useState(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadUserRecord() {
      const userEmail = String(user?.email ?? '').toLowerCase().trim()
      const fallbackName = String(user?.name ?? user?.nickname ?? userEmail.split('@')[0] ?? 'User').trim()
      if (!userEmail) {
        if (isActive) {
          setMessage({ type: 'error', text: 'Missing email identity. Please sign in again.' })
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await fetch(`${API_BASE}/users`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error ?? 'Unable to load your profile.')
        }

        const users = Array.isArray(data) ? data : []
        const currentUser = users.find(
          (candidate) => String(candidate.email ?? '').toLowerCase().trim() === userEmail,
        )

        if (!currentUser) {
          const createResponse = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: fallbackName || 'User',
              email: userEmail,
            }),
          })

          const createdData = await createResponse.json()
          if (!createResponse.ok) {
            throw new Error(createdData?.error ?? 'Unable to create your profile.')
          }

          if (isActive) {
            setUserRecord(createdData)
            setName(String(createdData?.name ?? fallbackName))
            setIsLoading(false)
          }

          return
        }

        if (!isActive) {
          return
        }

        setUserRecord(currentUser)
        setName(String(currentUser.name ?? ''))
      } catch {
        if (isActive) {
          setMessage({ type: 'error', text: 'Unable to load your name right now.' })
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadUserRecord()

    return () => {
      isActive = false
    }
  }, [user?.email])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage({ type: '', text: '' })
    setFieldError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFieldError('Display name is required.')
      return
    }

    if (!userRecord?.user_id) {
      setMessage({ type: 'error', text: 'Unable to find your account record.' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE}/users/${userRecord.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to update your name.')
      }

      setUserRecord(data)
      setName(String(data?.name ?? trimmedName))
      navigate('/home', { state: { successMessage: 'Display name updated successfully!' } })
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: saveError instanceof Error ? saveError.message : 'Unable to update your name.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="edit-name-page">
      <header className="edit-name-top-card" aria-label="Edit name header">
        <div className="edit-name-top-left">
          <button type="button" className="back-button" onClick={() => navigate('/home')} aria-label="Back to Home">
            ←
          </button>
          <p className="brand">Edit Name</p>
        </div>
      </header>

      <section className="edit-name-form-card">
        {isLoading ? (
          <p className="edit-name-note">Loading your profile...</p>
        ) : (
          <form className="edit-name-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="name">Display Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setFieldError('')
              }}
              placeholder="Enter your display name"
              maxLength={255}
              className={fieldError ? 'field-error' : ''}
            />

            {fieldError && <p className="edit-name-message error">{fieldError}</p>}

            {message.text && (
              <p className={`edit-name-message ${message.type}`} role="status">
                {message.text}
              </p>
            )}

            <div className="edit-name-actions">
              <button type="button" className="secondary-action" onClick={() => navigate('/home')}>
                Cancel
              </button>
              <button type="submit" className="primary-action" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Name'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default EditName