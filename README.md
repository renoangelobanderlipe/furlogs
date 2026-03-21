# FurLog

A multi-user pet care management application for tracking your pets' health, vet visits, medications, vaccinations, reminders, and more — all shared across a household.

**Live:** [furlogs.reno-is.dev](https://furlogs.reno-is.dev)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2 (App Router), React 19, TypeScript 5 |
| UI | MUI 7, Tailwind CSS, Radix UI, Recharts, FullCalendar |
| State | TanStack Query v5, Zustand |
| Backend | Laravel 13, PHP 8.3+, PostgreSQL |
| Auth | Laravel Sanctum 4 (stateful SPA, cookie-based) |
| Roles | Spatie Laravel Permission v7 (teams mode) |
| Media | Spatie Laravel Medialibrary v11 |
| Email | Resend |
| Testing | Pest 4 (139+ tests) |
| Tooling | Bun workspaces, Biome 2, Pint, PHPStan level 6 |

---

## Features

- **Household collaboration** — Invite family members, manage roles, shared pet data
- **Pet management** — Profiles, avatars, weight history
- **Vet care** — Vet visits with file attachments, vaccinations, medications
- **Reminders** — Snooze, dismiss, and complete care reminders
- **Notifications** — In-app notification center with read/unread tracking
- **Calendar** — Unified view of appointments and upcoming events
- **Food stock** — Track food products, consumption rates, and stock projections
- **Dashboard** — Household summary stats at a glance
- **Settings** — Profile, notification preferences, household management

---

## Project Structure

```
furlogs/
├── apps/
│   ├── web/      # Next.js frontend
│   └── server/   # Laravel API
├── package.json  # Bun workspace root
└── biome.json    # Linter/formatter config
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- PHP 8.3+ with Composer
- PostgreSQL

### Installation

```bash
# Install JS dependencies
bun install

# Install PHP dependencies
bun run install:server

# Copy and configure environment
cp apps/server/.env.example apps/server/.env

# Run migrations and seed
cd apps/server && php artisan migrate --seed
```

### Development

```bash
# Run everything concurrently (Next.js + Laravel + queue + logs)
bun dev

# Or run individually
bun run dev:web      # Next.js dev server
bun run dev:server   # Laravel server + queue + pail
```

---

## Commands

### Frontend (`apps/web`)

```bash
bun run build:web    # Production build
bun run lint:web     # Biome lint
bun run format:web   # Biome format
```

### Backend (`apps/server`)

```bash
# From apps/server/ or via root scripts
bun run test:server          # Run Pest test suite
vendor/bin/pint --dirty      # Format changed PHP files
vendor/bin/phpstan analyse   # Static analysis
php artisan <command>        # Any Artisan command
```

---

## Architecture

### Frontend

The web app uses Next.js 16 App Router with route groups:

- `app/(auth)/` — Login, register, email verification, password reset
- `app/(dashboard)/` — All authenticated pages (pets, vet visits, calendar, etc.)
- `app/(onboarding)/` — First-time household setup

Data fetching is handled by TanStack Query via an Axios client. Client state (auth, theme, household) lives in Zustand stores.

> **Note:** Next.js 16 replaces `middleware.ts` with `proxy.ts` for auth routing.

### Backend

Laravel 13 API-only with a layered architecture:

```
Controllers → FormRequests → Services → Models
                                  ↓
                             Policies (authorization)
                             Resources (API responses)
                             Observers / Events
```

All data is scoped to the authenticated user's household using a `BelongsToHousehold` trait and query scopes. Role-based access is managed per-household via Spatie Permission.

---

## API

Base URL: `https://api.furlogs.reno-is.dev`

API documentation is auto-generated via [Scramble](https://scramble.dedoc.co) and available at `/docs/api` in development.

Key resource groups:

| Group | Endpoints |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/logout`, email verification |
| User | `/user`, `/user/password`, `/user/notification-preferences` |
| Households | `/households`, `/households/{id}/invite`, `/households/{id}/members` |
| Pets | `/pets`, `/pets/{id}/avatar`, `/pets/{id}/weights` |
| Vet Care | `/vet-visits`, `/vaccinations`, `/medications`, `/vet-clinics` |
| Reminders | `/reminders` (with complete/snooze/dismiss actions) |
| Notifications | `/notifications` |
| Food | `/food-products`, `/food-stock-items`, `/food-stock/projections` |
| Dashboard | `/dashboard/summary` |
| Calendar | `/calendar/events` |

---

## Testing

```bash
bun run test:server
# or
cd apps/server && php artisan test --compact
```

139+ feature and unit tests covering auth, household scoping, RBAC, and all resource endpoints.

---

## Deployment

| App | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — `furlogs.reno-is.dev` |
| API | [Laravel Cloud](https://cloud.laravel.com) — `api.furlogs.reno-is.dev` |

Auth cookies are scoped to `.furlogs.reno-is.dev`.
