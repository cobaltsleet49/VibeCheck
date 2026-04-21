# VibeCheck

> A social event-sharing app — join, create and manage events to connect with your community.

## Website Link

[Click Here](https://main.d3keonkca2xnce.amplifyapp.com)

## User Manual

### Logging In
To use VibeCheck, a user must be logged in with an account. To log in, the user must click the “Sign in with Auth0” on the initial splash page. This will pull up the login page, which has two main options:
- If you’d like to create an account using an email and password, you may do so by entering them into the “Email address” and “Password” text boxes and pressing “Continue”.
- If you’d like to use Google OAuth to log in with your Google account, you may click “Continue with Google” and proceed from there.
Logging in will bring you to VibeCheck’s home page, which displays your name and email.

### Browsing Events
To browse events, you can click the “Browse Events” button in the top bar. This brings you to the event browsing page, which displays every event, besides the ones you yourself may have made. Events list their name, description, date, time, location, type, distance away from you, and public/RSVP status. If you see an event you’d like to attend, you can click the “Sign Up” button across from its name. If the event is public, you’ll instantly be registered for the event. If it’s an RSVP event, a request to register will be sent to the event’s creator, which can be either accepted or declined. Additionally, while browsing events, you can use the filters below the top bar to find events meeting particular criteria. These include:
- Search Keywords: this will limit events to ones with titles, descriptions, or locations similar to your search terms.
- Radius: this will limit the search to events within a certain radius from your location.
- Event Type: this limits search results to events of a particular type, like “Party”, “Study Group”, “Mixer”, etc.
- Access Level: this will either limit the search to either public events or RSVP events.

### My Events
Clicking on the “My Events” tab on the top bar brings you to a list of your own events, divided into two tabs: “Events Created” and “Events Registered”. “Events Created” lists every event you’ve made, including their titles, descriptions, dates, times, locations, type, and access level. You can edit event information by clicking on the “Edit” button, and delete them by clicking on the “Delete” button. Additionally, you can click on the “View Registrations” button to see the list of users that have registered for the event. If you click this button for an RSVP event, instead of a public one, you’ll be given the opportunity to accept or decline users’ RSVP requests.

The second tab, “Events Registered”, displays all events you’ve attempted to register for. These events can take several forms:
- If an event says “Registered”, you’ve been registered for it, regardless of if it's public or an RSVP event.
- If an event says “Pending”, it’s an RSVP event that you haven’t been accepted to or denied from yet.
- If an event says “Denied”, it’s an RSVP event you’ve been rejected from by the owner.
- If an event says “Waitlisted”, more users have attempted to register than the event has capacity for. If other users cancel their registration for this event, you’ll move up in the waitlist, and if you move to waitlist position zero, you’ll be automatically registered for the event.
Additionally, you may press the “Cancel” button on an event you’ve registered for to revoke your registration for it. Cancelled events will remain listed in your registered events section for bookkeeping purposes.

Finally, in the “My Events” page, the “Create Event” option appears in the top bar. Clicking on this allows you to create an event by inputting a name, description, start date/time, end date/time, location, capacity, access level, and event type.

### Profile Dropdown
Finally, clicking the dropdown menu in the top right of the screen will present the user with three options. First, you can click “Change Name” to change your display name. Clicking “Documentation” will provide the user with the GitHub repository for VibeCheck, including documentation and a readme. Finally, the “Sign Out” button will take the user back to the initial splash page, where the user can sign in with a different account if they choose.

## ERD

<img width="820" height="822" alt="Group 24 ER diagram" src="https://github.com/user-attachments/assets/84c62d5c-56c0-4311-b7ed-8eae61b3d3ba" />

## Project Structure

| Folder | Stack | Purpose |
|--------|-------|---------|
| [`frontend/`](./frontend) | React (Vite) | Single-page application |
| [`backend/`](./backend) | PHP 8.3 | REST API |
| [`database/`](./database) | MySQL / SQL | Schema & seed data |
| [`devops/`](./devops) | Docker / Nginx | Containerisation & orchestration |

## Quick Start (Docker)

```bash
cd devops
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| MySQL | localhost:3306 |

## Prerequisites (Local Development)

- Node.js: https://nodejs.org/en/download
- Composer: https://getcomposer.org/download/
- PHP: https://www.php.net/downloads.php

## Development

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # Defaults to http://localhost:5173
```

Frontend environment variables:
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE` (optional)

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
composer install
cp .env.example .env
php -S localhost:8080 -t public
```

Backend environment variable:
- `POSITIONSTACK_API_KEY` (for address geocoding to latitude/longitude)

### Database
Apply the schema once a MySQL server is running:
```bash
cd ..
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create user |
| `GET` | `/api/events` | List events |
| `POST` | `/api/events` | Create event |
| `PUT` | `/api/events/:id` | Update event |
| `DELETE` | `/api/events/:id` | Delete event |
| `GET` | `/api/registrations` | List event registrations |
| `POST` | `/api/registrations` | Create event registration |
| `GET` | `/api/registrations/:id` | Get registration by id |
| `DELETE` | `/api/registrations/:id` | Delete registration |
