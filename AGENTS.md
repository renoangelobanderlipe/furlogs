# FurLog — AI Agent Guide

## Architecture

Monorepo with two apps:
- `apps/web` — Next.js 16.2.0 (React 19, App Router, Turbopack)
- `apps/server` — Laravel 13 API-only (PHP 8.3+, PostgreSQL, Sanctum)

## Critical: Next.js 16.2 Changes

This is **not** the Next.js your training data covers. Key breaking changes:

- `middleware.ts` → **`proxy.ts`** (function exported as `proxy`, not `middleware`)
- Read `apps/web/node_modules/next/dist/docs/` before writing any Next.js code
- Heed all deprecation notices in the docs

## MCP Servers

Always consult before writing framework code:
- `nextjs` → Next.js 16 routing, proxy, data fetching, components
- `mui` → MUI v7 components, theming, component API
- `laravel-boost` → Laravel 13 docs, database, routes, debugging

## File Locations

```
apps/web/
  proxy.ts              # Auth redirects (replaces middleware.ts)
  theme/                # MUI dark/light theme
  providers/            # ThemeProvider, QueryProvider
  stores/               # useAuthStore, useThemeStore
  lib/api/              # Axios client, endpoints
  lib/validation/       # Zod schemas
  app/(auth)/           # Login, register, verify-email, forgot-password
  app/(dashboard)/      # Protected app pages
  app/(onboarding)/     # Onboarding wizard

apps/server/
  app/Http/Controllers/Auth/   # RegisterController, LoginController, etc.
  app/Http/Requests/           # Form Request validation classes
  app/Models/                  # User, Household, HouseholdMember
  app/Services/                # HouseholdService, PetService
  app/Enums/                   # HouseholdRole
  routes/api.php               # All API routes
  config/cors.php              # CORS (supports_credentials: true)
  config/sanctum.php           # SANCTUM_STATEFUL_DOMAINS
```

## Commit Format

```
feat(auth): add login flow
fix(pets): fix weight conversion
```

Valid scopes: `pets`, `vet-visits`, `stock`, `auth`, `api`, `ui`, `db`, `config`, `reminders`, `notifications`, `household`, `calendar`, `spending`, `deps`
