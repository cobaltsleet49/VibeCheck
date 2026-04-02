import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import '../App.css'

function Login() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    error,
  } = useAuth0()

  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID
  const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE
  const isAuthConfigured = Boolean(auth0Domain) && Boolean(auth0ClientId)
  const userEmail = String(user?.email ?? '').toLowerCase()
  const isEduEmail = userEmail.endsWith('.edu')
  const isAllowedUser = !isAuthenticated || isEduEmail
  const auth0LoginOptions = {
    authorizationParams: {
      prompt: 'login',
      max_age: 0,
      ...(auth0Audience ? { audience: auth0Audience } : {}),
    },
  }

  useEffect(() => {
    if (isAuthenticated && user && !isEduEmail) {
      logout({ logoutParams: { returnTo: window.location.origin } })
    }
  }, [isAuthenticated, isEduEmail, logout, user])

  return (
    <div className="home-page">
      <section className="hero-panel">
        <p className="eyebrow">VibeCheck</p>
        <h1>Sign in and jump into your community events.</h1>
        <p className="hero-copy">
          One dashboard for campus meetups, workshops, and registrations.
          Keep your schedule and your social life in sync.
        </p>
      </section>

      <section className="login-panel" aria-label="Login">
        <h2>{isAuthenticated && isAllowedUser ? 'You are signed in' : 'Welcome back'}</h2>
        <p className="login-subtitle">
          {isAuthenticated && isAllowedUser
            ? 'Your session is active through Auth0.'
            : 'Continue with Auth0 Universal Login.'}
        </p>

        {!isAuthConfigured && (
          <p className="login-message error" role="status">
            Missing Auth0 setup. Add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in frontend/.env.
          </p>
        )}

        {error && (
          <p className="login-message error" role="status">
            Auth error: {error.message}
          </p>
        )}

        {isAuthenticated && !isEduEmail && (
          <p className="login-message error" role="status">
            Access restricted: please sign in with a .edu email address.
          </p>
        )}

        {isAuthenticated && user && isEduEmail && (
          <div className="user-card" role="status">
            {user.picture && <img src={user.picture} alt={user.name ?? 'Profile'} />}
            <div>
              <p className="user-name">{user.name ?? 'Signed in user'}</p>
              <p className="user-email">{user.email ?? 'No email available'}</p>
            </div>
          </div>
        )}

        <div className="login-actions">
          {!isAuthenticated ? (
            <button
              type="button"
              disabled={!isAuthConfigured || isLoading}
              onClick={() => loginWithRedirect(auth0LoginOptions)}
            >
              {isLoading ? 'Loading...' : 'Sign in with Auth0'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              {isEduEmail ? 'Sign out' : 'Sign out and use .edu email'}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default Login
