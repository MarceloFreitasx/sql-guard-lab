# PHP + SQLite API

JSON API for the React frontend — real SQLite login (vulnerable vs secure).

## Prerequisites

- PHP 8.1+ with **PDO SQLite** (`php-sqlite3`)

```bash
php -v
php -m | grep -i sqlite
```

On Ubuntu/WSL:

```bash
sudo apt install php-cli php-sqlite3
```

## Run

From the repository root (usually via `npm run dev`, which starts this alongside Vite):

```bash
npm run backend
```

API base: **http://localhost:8080** (Vite proxies `/api/*` → `:8080` in development).

The SQLite file is created at `backend/data/app.db` on the first request.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/login/vulnerable` | String-built SQL login |
| POST | `/api/login/secure` | Prepared statement login |
| GET | `/api/session` | Current PHP session |
| GET | `/api/users` | User listing (full dump in vulnerable mode) |
| POST | `/api/logout` | End session |

Request body for login: `{ "username": "...", "password": "..." }`.

## Demo accounts

| Username | Password |
| --- | --- |
| `admin` | `admin123` |
| `alice` | `password1` |

## Layout

```
backend/
  api/           # JSON endpoints (used by React)
  config.php     # PDO + SQLite connection
  init.php       # Schema + seed data
  router.php     # Routes /api/* for php -S
  data/app.db    # SQLite (gitignored, auto-created)
```

## Reset database

```bash
rm -f backend/data/app.db
```

Next request recreates the schema and seed users.
