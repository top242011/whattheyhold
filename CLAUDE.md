# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatTheyHold is a financial visualization web app that helps retail investors explore ETF/Mutual Fund holdings through interactive world maps, sector breakdowns, and portfolio calculators. It supports two fund data sources: **international funds via yfinance** and **Thai funds via SEC Open Data**.

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
- **yfinance** (international fund data source)
- **SEC Open Data API** (Thai fund data)
- **Supabase** (PostgreSQL database via `supabase-py`)
- Virtual env at `backend/venv/`

### Database (Supabase PostgreSQL)
- Tables: `funds`, `holdings`, `country_weights`, `sector_weights` (yfinance funds)
- Tables: `thai_funds`, `thai_feeder_mappings` (SEC Thai funds)
- Schema: `backend/supabase_schema.sql`
- RLS policies for public read access; 24-hour cache TTL for yfinance data

## Project Structure

```
whattheyhold/
├── frontend/src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (i18n + theme setup)
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Design tokens & Tailwind
│   │   ├── search/page.tsx         # Search page (async SC, passes initialQuery)
│   │   └── fund/[ticker]/
│   │       ├── page.tsx            # Fund dashboard (async Server Component)
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── components/
│   │   ├── layout/                 → Header, Footer, MobileMenu
│   │   ├── home/                   → HeroSection, FeaturesGrid, TrendingFunds, ToolsSection
│   │   ├── dashboard/
│   │   │   ├── FundClientWrapper.tsx      # Client wrapper for yfinance funds
│   │   │   ├── ThaiFundClientWrapper.tsx  # Client wrapper for Thai (SEC) funds
│   │   │   ├── WorldMap.tsx               # Map with 3 views: weight/sector/calculator
│   │   │   ├── SectorTreeMap.tsx
│   │   │   ├── PortfolioCalculator.tsx    # Allocates user amount across top 10 holdings
│   │   │   ├── HoldingsCard.tsx
│   │   │   ├── FundInfoOverlay.tsx
│   │   │   ├── DashboardNav.tsx
│   │   │   └── CompanyLogo.tsx
│   │   ├── SearchPageClient.tsx    # Search UI (debounce, filters, URL sync)
│   │   ├── SearchBar.tsx           # Header search (typeahead)
│   │   ├── CookieConsent.tsx
│   │   ├── AnalyticsProvider.tsx
│   │   └── ui/FundLogo.tsx
│   ├── lib/
│   │   ├── api.ts                  # API client (discriminated union types)
│   │   ├── analytics.ts            # Anonymous analytics client
│   │   ├── sanitize.ts             # Input sanitization utilities
│   │   ├── thai-mapper.ts          # Thai fund name/type mapping helpers
│   │   └── i18n/
│   │       ├── context.tsx         # LocaleProvider + useLocale hook
│   │       ├── index.ts
│   │       └── translations/en.ts, th.ts
│   └── types/fund.ts               # TypeScript interfaces
├── backend/
│   ├── main.py                     # Flask app & all routes
│   ├── models/schemas.py           # Dataclasses
│   ├── services/
│   │   ├── yfinance_service.py     # Data fetching + 3-tier cache
│   │   ├── country_mapper.py       # Ticker → country code (dict lookup)
│   │   ├── db_service.py           # Supabase CRUD for yfinance funds (singleton)
│   │   ├── sec_service.py          # SEC Open Data API client
│   │   ├── sec_db_service.py       # Supabase CRUD for Thai funds (singleton)
│   │   └── analytics_service.py   # Anonymous session + event tracking
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

### Dual Fund Source Architecture
The app has two distinct fund pipelines:

**International funds (yfinance)**
- Route: `/fund/[ticker]` (no extra params)
- Backend: `GET /api/fund/<ticker>` → `yfinance_service` → Supabase cache
- Frontend: `fund/[ticker]/page.tsx` fetches via `getFundData(ticker)`, renders `FundClientWrapper`
- Full data: holdings, country weights, sector weights, price

**Thai funds (SEC Open Data)**
- Route: `/fund/[proj_id]?source=sec` (optional `&feeder=<name>` for feeder fund context)
- Non-feeder funds: `GET /api/thai-fund-info/<ticker>` → top 5 holdings from SEC API, renders `ThaiFundClientWrapper`
- Feeder funds: `GET /api/thai-fund/<proj_id>/holdings` → looks up master fund ticker → fetches master via yfinance → returns full holdings data, renders `FundClientWrapper` with a feeder banner
- Thai feeder funds wrap an international master fund; their holdings are that master fund's holdings

### Frontend Data Flow
- `fund/[ticker]/page.tsx` is an **async Server Component** — calls API directly and passes data as props to client wrappers. Never refetch the same data client-side.
- `search/page.tsx` reads `?q=` from `searchParams` and passes `initialQuery` to `SearchPageClient` (client component that debounces, syncs URL, and filters).
- Client Components (`"use client"`) handle interactivity, local state, animations, and localStorage access.

### WorldMap Views
`WorldMap` supports three tab views controlled by `mapView` state in `FundClientWrapper`:
- `"weight"` — choropleth country weight map
- `"sector"` — `SectorTreeMap` treemap
- `"calculator"` — `PortfolioCalculator` (user inputs amount, sees allocation per top 10 holding)

### API Client (`lib/api.ts`)
Uses **discriminated union types** for type-safe, exhaustive error handling — no thrown exceptions:
```typescript
type FundResult =
  | { status: 'ok'; data: FundResponse }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
```
Always match all three cases when consuming `FundResult`.

### Backend Caching (3-tier fallback for yfinance)
1. **Supabase DB** — persisted cache with 24-hour TTL (`is_cache_fresh()`)
2. **In-memory Python dict** — same-session deduplication
3. **Mock data** — fallback when both APIs fail

### Analytics
- `AnalyticsProvider` (client component in root layout) creates an anonymous session on mount using `localStorage` for the anonymous ID
- `analytics.trackEvent(type, data)` in `lib/analytics.ts` POSTs to `/api/analytics/event`
- Backend: `analytics_service.py` stores sessions and events in Supabase

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

## Backend API Routes

| Route | Description |
|-------|-------------|
| `GET /api/fund/<ticker>` | International fund data (yfinance) |
| `GET /api/search?q=&limit=` | Typeahead search (yfinance + Thai combined) |
| `GET /api/search/all?q=&type=&source=&limit=` | Full search page with filters |
| `GET /api/trending?limit=` | Trending funds from DB |
| `GET /api/screen?holding=&min_weight=` | Funds that hold a given ticker |
| `GET /api/thai-fund/<proj_id>` | Thai fund info by SEC proj_id |
| `GET /api/thai-fund-info/<ticker>` | Thai fund info + top 5 holdings |
| `GET /api/thai-fund/<proj_id>/holdings` | Thai feeder fund → master fund holdings |
| `GET /api/thai-funds/feeders` | List all feeder funds with master mappings |
| `POST /api/analytics/session` | Create anonymous analytics session |
| `POST /api/analytics/event` | Track analytics event |

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
- `db_service` and `sec_db_service` instantiated as module-level singletons
- Snake_case for Python, camelCase for JSON API responses
- Type hints throughout

### API Response Format (yfinance funds)
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
