import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import BrowseEvents from './pages/BrowseEvents.jsx'
import EventForm from './pages/EventForm.jsx'
import Home from './pages/Home.jsx'
import EditName from './pages/EditName.jsx'
import Login from './pages/Login.jsx'
import MyEvents from './pages/MyEvents.jsx'
import ViewRegistrations from './pages/ViewRegistrations.jsx'

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0()

  if (isLoading) {
    return (
      <div className="shell-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
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
          <Route path="/edit-name" element={<EditName />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/events/:eventId/registrations" element={<ViewRegistrations />} />
          <Route path="/browse-events" element={<BrowseEvents />} />
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
