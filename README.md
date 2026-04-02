# VibeCheck

> A social mood-sharing app — check and share your vibe with the world.

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
