# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Petlog** — Bun workspaces monorepo with two apps:
- `apps/web` (`@petlog/web`) — Next.js 16.2.0 frontend (React 19, TypeScript, App Router)
- `apps/server` — Laravel 13 backend (PHP 8.3, PostgreSQL)

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

## Web App (`apps/web`)

**Stack:** Next.js App Router, React Compiler (via Babel plugin), Biome 2.2, TypeScript 5. Path alias `@/*` maps to `apps/web/`.

> **Important:** This is Next.js 16.2.0 — APIs and conventions may differ from training data. Check `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Server App (`apps/server`)

```bash
# Run from apps/server/ or via root bun run scripts above
composer setup                    # First-time setup (install, key gen, migrate)
php artisan test --compact        # Run tests
php artisan test --filter=name    # Run specific test
vendor/bin/pint --dirty           # Format changed PHP files (run after any PHP edits)
```

**Stack:** Laravel 13 API-only, Eloquent ORM, PostgreSQL, Pest 4, Laravel Pint, Laravel Boost (MCP tools).

API routes live in `routes/api.php` (prefixed `/api`). No views, no Vite, no frontend assets.

### Laravel Conventions

- Use `php artisan make:` for all new files; always pass `--no-interaction`
- Prefer `Model::query()` over `DB::` raw queries
- Use eager loading to avoid N+1 queries
- Validation in Form Request classes, not inline in controllers
- `env()` only in config files; use `config('key')` everywhere else
- After modifying PHP files, run `vendor/bin/pint --dirty --format agent`

### Testing

- Most tests are feature tests: `php artisan make:test --pest {Name}`
- Use model factories in tests; check for existing factory states before manual setup
- Do not delete tests without approval

## Architecture Notes

`apps/server` is **not** a Bun workspace member — it manages its own JS deps (`npm install`) internally via `composer setup` for its Vite/Tailwind asset pipeline. The root `bun.lock` and `node_modules/` only cover `apps/web`.
