import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import EventForm from './pages/EventForm.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MyEvents from './pages/MyEvents.jsx'

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0()

  const userEmail = String(user?.email ?? '').toLowerCase()
  const isEduEmail = userEmail.endsWith('.edu')

  if (isLoading) {
    return (
      <div className="shell-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (isAuthenticated && isEduEmail) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <Home
                user={user}
                onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              />
            }
          />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/edit/:eventId" element={<EventForm />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return <Login />
}

export default App
