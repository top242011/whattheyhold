# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatTheyHold is a financial visualization web app that helps retail investors explore ETF/Mutual Fund holdings through interactive world maps, sector breakdowns, and detailed holding lists.

**Status**: MVP Phase 1 - Core features implemented

## Tech Stack

### Frontend (`/frontend`)
- **Next.js 16** + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** (utility-first, custom design tokens in `globals.css`)
- **react-simple-maps** + **d3-scale** (interactive world map visualization)
- **framer-motion** (animations)
- **lucide-react** (icons)
- **sonner** (toast notifications)
- **clsx** + **tailwind-merge** for conditional class composition
- Path alias: `@/*` maps to `./src/*`

### Backend (`/backend`)
- **Flask 3.0** (Python) with CORS enabled
- **yfinance** (financial data source)
- **Supabase** (PostgreSQL database via `supabase-py`)
- Virtual env at `backend/venv/`

### Database (Supabase PostgreSQL)
- Tables: `funds`, `holdings`, `country_weights`, `sector_weights`
- Schema: `backend/supabase_schema.sql`
- RLS policies for public read access
- 24-hour cache TTL

## Project Structure

```
whattheyhold/
├── frontend/src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (i18n + theme setup)
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Design tokens & Tailwind
│   │   ├── not-found.tsx
│   │   └── fund/[ticker]/
│   │       ├── page.tsx            # Fund dashboard (async Server Component)
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── components/
│   │   ├── layout/     → Header, Footer, MobileMenu
│   │   ├── home/       → HeroSection, FeaturesGrid
│   │   ├── dashboard/  → WorldMap, HoldingsCard, FundInfoOverlay, DashboardNav, CompanyLogo
│   │   ├── ThemeToggle.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── lib/
│   │   ├── api.ts                  # API client (discriminated union types)
│   │   └── i18n/
│   │       ├── context.tsx         # LocaleProvider + useLocale hook
│   │       ├── index.ts
│   │       └── translations/en.ts, th.ts
│   └── types/fund.ts               # TypeScript interfaces
├── backend/
│   ├── main.py                     # Flask app & routes
│   ├── models/schemas.py           # Dataclasses
│   ├── services/
│   │   ├── yfinance_service.py     # Data fetching + 3-tier cache
│   │   ├── country_mapper.py       # Ticker → country code (dict lookup)
│   │   └── db_service.py           # Supabase CRUD (singleton)
│   └── .env                        # Supabase credentials (DO NOT COMMIT)
└── mockup/                         # HTML design references
```

## Development

### Frontend
```bash
cd frontend && npm run dev     # http://localhost:3000
cd frontend && npm run build   # Production build
cd frontend && npm run lint    # ESLint
```

### Backend
```bash
cd backend && source venv/bin/activate && python main.py   # http://127.0.0.1:8000
```

### API Proxy
- `next.config.ts` rewrites `/api/*` → Flask at `http://127.0.0.1:8000`
- Frontend uses `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:3000`)

## Key Architectural Patterns

### Frontend Data Flow
- `fund/[ticker]/page.tsx` is an **async Server Component** — it calls `getFundData(ticker)` directly and passes data as props to client components. Never refetch the same data client-side.
- Client Components (`"use client"`) handle interactivity, local state, animations, and localStorage access.

### API Client (`lib/api.ts`)
Uses **discriminated union types** for type-safe, exhaustive error handling — no thrown exceptions:
```typescript
type FundResult =
  | { status: 'ok'; data: FundResponse }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
```
Always match all three cases when consuming `FundResult`.

### Backend Caching (3-tier fallback)
1. **Supabase DB** — persisted cache with 24-hour TTL (`is_cache_fresh()`)
2. **In-memory Python dict** — same-session deduplication
3. **Mock data** — fallback when both APIs fail

### i18n System
- **Provider**: `LocaleProvider` wraps the root layout
- **Hook**: `useLocale()` → `{ locale, setLocale, t: Translations }`
- **Languages**: English (`en`) and Thai (`th`)
- **Persistence**: localStorage + browser language detection
- Use `t.someKey` for all user-facing strings; use `toLocaleString()` with `locale` for number/date formatting

### State Management
No Redux/Zustand. The app uses:
- **React Context** for theme and locale
- **`useState`** for component-local UI state (tooltips, search, view mode)
- **localStorage** for theme and locale persistence (read via inline script in layout to prevent flash)

## Design System

- **Primary**: `#47b4eb` (light blue)
- **Secondary**: Mint `#b2f2bb`, Lavender `#e0c3fc`
- **Dark mode**: `.dark` class on `<html>`, toggled via localStorage
- **Glass morphism**: `.glass-panel` utility — `backdrop-blur-2xl`, `border-white/50`, `bg-white/75`; dark: `dark:border-white/10`, `dark:bg-slate-900/50`
- **Animations**: Framer Motion — staggered entrance (`initial={{ opacity: 0, x: -20 }}`), animated progress bars
- Design tokens defined as CSS variables in `globals.css` under `@theme inline { ... }`

## Coding Conventions

### Frontend
- Functional React components with TypeScript; props interfaces defined inline above component
- Server Components by default; `"use client"` only when needed
- Tailwind utility classes for styling (no CSS modules)
- Component files: PascalCase, organized by feature: `layout/`, `home/`, `dashboard/`

### Backend
- Python dataclasses for data models; serialize with `asdict()`
- Service layer pattern: business logic in `services/`, routes in `main.py`
- `db_service = DBService()` instantiated as module-level singleton
- Snake_case for Python, camelCase for JSON API responses
- Type hints throughout

### API Response Format
```json
{
  "fund": { "ticker", "name", "price", "currency", "change_pct" },
  "holdings": [{ "ticker", "name", "pct" }],
  "country_weights": [{ "country_code", "weight_pct" }],
  "sector_weights": [{ "sector", "weight_pct" }],
  "last_updated": "ISO 8601"
}
```

## Agent Autonomy Rules

Claude Code operates with **full autonomy** on this project:

### Allowed Without Confirmation
- Read, create, edit, and delete any file in the project
- Run any shell command: install packages, start dev servers, run builds, run lints
- Create and switch git branches, make commits, push to remote
- Install npm packages and pip packages
- Modify configuration files and `.env` files (but never expose secrets in commits)
- Run database migrations and modify Supabase schema

### Decision-Making Guidelines
- Follow the existing tech stack and patterns; do not introduce new frameworks without reason
- Match the established design system (colors, spacing, glass morphism style)
- Prefer editing existing files over creating new ones
- When multiple approaches exist, pick the simplest one that works
- If a task is ambiguous, make a reasonable decision and proceed

### Safety Boundaries
- Never expose API keys, secrets, or `.env` contents in code or commits
- Never delete the `backend/.env` file
- Never push force to `main`/`master` without explicit instruction
