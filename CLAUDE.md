# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FurLog** — Multi-user pet care management app. Bun workspaces monorepo:
- `apps/web` (`@petlog/web`) — Next.js 16.2.0 frontend (React 19, TypeScript, App Router)
- `apps/server` — Laravel 13 backend (PHP 8.3+, PostgreSQL)

**Domains:**
- Frontend: `furlogs.reno-is.dev` (Vercel)
- API: `api.furlogs.reno-is.dev` (Laravel Cloud)
- Cookie domain: `.furlogs.reno-is.dev`

## Root Commands

**Package manager:** Bun — run all JS commands from the repo root.

```bash
bun install          # Install all workspace deps
bun dev              # Run web + server concurrently
bun run dev:web      # Next.js dev server only
bun run dev:server   # Laravel API server only (serve + queue + pail)
bun run build:web    # Next.js production build
bun run lint:web     # Biome lint (apps/web)
bun run format:web   # Biome format (apps/web)
bun run test:server  # Pest tests
bun run install:server  # composer install for apps/server
```

For Artisan commands, run from `apps/server/`: `php artisan <command>`

## MCP Strict-Usage Directive

**Always consult MCP servers before writing framework-specific code:**
- `nextjs` MCP → before any Next.js 16 patterns (routing, data fetching, proxy, etc.)
- `mui` MCP → before writing any MUI components or theme code
- `laravel-boost` MCP → before any Laravel patterns (routing, auth, migrations, etc.)

See `.mcp.json` for server configs.

## Web App (`apps/web`)

**Stack:** Next.js 16.2.0 App Router, React Compiler (Babel plugin), Biome 2.2, TypeScript 5.

> **Important:** This is Next.js 16.2.0 — `middleware.ts` is deprecated and renamed to `proxy.ts`. Check `apps/web/node_modules/next/dist/docs/` before writing Next.js-specific code.

See `apps/web/CLAUDE.md` for detailed frontend patterns.

## Server App (`apps/server`)

```bash
# Run from apps/server/ or via root bun run scripts
vendor/bin/pint --dirty   # Format changed PHP files (always run after edits)
vendor/bin/phpstan analyse # Static analysis (level 6)
php artisan test --compact # Run tests
```

**Stack:** Laravel 13 API-only, Sanctum 4, PostgreSQL, Pest 4, Pint, PHPStan/Larastan.

See `apps/server/CLAUDE.md` for detailed backend patterns.

## Commit Convention

Conventional commits with required scope:

```
feat(auth): add login flow
fix(pets): correct weight unit conversion
chore(deps): bump MUI to 7.4
```

**Valid scopes:** `pets`, `vet-visits`, `stock`, `auth`, `api`, `ui`, `db`, `config`, `reminders`, `notifications`, `household`, `calendar`, `spending`, `deps`

## Coding Standards

- All PHP files: `declare(strict_types=1);`
- No `$guarded = []` on models — use `$fillable` or `#[Fillable]` attribute
- No `any` types in TypeScript
- **Component exports:** `export const Foo = () =>` — never `export function` for components
- **Page exports:** `export default function PageName()` — Next.js pages/layouts only
- One component per file
