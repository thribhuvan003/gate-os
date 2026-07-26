# GATE OS

A private, personalized preparation workspace for GATE CS & IT 2027 aspirants —
focus timer, syllabus tracker, PDF vault, notes, revision queue, mistake book,
goals, and small private study circles, in one calm space.

**Live:** https://gateeee.vercel.app

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, theme-driven CSS custom properties |
| Language | TypeScript (strict) |
| Backend | Supabase — Postgres + Row Level Security, Auth, Storage |
| Editor / docs | TipTap, PDF.js, KaTeX |
| Tests | Vitest (unit), Playwright (e2e + real-browser flows) |
| Hosting | Vercel (frontend) · Supabase (data) |

## Architecture

- **Auth.** Email + password (confirmed server-side, no verification step) and
  Google OAuth. Sign-up is open — no invite gate. The Next.js *proxy*
  (`src/proxy.ts`, the App Router successor to middleware) refreshes the Supabase
  session and guards `/app`, `/onboarding`, `/welcome`.
- **Data is RLS-first.** Every table is scoped by `user_id` with Row Level
  Security, and PDF storage lives under a per-user path prefix with matching
  Storage policies. A user can only ever read or write their own rows and files —
  enforced in the database, not just the app (see `tests/cross-device.mjs`).
- **Component split.** `src/components/os/*-client.tsx` are the "smart" client
  wrappers (data + Supabase calls); `src/components/workspace/*` are the
  presentational components they render. Pages in `src/app/app/*` are server
  components that fetch and pass data down.
- **Theming.** Four themes (Editorial Calm, Focus Tech, Soft Personal, Midnight
  Paper) plus accent / font / density / motion options, all expressed as CSS
  custom properties in `src/app/globals.css`. Selecting a theme applies
  instantly (live preview) and is applied before first paint to avoid a flash.
  Components only ever use theme variables — no hardcoded colors — so every
  screen is correct in all four themes.

## Project structure

```
src/
  app/
    page.tsx            Landing page
    login/              Email+password / Google sign-in
    onboarding/         Three-step first-run setup
    welcome/            Post-onboarding reveal
    app/                Authenticated workspace (dashboard + one route per feature)
    api/                Route handlers (auth signup, onboarding, circles, account, cron…)
    globals.css         Design tokens + component CSS (single source of styling truth)
    proxy.ts            Session refresh + route protection
  components/
    os/                 Smart client wrappers (data/Supabase)
    workspace/          Presentational feature UI
    onboarding/ landing/
  lib/                  Supabase clients, auth helpers
supabase/
  migrations/           Schema, RLS, seed catalog, storage policies (apply in order)
  verification/         Post-deploy DB checks
tests/                  Vitest units + Playwright flows (see below)
docs/                   DEPLOYMENT.md + product/security spec
```

## Local setup

```bash
pnpm install
cp .env.example .env.local     # fill in the Supabase values
pnpm dev                       # http://localhost:3000
```

Apply the migrations in `supabase/migrations/` in filename order to a Supabase
project, then run the checks in `supabase/verification/`.

### Environment

See `.env.example`. Only `NEXT_PUBLIC_*` values reach the browser
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_APP_URL`, VAPID public key). The service-role key, Resend, cron, and
VAPID private secrets are server-only. `SUPABASE_SERVICE_ROLE_KEY` must be the
project's **service_role** key (see `docs/DEPLOYMENT.md`).

## Testing

```bash
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
pnpm test                 # Vitest unit tests
pnpm build                # production build
pnpm test:e2e             # Playwright landing e2e

# Real-browser flows (need a running app + a Supabase test project in .env.local):
node tests/walkthrough.mjs     # sign up → onboarding → every feature renders
node tests/interactions.mjs    # each feature's create/save actually persists
node tests/cross-device.mjs    # cross-device sync + per-user isolation (RLS)
```

## Deployment

The full production checklist — Vercel env vars, Supabase Auth/URL/OAuth/SMTP
configuration, Resend, cron, and smoke tests — is in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Order: create a fresh Supabase
project → apply migrations + run verification → configure Google OAuth with the
exact callback URL → set Vercel env vars (preview and production separately).

The catalog identifies itself as a GATE 2026 official-source baseline pending
review of the official GATE 2027 syllabus; it must never be relabeled silently.
