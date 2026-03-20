# FurLog — Technical Requirements Document

**Version:** 1.0
**Date:** March 20, 2026
**Author:** Angelo
**Status:** Draft
**Classification:** Internal

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Tech stack](#2-tech-stack)
3. [Architecture overview](#3-architecture-overview)
4. [Data model](#4-data-model)
5. [Authentication & authorization](#5-authentication--authorization)
6. [API design](#6-api-design)
7. [Core modules](#7-core-modules)
8. [Frontend architecture](#8-frontend-architecture)
9. [Backend architecture](#9-backend-architecture)
10. [Security](#10-security)
11. [UX patterns](#11-ux-patterns)
12. [Infrastructure & deployment](#12-infrastructure--deployment)
13. [Coding standards](#13-coding-standards)
14. [Testing strategy](#14-testing-strategy)
15. [Performance targets](#15-performance-targets)
16. [Build phases](#16-build-phases)
17. [Appendix](#17-appendix)

---

## 1. Project overview

### 1.1 Summary

FurLog is a multi-user pet care management hub for tracking vet visits, vaccinations, medications, food stock, and pet health profiles. It serves as both a personal household tool and a portfolio-grade full-stack application.

### 1.2 Goals

- Provide a centralized dashboard for monitoring pet health, upcoming reminders, and food stock levels across a household.
- Support multi-user households where family members share access to the same pets and records.
- Implement an intelligent food stock tracking system combining inventory counting with estimated consumption projections.
- Deliver timely reminders for vaccinations, medications, and low stock via in-app and email notifications.
- Maintain a complete, auditable history of vet visits with file attachments (lab results, receipts, photos).

### 1.3 Users

- **Owner**: the household creator with full administrative control — manages pets, members, settings, and all records.
- **Member**: a family member invited to the household — can view all data and create/edit records but cannot delete pets, invite users, or change household settings.
- **Viewer** (future): read-only access for caregivers or pet sitters.

### 1.4 Non-goals (out of scope for v1)

- Mobile native app (the web app is responsive but not a native build).
- Real-time collaboration / conflict resolution for simultaneous edits.
- Integration with third-party vet clinic systems or pet insurance APIs.
- E-commerce features (purchasing food directly from the app).
- AI-powered features (breed identification, health predictions).
- Keyboard shortcuts.
- Print-optimized views for vet records.

---

## 2. Tech stack

### 2.1 Frontend

| Concern | Decision | Notes |
|---|---|---|
| Framework | Next.js 16 (16.2) | App Router, Turbopack default, React Compiler enabled |
| UI library | MUI (Material UI) | Familiar, fast to build with |
| State — server | TanStack Query v5 | Caching, background refetch, loading/error states |
| State — client | Zustand | Ephemeral UI state (sidebar, pet filter, theme) |
| Forms | React Hook Form + Zod | Type-safe schema validation |
| HTTP client | Axios | Standard Sanctum SPA flow with `withCredentials` + `withXSRFToken` |
| Charts | Recharts | Weight trends, spending breakdowns, stock consumption |
| Calendar | FullCalendar | Month/week/day views, event rendering |
| Toast notifications | Sonner | Promise toasts, dark mode support |
| Date inputs | MUI DatePicker | Calendar popup, consistent across forms |
| Linting & formatting | Biome | Single tool replacing ESLint + Prettier |
| Theme | Dark default + light available | MUI ThemeProvider, user-switchable |
| Localization | English only, i18n-ready | String keys from day 1 for future translation |
| Hosting | Vercel (free tier) | `furlogs.reno-is.dev` |

### 2.2 Backend

| Concern | Decision | Notes |
|---|---|---|
| Framework | Laravel 13 | PHP 8.3+, first-party JSON:API support |
| API style | REST + JSON:API spec | Laravel 13 built-in `JsonApiResource` |
| Auth | Laravel Sanctum | SPA cookie-based, CSRF token flow |
| Database | PostgreSQL | Serverless Postgres on Laravel Cloud (Neon) |
| File storage | Laravel Cloud Object Storage | 2 buckets: public (avatars) + private (documents) |
| Media handling | spatie/laravel-medialibrary | Conversions, WebP, organized storage |
| Permissions | spatie/laravel-permission | Teams feature for household-scoped RBAC |
| Code style | Laravel Pint | Laravel preset + strict types |
| Static analysis | PHPStan level 6 | Level 7+ aspirational in Phase 7 |
| Testing | Pest PHP | Expressive syntax, architecture tests |
| Debugging | Laravel Telescope | Local only — queries, requests, jobs, mail |
| API docs | Scramble | Auto-generated from code |
| Queue | Laravel Queue | sync (dev), database (prod) |
| Notifications | Laravel Notifications | `database` + `mail` channels |
| Email provider | Resend | Free tier, Laravel-friendly |
| Hosting | Laravel Cloud (Starter plan) | `api.furlogs.reno-is.dev` |

### 2.3 Development environment

| Concern | Decision |
|---|---|
| Local dev | Laravel Herd |
| AI-assisted dev | Claude Code |
| Pre-commit | Husky + lint-staged + commitlint |
| Repo structure | Monorepo (`/frontend` + `/backend`) |
| Git hosting | GitHub |
| CI/CD | Laravel Cloud built-in + GitHub Actions (basic) |

### 2.4 MCP servers (Claude Code)

Claude Code **must** use the following MCP servers as the primary source of truth when generating code. These are connected and available in the development environment. Claude Code should always query the relevant MCP server before relying on its own training data for framework-specific patterns, APIs, or components.

| MCP Server | Scope | Strict usage rule |
|---|---|---|
| **MUI MCP** | All MUI component usage, theming, props, patterns | Always consult before writing any MUI component code. Use MCP-provided component APIs, prop types, and examples over training data. |
| **Next.js MCP** | App Router, routing, `proxy.ts`, server components, config | Always consult for Next.js 16-specific patterns, configuration, and API. Especially critical for `proxy.ts`, React Compiler config, and Turbopack behavior. |
| **Laravel Boost MCP** | Laravel controllers, services, Eloquent, artisan, packages | Always consult for Laravel 13-specific features, JSON:API resource implementation, Sanctum config, and package integration (Spatie, Pest, Scramble). |

**Enforcement rules for Claude Code:**

1. **MCP-first**: When writing code that touches MUI, Next.js, or Laravel, Claude Code must query the relevant MCP server first to get the latest API, patterns, and best practices. Never assume — always verify via MCP.
2. **No stale patterns**: If the MCP server returns information that conflicts with Claude Code's training data, the MCP response takes precedence. This is especially important for Next.js 16 (breaking changes from 15) and Laravel 13 (new JSON:API support, PHP attributes).
3. **Cross-reference**: For code that spans multiple domains (e.g., a Next.js page using MUI components that fetches from a Laravel API), consult all relevant MCP servers before generating the code.
4. **Document MCP usage**: When Claude Code uses an MCP server to inform a code decision, it should note this in commit messages or PR descriptions when the pattern differs from common conventions.

**CLAUDE.md integration**: Each `CLAUDE.md` file must include the MCP strict-usage directive:

```markdown
## MCP servers — STRICT USAGE REQUIRED

When generating code for this project, ALWAYS query the relevant MCP server before writing framework-specific code:

- MUI MCP: All component usage, theming, props, styling patterns
- Next.js MCP: Routing, config, proxy.ts, server components, middleware
- Laravel Boost MCP: Controllers, services, Eloquent, artisan, package integration

MCP responses take precedence over training data. Do not guess — verify.
```

### 2.5 Existing setup (already complete)

- Git repo on GitHub
- Root `package.json` with workspaces
- Biome configured for frontend
- Laravel 13 initialized in `/backend`
- Default routes/controllers removed
- Sanctum installed
- Database connection configured (PostgreSQL)
- ENV files set up

---

## 3. Architecture overview

### 3.1 System architecture

```
[Browser] → furlogs.reno-is.dev (Vercel)
              │
              │  Axios + Sanctum cookies
              │  withCredentials: true
              │  withXSRFToken: true
              ▼
         api.furlogs.reno-is.dev (Laravel Cloud)
              │
              ├── Serverless Postgres (Neon)
              ├── Cloud Bucket: public (avatars)
              ├── Cloud Bucket: private (documents)
              └── Laravel Queue (database driver)
                   └── Email via Resend
```

### 3.2 Domain configuration

| Concern | Value |
|---|---|
| Frontend URL | `furlogs.reno-is.dev` |
| API URL | `api.furlogs.reno-is.dev` |
| Cookie domain | `.furlogs.reno-is.dev` |
| `SANCTUM_STATEFUL_DOMAINS` | `furlogs.reno-is.dev` |
| `SESSION_DOMAIN` | `.furlogs.reno-is.dev` |

### 3.3 Monorepo structure

```
furlog/
├── .husky/
│   ├── pre-commit              # lint-staged
│   └── commit-msg              # commitlint
├── frontend/                   # Next.js 16
│   ├── src/
│   ├── biome.json
│   ├── next.config.ts
│   ├── CLAUDE.md
│   └── package.json
├── backend/                    # Laravel 13
│   ├── app/
│   ├── pint.json
│   ├── phpstan.neon
│   ├── CLAUDE.md
│   └── composer.json
├── CLAUDE.md                   # Root project context + MCP strict-usage directive
├── AGENTS.md                   # Next.js 16.2 AI agent config
├── .mcp.json                   # MCP server configuration (MUI, Next.js, Laravel Boost)
├── commitlint.config.js
├── package.json                # Workspaces, Husky, lint-staged
└── README.md
```

### 3.4 Key architectural patterns

**Sanctum SPA cookie flow**: The frontend calls `/sanctum/csrf-cookie` before login/register. Axios with `withCredentials: true` and `withXSRFToken: true` handles CSRF automatically on all subsequent requests. Session cookies are shared across subdomains via `SESSION_DOMAIN=.furlogs.reno-is.dev`.

**Service/Action pattern**: Controllers receive requests, validate via FormRequests, then delegate to service classes. Services contain business logic and call Eloquent directly (no repository layer). Complex standalone operations get their own Action class with a single `__invoke` method.

**Multi-tenancy via global scope**: All household-scoped models use a `BelongsToHousehold` trait that applies a global `HouseholdScope`, filtering all queries by the authenticated user's `current_household_id`. This prevents data leakage at the model layer.

**TanStack Query + Zustand boundary**: TanStack Query owns all server-derived data (pets, visits, stock, reminders). Zustand owns ephemeral UI state (selected pet filter, sidebar collapse, theme preference). They never overlap.

**JSON:API compliance**: All API responses follow the JSON:API spec using Laravel 13's built-in `JsonApiResource`. Responses include `type`, `id`, `attributes`, and `relationships`. Clients use `?include=` for eager loading and `?fields[]=` for sparse fieldsets.

---

## 4. Data model

### 4.1 Overview

16 tables across two domains:

**Core domain** (10 tables): `users`, `households`, `household_members`, `pets`, `pet_weights`, `vet_clinics`, `vet_visits`, `vaccinations`, `medications`

**Operational domain** (6 tables): `food_products`, `food_stock_items`, `food_consumption_rates`, `food_consumption_logs`, `reminders`, `notifications`

### 4.2 Users table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| name | string | |
| email | string UK | |
| password | string | Bcrypt hashed |
| email_verified_at | timestamp | Required before app access |
| avatar_path | string nullable | |
| current_household_id | bigint FK nullable | Active household for scoping |
| timezone | string | Default: `Asia/Manila` |
| remember_token | string nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.3 Households table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string | e.g., "Angelo's Household" |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.4 Household members (pivot)

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | bigint FK | |
| household_id | bigint FK | |
| role | enum | `owner`, `member` |
| invited_at | timestamp nullable | |
| joined_at | timestamp nullable | |

### 4.5 Pets table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| household_id | bigint FK | Scoped via global scope |
| name | string | Max 50 chars |
| species | enum | `dog`, `cat` |
| breed | string nullable | Max 100 chars |
| sex | enum | `male`, `female` |
| birthday | date nullable | |
| photo_path | string nullable | Managed by Spatie Media Library |
| is_neutered | boolean | Default: false |
| size | enum nullable | `small`, `medium`, `large` |
| notes | text nullable | Max 2000 chars |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp nullable | Soft deletes |

### 4.6 Pet weights table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| pet_id | bigint FK | |
| weight_kg | decimal(5,2) | |
| recorded_at | date | |

### 4.7 Vet clinics table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| household_id | bigint FK | |
| name | string | |
| address | string nullable | |
| phone | string nullable | |
| notes | text nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.8 Vet visits table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| pet_id | bigint FK | |
| clinic_id | bigint FK nullable | |
| vet_name | string nullable | |
| visit_date | date | |
| visit_type | enum | `checkup`, `treatment`, `vaccine`, `emergency` |
| reason | string | |
| diagnosis | text nullable | |
| treatment | text nullable | |
| cost | decimal(10,2) nullable | In PHP (₱) |
| weight_at_visit | decimal(5,2) nullable | |
| follow_up_date | date nullable | |
| notes | text nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp nullable | Soft deletes |

### 4.9 Vaccinations table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| pet_id | bigint FK | |
| clinic_id | bigint FK nullable | |
| vaccine_name | string | |
| administered_date | date | |
| next_due_date | date nullable | |
| vet_name | string nullable | |
| batch_number | string nullable | |
| notes | text nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp nullable | Soft deletes |

### 4.10 Medications table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| pet_id | bigint FK | |
| vet_visit_id | bigint FK nullable | Links to prescribing visit |
| name | string | |
| dosage | string nullable | |
| frequency | string nullable | |
| start_date | date | |
| end_date | date nullable | |
| notes | text nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp nullable | Soft deletes |

### 4.11 Food products table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| household_id | bigint FK | |
| name | string | e.g., "Premium dog kibble" |
| brand | string nullable | e.g., "Pedigree" |
| type | enum | `dry`, `wet`, `treat`, `supplement` |
| unit_weight_grams | integer nullable | Weight per unit (e.g., 8000 for 8kg bag) |
| unit_type | enum | `kg`, `can`, `pack`, `piece` |
| alert_threshold_pct | integer | Default: 25 |
| notes | text nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp nullable | Soft deletes |

### 4.12 Food stock items table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| food_product_id | bigint FK | |
| status | enum | `sealed`, `open`, `finished` |
| purchased_at | date | |
| opened_at | date nullable | |
| finished_at | date nullable | |
| purchase_cost | decimal(10,2) nullable | |
| purchase_source | string nullable | e.g., "Pet Express", "Shopee" |
| quantity | integer | For countable items |
| notes | text nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.13 Food consumption rates table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| food_product_id | bigint FK | |
| pet_id | bigint FK | |
| daily_amount_grams | integer | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.14 Food consumption logs table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| food_stock_item_id | bigint FK | |
| actual_duration_days | integer | |
| actual_daily_rate_grams | integer | |
| estimated_vs_actual_diff | decimal(5,2) | Percentage difference |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.15 Reminders table

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| household_id | bigint FK | |
| pet_id | bigint FK nullable | |
| type | enum | `vaccination`, `medication`, `vet_appointment`, `food_stock`, `custom` |
| title | string | |
| description | text nullable | |
| due_date | date | |
| is_recurring | boolean | Default: false |
| recurrence_days | integer nullable | e.g., 90 for quarterly deworming |
| status | enum | `pending`, `snoozed`, `completed`, `dismissed` |
| source_id | bigint nullable | Polymorphic |
| source_type | string nullable | Polymorphic |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.16 Notifications table

Laravel's built-in notification table schema with `id`, `type`, `notifiable_type`, `notifiable_id`, `data` (JSON), `read_at`, `created_at`, `updated_at`.

### 4.17 Database indexes

Beyond primary and foreign keys:

| Table | Index | Purpose |
|---|---|---|
| pets | `(household_id, species)` | Filtered pet lists |
| vet_visits | `(pet_id, visit_date)` | Timeline queries |
| food_stock_items | `(food_product_id, status)` | Active stock lookups |
| reminders | `(household_id, due_date, status)` | Daily scheduled job |
| notifications | `(notifiable_id, read_at)` | Unread count queries |

### 4.18 Soft deletes

Applied to: `pets`, `vet_visits`, `vaccinations`, `medications`, `food_products`.

### 4.19 Data retention

All data is kept permanently. No automated pruning or archival for v1.

---

## 5. Authentication & authorization

### 5.1 Auth flow

1. User visits `furlogs.reno-is.dev/register` and creates an account.
2. Email verification is **required** before accessing the app.
3. After verification, the onboarding wizard runs: create household → add first pet → done.
4. On login, the frontend calls `/sanctum/csrf-cookie`, then `POST /login` with credentials.
5. Sanctum issues a session cookie scoped to `.furlogs.reno-is.dev`.
6. All subsequent API requests include the cookie automatically via `withCredentials: true`.
7. Axios reads `XSRF-TOKEN` and sends it as `X-XSRF-TOKEN` via `withXSRFToken: true`.

### 5.2 Session configuration

| Setting | Value |
|---|---|
| `SESSION_DRIVER` | `database` |
| `SESSION_LIFETIME` | 10080 (7 days) |
| `SESSION_DOMAIN` | `.furlogs.reno-is.dev` |
| Remember me | Yes, extends to 30 days |

### 5.3 Password policy

- Minimum 8 characters, at least one uppercase letter, one number.
- Breached password check via `Password::defaults()` with `uncompromised()`.
- Account lockout after 5 failed attempts (15-minute cooldown).
- Bcrypt cost factor: 12.

### 5.4 Rate limiting

| Endpoint | Limit |
|---|---|
| `POST /login` | 5 requests/minute |
| `POST /register` | 5 requests/minute |
| `POST /forgot-password` | 3 requests/minute |
| All other API routes | 60 requests/minute |

### 5.5 RBAC — Spatie Permission with teams

Roles are scoped to a household via Spatie's teams feature. `setPermissionsTeamId($householdId)` is called when a user authenticates or switches households.

**Owner permissions**: `pets.create`, `pets.update`, `pets.delete`, `visits.create`, `visits.update`, `visits.delete`, `stock.manage`, `household.settings`, `household.invite`, `members.remove`

**Member permissions**: `pets.create`, `pets.update`, `visits.create`, `visits.update`, `visits.delete`, `stock.manage`

### 5.6 Household management

- Users can belong to multiple households and switch between them via `PUT /user/switch-household`.
- `current_household_id` on the `users` table tracks the active household.
- Invitations use signed, time-limited URLs (48-hour expiry via `URL::temporarySignedRoute`).
- Maximum pending invitations per household: 10.
- Only owners can invite or remove members.
- Members can leave a household voluntarily.
- Pets cannot be transferred between households.
- Owners cannot transfer ownership in v1.

### 5.7 Session expiry handling

When a session expires mid-form, the frontend shows a toast notification, redirects to login, and preserves form data in `sessionStorage` for restoration after re-login.

---

## 6. API design

### 6.1 JSON:API compliance

All responses follow the JSON:API spec. Every response includes `type`, `id`, `attributes`, and optional `relationships` and `included` members. Error responses follow the JSON:API error format:

```json
{
  "errors": [{
    "status": "422",
    "title": "Validation Error",
    "detail": "The name field is required.",
    "source": { "pointer": "/data/attributes/name" }
  }]
}
```

### 6.2 Route style

Mixed approach — nested routes for tight parent-child relationships, flat routes with filters for standalone queries.

**Nested routes** (child has no meaning without parent):

```
POST   /pets/{pet}/weights
GET    /pets/{pet}/weights
POST   /vet-visits/{visit}/attachments
POST   /households/{household}/invites
```

**Flat routes with filters** (queried independently):

```
GET    /pets
POST   /pets
GET    /pets/{pet}
PATCH  /pets/{pet}
DELETE /pets/{pet}

GET    /vet-visits?filter[pet]=1&filter[type]=checkup
POST   /vet-visits
GET    /vet-visits/{visit}
PATCH  /vet-visits/{visit}
DELETE /vet-visits/{visit}

GET    /vaccinations?filter[pet]=1
POST   /vaccinations
GET    /food-products
POST   /food-products
GET    /food-stock-items?filter[status]=open
POST   /food-stock-items
PATCH  /food-stock-items/{item}

GET    /reminders?filter[status]=pending
POST   /reminders
PATCH  /reminders/{reminder}

GET    /notifications?filter[read]=false
POST   /notifications/mark-read        (bulk)
PATCH  /notifications/{notification}

GET    /vet-clinics
POST   /vet-clinics
```

**Standalone endpoints**:

```
GET    /sanctum/csrf-cookie
POST   /login
POST   /register
POST   /logout
POST   /forgot-password
POST   /reset-password
POST   /email/verification-notification
GET    /user
PUT    /user/switch-household
GET    /dashboard/summary
GET    /food-stock/projections
```

### 6.3 Pagination

Page-based by default (fits JSON:API), cursor-based available for specific use cases. Default page size: 20 items. Max page size: 100.

```
GET /vet-visits?page[number]=2&page[size]=20
```

### 6.4 Filtering

ILIKE queries for text search, exact match for enums and IDs:

```
GET /pets?filter[species]=dog&filter[search]=ban
GET /vet-visits?filter[pet]=1&filter[type]=checkup&filter[search]=dental
GET /food-stock-items?filter[status]=open
```

### 6.5 Sorting

Default sort orders per resource:

| Resource | Default sort |
|---|---|
| Pets | Alphabetical by name |
| Vet visits | Newest first (`-visit_date`) |
| Vaccinations | Newest first (`-administered_date`) |
| Food stock items | Critical first (`status` priority), then name |
| Notifications | Newest first (`-created_at`) |
| Reminders | Due date ascending (`due_date`) |

Custom sort via `?sort=-visit_date,pet_id`.

### 6.6 Sparse fieldsets & includes

```
GET /pets?fields[pets]=name,species,avatarUrl
GET /pets/1?include=weights,vetVisits
GET /vet-visits/5?include=attachments,medications
```

### 6.7 Bulk actions

- `POST /notifications/mark-read` — accepts array of notification IDs.
- `DELETE /vet-visits/bulk` — accepts array of visit IDs (owner only).

### 6.8 API documentation

Auto-generated via Scramble. Available at `/api/docs` in non-production environments.

### 6.9 API versioning

No versioning for v1. Routes are under `/api/` without a version prefix. Version prefix will be added if/when breaking changes are needed.

---

## 7. Core modules

### 7.1 Pet profiles

The foundational entity. Every pet belongs to a household and links to vet visits, vaccinations, medications, weights, and food consumption rates.

**Features:**
- CRUD with avatar upload (species silhouette icon as placeholder when no photo).
- Weight tracking over time with line chart visualization (Recharts).
- Pet detail page showing health timeline, current weight, status badges.
- Pet card grid on dashboard with filter toggle.

**Avatar handling via Spatie Media Library:**
- Collection: `avatar` (single file, images only).
- Conversions: `thumb` (150×150 crop), `card` (400×400 fit), auto WebP.
- Originals resized to max 2000px on upload.
- EXIF data stripped on upload.
- Stored on public Laravel Cloud bucket.

### 7.2 Vet visit tracking

Full medical record keeping with timeline view and file attachments.

**Features:**
- CRUD with multi-file attachment upload (max 5 files per batch).
- List view and timeline view toggle.
- Detail panel with diagnosis, treatment, vet notes, attachments, cost.
- Visit type badges: checkup (blue), treatment (yellow), vaccine (green), emergency (red).
- Linked medications (prescribed during a visit).
- Follow-up date tracking with automatic reminder generation.
- Bulk delete for owners.
- Multi-step wizard form (clinic → details → diagnosis/treatment → attachments → review).
- Export: JSON format.

**Attachment handling via Spatie Media Library:**
- Collection: `attachments` (multiple files).
- Accepted types: JPEG, PNG, WebP, PDF.
- Max per file: 10MB. Max per visit: 50MB total.
- Stored on private Laravel Cloud bucket.
- Frontend downloads via temporary signed URLs.
- Upload progress bar via Axios `onUploadProgress`.
- Inline cleanup on failure (try/catch).

### 7.3 Vaccinations & medications

**Vaccinations:**
- Track vaccine name, date administered, next due date, clinic, vet, batch number.
- `VaccinationObserver` auto-generates a reminder for `next_due_date`.
- Calendar integration — due dates show as color-coded dots.

**Medications:**
- Linked to the prescribing vet visit (optional).
- Track name, dosage, frequency, start/end dates.
- `MedicationObserver` generates reminders based on schedule.
- Recurring reminders for ongoing medications.

### 7.4 Food stock management

The combo approach: inventory count + estimated consumption projection.

#### 7.4.1 Layer 1 — Inventory count

Users log purchases (product, brand, quantity, cost, source, date). Each purchase creates a `food_stock_item` with status `sealed`. When opened, status changes to `open`. When finished, status changes to `finished`.

#### 7.4.2 Layer 2 — Consumption projection

For open items, per-pet daily consumption rates drive the projection engine.

**Core formula:**

```
total_daily_rate = SUM(food_consumption_rates WHERE food_product_id = X)
remaining_grams = bag_weight_grams - (days_since_opened × total_daily_rate)
days_remaining = remaining_grams / total_daily_rate
runs_out_date = today + days_remaining
```

**Stock status thresholds** (configurable per product via `alert_threshold_pct`, default 25%):
- **Good**: remaining > threshold (green)
- **Low**: remaining ≤ threshold but > 10% (yellow, triggers notification)
- **Critical**: remaining ≤ 10% (red, triggers urgent notification)

#### 7.4.3 Trigger points

- **On-demand**: `FoodStockService::calculateProjection()` runs on page load. Simple computation, no caching needed.
- **Daily scheduled job**: `stock:check-alerts` at 8am. Scans open items, calculates projections, dispatches notifications when thresholds are crossed.
- **On bag completion**: `FoodStockItemObserver` fires when status changes to `finished`. Creates a `FoodConsumptionLog` comparing estimated vs actual.

#### 7.4.4 Smart rate adjustment (stretch)

After 3+ completed bags for the same product, the system averages `actual_daily_rate` from the last 3 logs. If deviation exceeds 15% from configured rate, surfaces a suggestion in the UI.

#### 7.4.5 Countable items

For cans, packs, treats: daily consumption count (e.g., "1 can/day") replaces weight-based calculation. Same projection formula applies with counts instead of grams.

### 7.5 Notifications & reminders

#### 7.5.1 Reminder system

Reminders are stored in the `reminders` table with polymorphic `source_id`/`source_type` linking back to the triggering entity (vaccination, medication, food product).

**Auto-generated by observers:**
- `VaccinationObserver` → reminder for `next_due_date`
- `MedicationObserver` → reminders based on frequency/schedule

**Recurring reminders:**
- `is_recurring: true` + `recurrence_days: 90` for deworming, flea treatment, etc.
- After dispatch, the scheduled command advances `due_date` by `recurrence_days`.

#### 7.5.2 Notification classes

| Notification | Trigger | Channels |
|---|---|---|
| `UpcomingVaccinationNotification` | Vaccine due within 7 days | database + mail |
| `MedicationReminderNotification` | Medication due within 3 days | database + mail |
| `LowStockNotification` | Stock drops below threshold | database + mail |
| `CriticalStockNotification` | Stock drops below 10% | database + mail |
| `VetVisitFollowUpNotification` | Follow-up date approaching | database + mail |
| `HouseholdInviteNotification` | Owner sends an invite | mail only |

#### 7.5.3 Scheduled commands

| Command | Schedule | Purpose |
|---|---|---|
| `stock:check-alerts` | Daily 8am | Scan open stock, dispatch notifications |
| `reminders:dispatch` | Daily 8am | Check due reminders, dispatch notifications |

#### 7.5.4 Frontend notification UX

- Bell icon with unread count badge.
- Dropdown panel with notification list and mark-as-read.
- Polling via TanStack Query `refetchInterval: 60_000` (1 minute).
- Bulk mark-read action.

#### 7.5.5 Email templates

Laravel Markdown mail templates with FurLog branding (logo, dark theme colors). From address: `noreply@furlogs.reno-is.dev` via Resend.

### 7.6 Dashboard

Unified view pulling data from all modules.

**Widgets:**
- Pet card grid with filter toggle (Zustand-backed).
- Stat cards: upcoming reminders count, food stock status, vet visits this year, monthly spend.
- Upcoming reminders panel with urgency dots (red/yellow/green).
- Mini calendar with event dots (FullCalendar month view).
- Food stock status bars with "days left" estimates.
- Recent vet visits with cost.
- Quick action buttons: log visit, add purchase, record weight, set reminder.

**API:** Single `GET /dashboard/summary` endpoint aggregating data with eager loading and optimized queries.

**Pet filter toggle:** Defaults to "All pets". Clicking a pet card activates the filter and scopes all dashboard widgets to that pet. Toggle in top bar switches between filtered and all.

### 7.7 Calendar

Dedicated full-page calendar (FullCalendar) with month, week, and day views.

**Events displayed:**
- Vet visits (blue)
- Vaccination due dates (red)
- Medication reminders (yellow)
- Food stock alerts (orange)

Events are clickable, navigating to the relevant detail page.

### 7.8 Spending

Monthly and yearly spending breakdown per pet, per category (vet vs food).

**Features:**
- Bar charts for monthly spending trends (Recharts).
- Per-pet breakdown.
- Date range filtering.
- Spending summary cards (total, average per visit, average per month).

### 7.9 Weight history

Line chart showing weight over time per pet (Recharts). Multi-pet overlay for comparison. Linked from pet detail page and accessible as a dedicated page.

---

## 8. Frontend architecture

### 8.1 Folder structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth route group (no layout chrome)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/              # Authenticated route group
│   │   ├── layout.tsx            # Sidebar + topbar shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── pets/
│   │   ├── vet-visits/
│   │   ├── vaccinations/page.tsx
│   │   ├── food-stock/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── spending/page.tsx
│   │   ├── weight-history/page.tsx
│   │   └── settings/
│   └── layout.tsx                # Root layout (providers)
├── components/
│   ├── ui/                       # Generic reusable primitives
│   ├── pets/                     # Pet domain components
│   ├── vet-visits/               # Vet visit domain components
│   ├── food-stock/               # Food stock domain components
│   ├── reminders/
│   ├── notifications/
│   ├── calendar/
│   └── onboarding/               # Setup wizard components
├── hooks/
│   ├── api/                      # TanStack Query hooks by domain
│   └── (utility hooks)
├── lib/
│   ├── api/                      # Axios client, endpoints, types
│   ├── validation/               # Zod schemas per domain
│   └── utils/                    # Formatters, constants, helpers
├── stores/                       # Zustand stores
├── theme/                        # MUI theme config
├── providers/                    # React providers
└── types/                        # TypeScript interfaces
```

### 8.2 Component architecture

**Container components** in `app/` pages: fetch data via TanStack Query hooks, orchestrate layout, pass data to presentational components. No complex markup.

**Presentational components** in `components/`: receive data via props, no side effects, no API calls. Reusable and testable in isolation.

**Shared UI primitives** in `components/ui/`: `DataTable`, `StatCard`, `StatusBadge`, `ConfirmDialog`, `FileUploader`, `EmptyState`. Domain-agnostic.

**Rules:**
- No API calls inside `components/`. Only in `app/` pages or custom hooks.
- One component per file.
- Skeleton loading states alongside their component (`PetCard.tsx` + `PetCardSkeleton.tsx`).

### 8.3 File naming conventions

- Components: PascalCase (`PetCard.tsx`), named exports.
- Hooks: camelCase, `use` prefix (`usePets.ts`).
- Zod schemas: kebab-case (`pet.schema.ts`).
- Types: PascalCase, suffixed by intent (`Pet`, `PetFormValues`, `PetResource`, `CreatePetPayload`).
- No barrel files (`index.ts` re-exports).

### 8.4 TanStack Query patterns

Query keys use a factory pattern:

```ts
export const queryKeys = {
  pets: {
    all: ['pets'] as const,
    lists: () => [...queryKeys.pets.all, 'list'] as const,
    list: (filters) => [...queryKeys.pets.lists(), filters] as const,
    detail: (id) => [...queryKeys.pets.all, 'detail', id] as const,
  },
  // ...same for all domains
};
```

**Stale times:**
- Slow-changing data (pets, clinics): 5 minutes.
- Fast-changing data (notifications, projections): 1 minute.
- Notifications: `refetchInterval: 60_000` for polling.

**Mutations** always invalidate relevant query keys on success. Prefetch pet detail on hover for instant navigation.

### 8.5 Zustand stores

| Store | State |
|---|---|
| `useAuthStore` | Current user, auth status, logout action |
| `useHouseholdStore` | Active household, pet filter, pet selection |
| `useSidebarStore` | Collapsed state, active nav item |
| `useNotificationStore` | Unread count (synced from TanStack Query), bell open state |

**Rules:** Never store server data in Zustand. Actions grouped in an `actions` object. No `localStorage` persistence.

### 8.6 Axios client

```ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
});
```

CSRF cookie fetched before login/register via `api.auth.csrfCookie()`. Response interceptor handles 401 (redirect to login), 422 (map to form errors), 429 (rate limit toast). File uploads use `multipart/form-data` and skip the JSON:API content type header.

### 8.7 Forms

React Hook Form + Zod schemas per domain. Zod is the single source of truth for validation. `zodResolver` bridges RHF and Zod. Server-side 422 errors mapped back to form fields via `setError`. Vet visit form uses a multi-step wizard. All other forms are single-page with on-submit validation.

### 8.8 Theme

MUI ThemeProvider with dark default (user-switchable). Custom palette with warm amber accent. Component overrides for cards (12px radius, subtle border), buttons (8px radius, no uppercase), tables (bottom border only). Never hardcode colors — always reference `theme.palette.*`.

### 8.9 Responsive design

- Desktop: sidebar navigation (200px, collapsible to icon-only).
- Mobile: bottom navigation bar with 5 key items (Dashboard, Pets, Vet, Stock, More).
- MUI breakpoints: `xs`, `sm`, `md`, `lg`, `xl`.
- Touch targets: 48px minimum per Material Design.

### 8.10 Navigation

- Active page highlight in sidebar.
- Breadcrumbs on detail pages (Dashboard → Pets → Bantay).
- Back button on detail pages.
- Page transition animations via Next.js 16 View Transitions API.

### 8.11 Next.js 16 specifics

- `proxy.ts` for auth redirects only (unauthenticated users → `/login`).
- React Compiler enabled (`reactCompiler: true` in `next.config.ts`).
- Turbopack defaults (no custom config).
- `AGENTS.md` created for AI-assisted development.

---

## 9. Backend architecture

### 9.1 Folder structure

```
app/
├── Http/
│   ├── Controllers/              # Thin, RESTful controllers
│   ├── Requests/                 # FormRequest validation (by domain)
│   ├── Resources/                # JSON:API resource transformers
│   └── Middleware/
├── Services/                     # Business logic layer
├── Actions/                      # Single-purpose action classes
├── Models/                       # Eloquent models
├── Policies/                     # Authorization policies
├── Observers/                    # Model event observers
├── Notifications/                # Notification classes
├── Console/Commands/             # Artisan commands
├── Traits/                       # BelongsToHousehold, HasAuditLog
├── Scopes/                       # HouseholdScope
├── DTOs/                         # Data Transfer Objects
├── Enums/                        # PHP 8.1 backed enums
└── Exceptions/                   # Custom exception classes
```

### 9.2 Naming conventions

| Concept | Pattern | Example |
|---|---|---|
| Controller | Singular + `Controller` | `PetController` |
| Invokable controller | Verb + Noun + `Controller` | `MarkFoodStockItemFinishedController` |
| Service | Singular + `Service` | `FoodStockService` |
| Action | Verb + Noun | `CalculateProjection`, `SendInvite` |
| DTO | Name + `DTO` | `FoodProjectionDTO` |
| FormRequest | `Store`/`Update` + Resource + `Request` | `StorePetRequest` |
| Resource | Resource + `Resource` | `PetResource` |
| Policy | Resource + `Policy` | `PetPolicy` |
| Enum | Singular PascalCase | `VisitType`, `StockStatus` |

### 9.3 Service vs action

Services contain domain-scoped business logic with multiple methods (`PetService::create()`, `PetService::updateWeight()`). Actions are single-purpose classes with `__invoke` for complex standalone operations (`CalculateProjection`, `LogBagCompletion`). Services may call actions internally.

### 9.4 Request validation

Every mutating endpoint uses a FormRequest. Validation rules are never in controllers. `authorize()` checks the relevant policy. File uploads validated with strict MIME type checking server-side.

### 9.5 Eloquent conventions

- `$fillable` on all models. Never `$guarded = []`.
- `$casts` for all dates, enums, and booleans.
- `BelongsToHousehold` trait on all household-scoped models (auto-applies `HouseholdScope`, auto-sets `household_id` on creation).
- Named scopes for common queries (`scopeOpen`, `scopeCritical`, `scopeSpecies`).
- Accessors for computed properties (`age`, `daysSinceOpened`).
- Eager loading via `$with` only for always-needed relationships. Explicit loading everywhere else.
- No business logic in models.

### 9.6 Error handling

Custom exception handler renders all errors as JSON:API-compliant objects. Custom exceptions carry their own status code and safe message. Never expose stack traces, SQL, or internal paths in production.

### 9.7 Audit logging

Activity logging on key models (pet CRUD, vet visits, household membership changes). Records `user_id`, `action`, `model_type`, `model_id`, `old_values`, `new_values`, `timestamp`.

---

## 10. Security

### 10.1 Critical controls

| Control | Implementation |
|---|---|
| Multi-tenancy isolation | `HouseholdScope` global scope on all models |
| Input sanitization | `strip_tags()` on all free-text fields server-side |
| XSS prevention | React JSX auto-escaping, never `dangerouslySetInnerHTML` |
| CSRF protection | Sanctum CSRF token flow |
| Rate limiting | Throttle middleware on all routes |
| File upload validation | Server-side MIME check, content validation, size limits, EXIF stripping |
| Password security | Bcrypt cost 12, complexity rules, breach check, account lockout |
| Auth session | Database driver, 7-day lifetime, signed cookies |

### 10.2 Security headers

Laravel Cloud handles edge-level security (DDoS, WAF on Business plan). Frontend CSP configured via Vercel response headers. Backend includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 10.3 CORS configuration

```php
'allowed_origins' => [env('FRONTEND_URL', 'https://furlogs.reno-is.dev')],
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
'allowed_headers' => ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'Accept'],
'supports_credentials' => true,
```

Development environment adds `localhost:3000` to allowed origins via env variable.

### 10.4 Invitation security

- Signed, time-limited URLs (48-hour expiry).
- Max 10 pending invitations per household.
- Validate invited email isn't already a member.
- Only owners can invite (policy-enforced).

### 10.5 Double-submit prevention

Frontend: disable submit button during request. Backend: unique constraints where applicable (e.g., one open stock item per product, unique email on users).

---

## 11. UX patterns

### 11.1 Onboarding

Guided wizard after first login: Create household → Add first pet → Done. Runs once, stores completion flag.

### 11.2 Loading states

| Context | Pattern |
|---|---|
| Page loads | Skeleton components |
| Button submissions | Spinner inside button, button disabled |
| File uploads | Progress bar via Axios `onUploadProgress` |
| Instant actions (mark read, toggle) | Optimistic updates |

### 11.3 Feedback

Sonner toast library for all action confirmations. Promise toasts for mutations (loading → success/error). Auto-dismiss after 4 seconds.

### 11.4 Destructive actions

Confirm dialog required for: delete pet, delete vet visit, remove household member, mark food bag as finished. No confirmation for: edit, create, toggle, mark notification as read.

### 11.5 Empty states

Every list page has a branded empty state with illustration and CTA: "No pets yet — add your first pet", "No vet visits recorded — log your first visit".

### 11.6 Error pages

Custom branded 404, 403, and 500 pages consistent with FurLog's dark theme. Friendly messaging with navigation back to dashboard.

### 11.7 Accessibility

WCAG AA compliance. Keyboard navigation through all flows. Screen reader support via MUI's built-in ARIA attributes. Color contrast verified for dark mode. Colorblind-friendly chart colors in Recharts.

### 11.8 Avatar placeholders

Species silhouette icon (dog outline, cat outline) with a colored background when no pet photo is uploaded.

---

## 12. Infrastructure & deployment

### 12.1 Hosting

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel (free tier) | `furlogs.reno-is.dev` |
| Backend | Laravel Cloud (Starter) | `api.furlogs.reno-is.dev` |
| Database | Serverless Postgres (Neon via Laravel Cloud) | Managed |
| Public files | Laravel Cloud Object Storage (bucket 1) | Avatars |
| Private files | Laravel Cloud Object Storage (bucket 2) | Documents |

### 12.2 Deployment

- **Backend**: Laravel Cloud built-in push-to-deploy from GitHub `main` branch. Migrations auto-run on deploy.
- **Frontend**: Vercel auto-deploys from GitHub `main` branch.
- **CI/CD**: GitHub Actions for basic lint/test checks. Laravel Cloud handles deployment pipeline.

### 12.3 Environment variables

Backend `.env` managed via Laravel Cloud dashboard (secrets never in repo). Frontend `.env.local` uses `NEXT_PUBLIC_` prefix for browser-exposed values only. `.env.example` files maintained in both directories.

### 12.4 Queue

- Driver: `sync` (development), `database` (production).
- Failed jobs: 3 retries with exponential backoff, logged to `failed_jobs` table.
- Queued jobs: email notifications, stock alert checks, consumption recalculations.

### 12.5 Scheduled tasks

| Command | Schedule |
|---|---|
| `stock:check-alerts` | Daily 8am |
| `reminders:dispatch` | Daily 8am |

### 12.6 Monitoring

- Frontend: Vercel Analytics (free tier).
- Backend: Laravel Cloud built-in monitoring (compute, database, bandwidth).
- Error tracking: Not included in v1.

### 12.7 Branding assets

- Custom favicon and logo (designed during build).
- Open Graph meta tags for link sharing.
- PWA manifest for "Add to Home Screen" support.

### 12.8 Timezone

Application timezone: `Asia/Manila`. All timestamps stored in Manila time. `timezone` column on users table defaults to `Asia/Manila` for future multi-timezone support.

---

## 13. Coding standards

### 13.1 Frontend — Biome

Single config (`biome.json`) handling linting and formatting. No `any` types — use `unknown` + narrowing. `useConst` enforced. Unused imports/variables are errors. Single quotes, semicolons, trailing commas.

### 13.2 Frontend — TypeScript

Strict mode enabled. Prefer `interface` over `type` for object shapes. Consistent import ordering: React → third-party → project absolute → relative.

### 13.3 Backend — Laravel Pint

Laravel preset with `declare_strict_types: true`, `ordered_imports`, `no_unused_imports`. Every PHP file starts with `declare(strict_types=1)`.

### 13.4 Backend — PHPStan

Level 6 minimum (level 7+ aspirational in Phase 7). Runs in CI pipeline, not in pre-commit (too slow).

### 13.5 Git workflow

GitHub Flow: `main` (protected) + `feature/*`, `fix/*`, `chore/*` branches. Squash merge to keep history clean.

### 13.6 Commit conventions

Conventional Commits enforced via commitlint:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.
Scopes: `pets`, `vet-visits`, `stock`, `auth`, `api`, `ui`, `db`, `config`, `reminders`, `notifications`, `household`, `calendar`, `spending`, `deps`.

### 13.7 Pre-commit hooks (Husky)

| Hook | Action |
|---|---|
| `pre-commit` | lint-staged: Biome on frontend files, Pint on backend files |
| `commit-msg` | commitlint validates conventional commit format |

### 13.8 Documentation

- PHPDoc on all service and action classes.
- JSDoc/TSDoc on exported functions and hooks.
- README files at root, `/frontend`, `/backend`.
- `CLAUDE.md` files at root, `/frontend`, `/backend` for Claude Code context. Each must include the MCP strict-usage directive (see section 2.4).
- `AGENTS.md` at root for Next.js 16.2 AI agent support.
- Inline comments only for "why", never "what". Exception: regex and complex SQL.

### 13.9 Logging

Backend: Laravel `stack` channel (daily file + stderr). Structured context arrays, never string interpolation. Never log passwords, tokens, or personal data. Log levels: `error` (failures), `warning` (recoverable), `info` (business events), `debug` (dev only).

Frontend: Console logs stripped in production. API errors logged in development only.

### 13.10 Dependency updates

Manual updates. No Dependabot/Renovate for v1. Both `composer.lock` and `package-lock.json` committed.

### 13.11 Feature flags

None. Deploy phases are the gates for feature availability.

---

## 14. Testing strategy

### 14.1 Backend — Pest PHP

**Factories** for all 16 models with realistic fake data.

**Demo seeder** command (`php artisan db:seed --class=DemoSeeder`) populating 3 pets, vet visits, stock items, reminders for development and portfolio demos.

**Test coverage targets:**
- Phase 7 target: 80%+ backend coverage.
- Every service method and action has unit tests.
- Every API endpoint has feature tests.
- Policy authorization tested for both owner and member roles.

**Key test areas:**
- Auth flows (register, login, logout, email verification, password reset).
- RBAC (owner vs member permissions per resource).
- Household scoping (verify users can't access other households' data).
- Food stock projection calculations.
- Notification dispatch logic.
- File upload validation (type, size, MIME checking).

### 14.2 Frontend

Key user flows tested manually during each phase. Automated testing deferred to Phase 7 hardening (React Testing Library for critical components).

### 14.3 Production seeding

Only permission roles and default data seeded in production (via `php artisan db:seed --class=ProductionSeeder`). No demo data in production.

---

## 15. Performance targets

| Metric | Target |
|---|---|
| API response time | < 200ms average |
| Database query time | < 50ms per request |
| Time to Interactive (TTI) | < 3 seconds on 4G |

Measured via Laravel Telescope (backend) and Vercel Analytics (frontend). N+1 queries eliminated via eager loading. Database indexes on key query paths (see section 4.17).

---

## 16. Build phases

### Phase 0: Foundation (Week 1-2, ~10 hrs)

*Partially complete — monorepo, Laravel cleanup, Biome, Sanctum installed.*

**Remaining:**
- Initialize Next.js 16 in `/frontend`
- Husky + lint-staged + commitlint
- `CLAUDE.md`, `AGENTS.md`, and `.mcp.json` files (MUI, Next.js, Laravel Boost MCPs configured with strict-usage directives)
- MUI dark theme setup
- `proxy.ts` for auth route protection
- Sanctum SPA cookie flow (CSRF, login, register, logout)
- Email verification flow
- Onboarding wizard (create household → add first pet)
- Migrations: `users` (add `current_household_id`, `timezone`), `households`, `household_members`
- Spatie permissions installed, teams feature configured, roles seeded
- Rate limiting on auth endpoints
- Password validation rules
- Pint + PHPStan configured
- Scramble installed
- CORS configured for `furlogs.reno-is.dev`
- Deploy: both services live, login functional

### Phase 1: Pet profiles (Week 3-4, ~15 hrs)

- Migrations: `pets`, `pet_weights`, `vet_clinics`
- `BelongsToHousehold` trait and `HouseholdScope`
- Spatie Media Library: public bucket, avatar conversions (thumb, card, WebP)
- `PetService`, `PetPolicy`, FormRequests
- Soft deletes, audit logging
- JSON:API resources
- Frontend: pet list (card grid), create/edit form, detail page, weight chart
- Pet filter toggle (Zustand)
- TanStack Query hooks
- Empty states, skeleton loaders
- Pest tests

### Phase 2: Vet visits & vaccinations (Week 5-7, ~20 hrs)

- Migrations: `vet_visits`, `vaccinations`, `medications`
- Spatie Media Library: private bucket for attachments
- `VetVisitService`, `VaccinationService`, observers
- Multi-step wizard form for vet visits
- File upload with progress bar, max 5 per batch, inline cleanup
- List/timeline view toggle, detail panel
- Vaccination tracking with due dates
- Medication linking
- Bulk delete for vet visits (owner only)
- Pest tests

### Phase 3: Food stock management (Week 8-10, ~20 hrs)

- Migrations: `food_products`, `food_stock_items`, `food_consumption_rates`, `food_consumption_logs`
- `FoodStockService`, `CalculateProjection` action, `LogBagCompletion` action
- `FoodStockItemObserver`
- Projection engine with stock status thresholds
- Frontend: stock page with 3 tabs (inventory, active consumption, purchase history)
- Alert bar, consumption cards, progress bars
- Purchase logging, "mark as finished" flow
- Smart rate adjustment suggestions
- Pest tests for projection math

### Phase 4: Notifications & reminders (Week 11-13, ~20 hrs)

- Migrations: `reminders`, `notifications`
- `ReminderService`, scheduled commands
- Notification classes (5 types) with database + mail channels
- Markdown email templates with Resend
- Recurring reminders
- Frontend: notification bell, dropdown, mark-as-read, bulk mark-read
- Reminders list with urgency dots
- Reminder CRUD form
- Sonner toast integration for all mutations across the app
- Pest tests

### Phase 5: Dashboard & calendar (Week 14-15, ~15 hrs)

- Dashboard aggregation API endpoint
- Frontend: full dashboard (stat cards, reminders, stock, visits, calendar)
- Pet filter toggle scoping all widgets
- Mini calendar with event dots
- Full calendar page (FullCalendar, month/week/day)
- Quick action buttons
- Spending summary on dashboard
- Pest tests

### Phase 6: Household management & polish (Week 16-18, ~20 hrs)

- Household invite flow (signed URLs, email notification)
- Household switching
- Settings pages (household, notifications, profile)
- Member management (list, remove, role badges)
- Spending analytics page (Recharts bar/line charts, per-pet breakdown)
- Weight history page (Recharts multi-pet line chart)
- Light theme implementation
- Data export (JSON)
- Responsive design pass (bottom nav on mobile)
- Breadcrumbs, back buttons, View Transitions
- Confirm dialogs for all destructive actions
- Branded error pages (404, 403, 500)
- Favicon, OG tags, PWA manifest
- Pest tests

### Phase 7: Hardening & portfolio readiness (Week 19-20, ~15 hrs)

- Test coverage push: 80%+ backend
- PHPStan bumped to level 7+
- Security audit: all policies, scopes, rate limits, input validation
- Performance pass: N+1 elimination, API response time targets
- Database index optimization
- Vercel Analytics + Laravel Cloud monitoring setup
- Lighthouse audit for accessibility (WCAG AA)
- README overhaul with architecture diagrams, screenshots
- `CLAUDE.md` files updated
- Final production deployment

### Timeline summary

| Phase | Focus | Weeks | Hours |
|---|---|---|---|
| 0 | Foundation & auth | 1-2 | ~10 |
| 1 | Pet profiles | 3-4 | ~15 |
| 2 | Vet visits & vaccinations | 5-7 | ~20 |
| 3 | Food stock management | 8-10 | ~20 |
| 4 | Notifications & reminders | 11-13 | ~20 |
| 5 | Dashboard & calendar | 14-15 | ~15 |
| 6 | Household mgmt & polish | 16-18 | ~20 |
| 7 | Hardening & portfolio | 19-20 | ~15 |
| **Total** | | **20 weeks** | **~135 hrs** |

---

## 17. Appendix

### 17.1 Enums reference

| Enum | Values |
|---|---|
| `Species` | `dog`, `cat` |
| `Sex` | `male`, `female` |
| `PetSize` | `small`, `medium`, `large` |
| `VisitType` | `checkup`, `treatment`, `vaccine`, `emergency` |
| `StockStatus` | `sealed`, `open`, `finished` |
| `FoodType` | `dry`, `wet`, `treat`, `supplement` |
| `UnitType` | `kg`, `can`, `pack`, `piece` |
| `HouseholdRole` | `owner`, `member` |
| `ReminderType` | `vaccination`, `medication`, `vet_appointment`, `food_stock`, `custom` |
| `ReminderStatus` | `pending`, `snoozed`, `completed`, `dismissed` |

### 17.2 Third-party packages

**Backend (Composer):**
- `laravel/sanctum`
- `spatie/laravel-permission`
- `spatie/laravel-medialibrary`
- `laravel/telescope` (dev only)
- `pestphp/pest`
- `larastan/larastan` (PHPStan for Laravel)
- `dedoc/scramble`

**Frontend (npm):**
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- `@mui/x-date-pickers`
- `@tanstack/react-query`
- `zustand`
- `axios`
- `react-hook-form`, `@hookform/resolvers`, `zod`
- `recharts`
- `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`
- `sonner`
- `dayjs` (for MUI DatePicker adapter)

**Root (npm):**
- `husky`
- `lint-staged`
- `@commitlint/cli`, `@commitlint/config-conventional`

### 17.3 MCP servers (Claude Code)

| MCP Server | Domain | Usage |
|---|---|---|
| MUI MCP | Frontend components, theming, props | Strict — must consult before writing any MUI code |
| Next.js MCP | Routing, config, proxy.ts, server components | Strict — must consult for all Next.js 16 patterns |
| Laravel Boost MCP | Controllers, services, Eloquent, packages | Strict — must consult for all Laravel 13 patterns |

**Rule**: MCP responses always take precedence over Claude Code's training data. This is enforced via the `CLAUDE.md` strict-usage directive in every project directory.

### 17.4 Key decisions log

| Decision | Rationale |
|---|---|
| Sanctum cookies over tokens | SPA pattern, automatic CSRF, no token storage concerns |
| Subdomain alignment | Required for cross-origin cookie sharing |
| Service/Action over Repository | Repositories add unnecessary abstraction for 16 tables |
| Global HouseholdScope | Prevents data leakage at model layer, not controller |
| Spatie teams over custom RBAC | Built-in multi-tenant role scoping |
| No cache layer for v1 | Database queries are fast enough at FurLog's scale |
| No feature flags | Deploy phases gate feature availability |
| ILIKE over full-text search | Sufficient for v1 personal use, upgrade path to pg_trgm exists |
| Keep all data forever | Storage is cheap, medical records are important |
| Dark default with light available | Dark matches the product aesthetic, light ensures accessibility |
| MCP strict usage (MUI, Next.js, Laravel Boost) | Ensures Claude Code uses latest framework APIs, not stale training data |

---

*End of document.*
