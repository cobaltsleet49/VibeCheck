import { useEffect, useId, useRef, useState } from 'react'
import './ProfileMenu.css'

const DEFAULT_DOCS_URL = 'https://github.com/cobaltsleet49/VibeCheck'
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

function getInitials(displayName) {
  const normalizedName = String(displayName ?? 'U').trim() || 'U'
  const parts = normalizedName.split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return 'U'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function fallbackDisplayName(user) {
  return String(user?.name ?? user?.nickname ?? user?.email ?? 'U').trim()
}

function ProfileMenu({ user, onEditName, onLogout, docsUrl = DEFAULT_DOCS_URL }) {
  const [isOpen, setIsOpen] = useState(false)
  const [storedDisplayName, setStoredDisplayName] = useState('')
  const menuRef = useRef(null)
  const menuId = useId()
  const effectiveDisplayName = storedDisplayName || fallbackDisplayName(user)
  const initials = getInitials(effectiveDisplayName)

  useEffect(() => {
    let isActive = true
    const userEmail = String(user?.email ?? '').toLowerCase().trim()

    if (!userEmail) {
      setStoredDisplayName('')
      return () => {
        isActive = false
      }
    }

    async function loadStoredDisplayName() {
      try {
        const response = await fetch(`${API_BASE}/users`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Unable to load user profile.')
        }

        const users = Array.isArray(data) ? data : []
        const currentUser = users.find(
          (candidate) => String(candidate.email ?? '').toLowerCase().trim() === userEmail,
        )

        if (isActive) {
          setStoredDisplayName(String(currentUser?.name ?? '').trim())
        }
      } catch {
        if (isActive) {
          setStoredDisplayName('')
        }
      }
    }

    loadStoredDisplayName()

    return () => {
      isActive = false
    }
  }, [user?.email])

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function closeMenu() {
    setIsOpen(false)
  }

  function handleEditName() {
    closeMenu()
    onEditName?.()
  }

  function handleLogout() {
    closeMenu()
    onLogout?.()
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((previousOpen) => !previousOpen)}
      >
        <span className="profile-menu-avatar profile-menu-fallback" aria-hidden="true">
          {initials}
        </span>
        <span className="profile-menu-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="profile-menu-dropdown" id={menuId} role="menu" aria-label="Profile menu">
          <button type="button" className="profile-menu-item" role="menuitem" onClick={handleEditName}>
            Change Name
          </button>
          <a
            className="profile-menu-item profile-menu-link"
            role="menuitem"
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            Documentation
          </a>
          <button type="button" className="profile-menu-item danger" role="menuitem" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
