# AGENTS.md

## Cursor Cloud specific instructions

This is **Almaty Leads**: a Laravel 13 (PHP 8.3) + Inertia.js + React + TypeScript + Vite app
using SQLite. It manages business "leads" for Almaty (CSV/XLSX import, dedup, map view).

### Toolchain (already installed in the environment)
- PHP 8.3 (`php`) with `sqlite3`, `mbstring`, `xml`, `curl`, `zip`, `bcmath`, `intl` extensions, and Composer are installed system-wide.
- Node 22 / npm. The startup update script runs `composer install` and `npm install`.
- The SQLite DB lives at `database/database.sqlite` and is already migrated + seeded. `.env` and `APP_KEY` are already configured.
- Seeded demo login: `admin@almaty.leads` / `password`.

### Running the app (development mode)
Start two processes (the standard scripts are in `package.json` / `composer.json`):
- Backend: `php artisan serve --host=0.0.0.0 --port=8000` (open http://localhost:8000)
- Frontend (HMR): `npm run dev` (Vite). `composer dev` runs the combined dev orchestrator.

### Non-obvious gotcha: Wayfinder-generated modules
`resources/js/routes/*` and `resources/js/actions/*` are **generated** by the Laravel
Wayfinder Vite plugin, not committed as source. On a fresh tree these do not exist yet, so
`npm run types:check` (tsc) and `npm run lint:check` (eslint) fail with
`Cannot find module '@/routes/...'` / import-order errors until they are generated.
Run `npm run dev` or `npm run build` once first to generate them, then the JS checks pass.

### Lint / test / build commands
- Full CI pipeline: `composer ci:check` (eslint + prettier + tsc + pint + phpstan + phpunit).
- Tests: `php artisan test` (55 tests, all passing on a working tree).
- JS: `npm run lint:check`, `npm run format:check`, `npm run types:check`.
- PHP: `./vendor/bin/pint --test` (format), `./vendor/bin/phpstan analyse` (static analysis).
- Note: on the current `main`, `prettier --check`, `pint --test`, and `phpstan` report
  **pre-existing** failures unrelated to environment setup; `eslint`, `tsc`, and `php artisan test` pass.

### Queues / imports / scans
- `QUEUE_CONNECTION=sync` locally, so CSV imports process immediately in-request (no
  `queue:work` needed to test the import flow).
- The 2GIS scan feature (`LEADS_SOURCE_DRIVER=parser2gis`) needs the optional
  `parser-2gis` Python package + a real Google Chrome (CDP). It is not set up here and is
  not required to run/test the core import + map flow.
