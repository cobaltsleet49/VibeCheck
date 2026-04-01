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

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
cd backend
composer install
cp .env.example .env
php -S localhost:8080 -t public
```

### Database
Apply the schema once a MySQL server is running:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql   # optional sample data
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create user |
| `GET` | `/api/events` | List events |
| `POST` | `/api/events` | Create event |
| `GET` | `/api/registrations` | List event registrations |
| `POST` | `/api/registrations` | Create event registration |
