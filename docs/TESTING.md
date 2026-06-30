# SQLGuard — Test documentation

This document satisfies **project requirement 7**: test cases, test documentation, static testing, and dynamic testing.

The **website is React** (`src/`). The **database and login logic** are exercised through a **PHP JSON API** (`backend/api/`) backed by **SQLite**. Automated tests target the API login handlers (same code the running app uses).

---

## Requirements traceability

| # | Requirement | How we satisfy it | Evidence |
|---|-------------|-------------------|----------|
| 1 | Simple website, few open pages | React routes: `/`, `/walkthrough`, `/attacks`, `/defense`, `/lab` | Manual / UI |
| 2 | Login → protected pages | `/vulnerable`, `/secure` → `/dashboard` | FC-UI-03, TC-01 |
| 3 | Program the website | React + TypeScript frontend; PHP API | Source tree |
| 4 | Database for users | SQLite `users` table (`backend/init.php`) | `backend/data/app.db` |
| 5 | SQL injection without password | Vulnerable API concatenates SQL | TC-03…TC-15 |
| 6 | Proper protection | Secure API uses prepared statements + `password_verify` | Static + TC-* on secure |
| 7 | Test cases + static + dynamic testing | This file + `npm test` | Below |

---

## How to run all tests

```bash
npm test
```

| Command | What it runs |
|---------|----------------|
| `npm test` | Static checks + dynamic TC-01…TC-16 |
| `npm run test:static` | Code review automation (`scripts/static-security-check.mjs`) |
| `npm run test:dynamic` | PHP security catalogue (`backend/tests/run-tests.php`) |

**Prerequisites:** PHP 8+ with `pdo_sqlite` (same as `npm start`).

---

## Static testing

**Goal:** Find unsafe SQL construction and missing mitigations **without** executing attacks.

**Method:**

1. Automated script searches `backend/lib/login-handlers.php`:
   - `vulnerable_login_attempt` must concatenate input (intentional flaw).
   - `secure_login_attempt` must use `prepare()` and `password_verify()`.
2. Manual review of `backend/api/login-vulnerable.php` vs `login-secure.php`.

**Run:**

```bash
npm run test:static
```

**Expected:** All checks PASS.

---

## Dynamic testing

**Goal:** Execute the 16 security test cases from the report against **live login logic** (in-memory SQLite, seeded like production).

**Method:** `backend/tests/run-tests.php` calls the same functions as the API endpoints.

**Run:**

```bash
npm run test:dynamic
```

### Security test catalogue (TC-01 … TC-16)

| ID | Objective | Input (user / pass) | Expected (vulnerable) | Expected (secure) |
|----|-----------|---------------------|----------------------|-------------------|
| TC-01 | Valid login | `alice` / `password1` | Granted | Granted |
| TC-02 | Wrong password | `alice` / `wrong` | Denied | Denied |
| TC-03 | Classic bypass | `' OR '1'='1' --` / — | **Bypass** | Denied |
| TC-04 | Numeric tautology | `' OR 1=1 --` / — | **Bypass** | Denied |
| TC-05 | Comment as admin | `admin' --` / — | **Bypass** | Denied |
| TC-06 | MySQL `#` on SQLite | `admin'#` / — | **Error** | Denied |
| TC-07 | UNION forged row | `' UNION SELECT 1,'admin',…` / — | **Bypass** | Denied |
| TC-08 | UNION null probe | `' UNION SELECT null,…` / — | **Bypass** | Denied |
| TC-09 | Blind boolean | `' OR 'a'='a` / — | Denied | Denied |
| TC-10 | AND 1=1 probe | `' AND 1=1 --` / — | Denied | Denied |
| TC-11 | Stacked SELECT | `'; SELECT 1; --` / — | Denied | Denied |
| TC-12 | Stacked DROP | `'; DROP TABLE users; --` / — | Denied | Denied |
| TC-13 | No-space comment | `admin'--` / — | **Bypass** | Denied |
| TC-14 | Empty-string OR | `' OR ''='` / — | Denied | Denied |
| TC-15 | Password-field OR | `admin` / `' OR '1'='1' --` | **Bypass** | Denied |
| TC-16 | Single-quote probe | `'` / — | **Error** | Denied |

**Observed results (SQLite + PDO):** 7 authentication bypasses on the vulnerable build; **0** on the secure build. Stacked queries do not execute (PDO single-statement). MySQL `#` comments fail on SQLite.

---

## Functional test cases

### API (automated via dynamic suite + manual)

| ID | Objective | Steps | Expected |
|----|-----------|-------|----------|
| FC-API-01 | Session empty when logged out | `GET /api/session` | `authenticated: false` |
| FC-API-02 | Vulnerable login sets session | POST `/api/login/vulnerable` TC-03 | `granted: true` |
| FC-API-03 | Secure logout | POST `/api/logout` | `ok: true` |

### UI (manual — React; run with `npm start`)

| ID | Objective | Steps | Expected |
|----|-----------|-------|----------|
| FC-UI-01 | Public pages load | Visit `/`, `/attacks`, `/walkthrough` | Pages render |
| FC-UI-02 | Dashboard blocked | Open `/dashboard` without login | Redirect to `/vulnerable` |
| FC-UI-03 | Login → dashboard | `admin` / `admin123` on `/secure` | Dashboard with user data |
| FC-UI-04 | Logout | Click Log out on dashboard | Home; session cleared |
| FC-UI-05 | Empty submit | Submit empty form on `/vulnerable` | Denied / no crash |

---

## Manual dynamic testing (UI)

With `npm start` open:

1. **http://localhost:3000/vulnerable** — run TC-03 payload → dashboard (red badge).
2. **http://localhost:3000/secure** — same payload → access denied (green).
3. **http://localhost:3000/dashboard** — vulnerable session shows full user table leak.

---

## Test artefacts

| File | Purpose |
|------|---------|
| `backend/tests/security-test-cases.php` | TC-01…TC-16 definitions |
| `backend/tests/run-tests.php` | Dynamic test runner |
| `backend/lib/login-handlers.php` | Shared login logic (API + tests) |
| `scripts/static-security-check.mjs` | Static analysis |
| `report/main.tex` | Formal report (§8 testing) |

---

## Limitations

- Stacked queries are documented but not executed (PDO + SQLite single statement).
- UI tests are manual; API security tests are fully automated.
- Destructive payloads are not run against the persistent `app.db` (tests use in-memory DB).
