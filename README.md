# SQLGuard — Understanding SQL Injection from Attack to Defense

Interactive lab for learning SQL injection: attack a vulnerable login, trace the query, then see how prepared statements stop it.

> [!WARNING]
> **Educational use only.** Includes an intentionally vulnerable PHP API. Do not expose `backend/` to the public internet.

---

## Quick start

**Requirements:** [Node.js 22](https://nodejs.org/) (or 20.19+), [PHP 8+](https://www.php.net/) with SQLite.

### 1. One-time setup (Ubuntu / WSL)

Skip this if Node 22 and PHP are already installed.

```bash
# Node 22 (Ubuntu often ships Node 18 — too old for this project)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PHP + SQLite extension
sudo apt install -y php-cli php-sqlite3
```

Check:

```bash
node -v    # v22.x or v20.19+
php -v     # 8.x
php -m | grep -i sqlite
```

### 2. Run the project (one command)

From the project folder:

```bash
npm install && npm start
```

`npm start` launches **everything**: React UI on port **3000** and PHP API on **8080** (proxied as `/api`).

Open in the browser: **http://localhost:3000**

Stop with `Ctrl+C`.

### First-time clone (copy-paste)

```bash
git clone <repository-url>
cd sql-guard-lab
npm install && npm start
```

### Demo login (real SQLite database)

| Username | Password   | Page          |
| -------- | ---------- | ------------- |
| `admin`  | `admin123` | `/secure`     |
| `alice`  | `password1`| `/secure`     |

SQLi bypass (vulnerable login only): on `/vulnerable`, username `' OR '1'='1' --` → redirects to **Dashboard**.

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `Node … is too old` | Install Node 22 (see step 1 above), then `rm -rf node_modules && npm install` |
| `PDO SQLite is not enabled` | `sudo apt install php-sqlite3` |
| Port 3000 or 8080 in use | Stop other dev servers, or kill: `pkill -f "vite dev"` / `pkill -f "php -S localhost:8080"` |
| UI works but login says backend offline | `npm start` must be running (not `npm run dev:web` alone) |

**Frontend only** (no PHP, client-side simulation): `npm run dev:web`

---

## What's inside

| Page | Route | What it does |
| --- | --- | --- |
| Home | `/` | Overview and learning path |
| Walkthrough | `/walkthrough` | Step-by-step attack animation |
| Attacks | `/attacks` | Technique reference and payloads |
| Defense | `/defense` | How to harden applications |
| Vulnerable | `/vulnerable` | Insecure login + real SQLite API |
| Secure | `/secure` | Prepared statements + same payload library |
| Dashboard | `/dashboard` | After login — shows leaked vs scoped user data |
| Lab | `/lab` | Playground with terminal output |

## Tech stack

- [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- PHP 8 + SQLite (`backend/` JSON API)

## Other commands

| Command | Description |
| --- | --- |
| `npm start` | Same as `npm run dev` — UI + API together |
| `npm run dev` | UI + API together |
| `npm run dev:web` | UI only (no database) |
| `npm run build` | Production build |
| `npm run backend` | PHP API only (`http://localhost:8080`) |

## Project structure

```
backend/     # PHP API + SQLite (auto-created at backend/data/app.db)
src/routes/  # Pages (one file per route)
src/lib/     # SQLi simulation, auth client, payload library
```

## Disclaimer

For classroom and demonstration only. Techniques shown must not be used against systems you do not own or lack permission to test.
