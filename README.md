# GATE OS

A private, personalized preparation workspace for GATE CS/IT 2027 aspirants.

## Product

- Invite-gated Google OAuth and six-digit email OTP.
- Three-step onboarding with curated themes and layout preferences.
- Accurate, recovery-safe focus timer.
- Versioned syllabus baseline with topic and PYQ readiness.
- Official-source PYQ desk with private attempt records and reflections.
- Private 500 MB PDF vault with 50 MB per-file limit and PDF.js reader.
- Notes with recovered local drafts, revision queue, mistake book, goals, and dated reflections.
- Private study circles with expiring email-bound invitations.
- Browser reminders, quiet hours, data export, and account deletion.
- RLS-first Supabase schema and private user-ID-prefixed storage.

The catalog intentionally identifies itself as a GATE 2026 official-source baseline pending publication and review of the official GATE 2027 syllabus. It must never be relabeled silently.

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Apply migrations in order from `supabase/migrations`, then create the first invite through `/admin` after setting `ADMIN_EMAIL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Required Environment

See `.env.example`. Browser code receives only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`, and the VAPID public key. Service role, invite-cookie, Resend, cron, and VAPID private secrets remain server-only.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Database verification SQL lives in `supabase/verification`. The product and security specification is `docs/product/gate-os-v1-design.md`.

## Deployment

The complete production checklist (Vercel env vars, Supabase auth/URL/SMTP/email-template configuration, Resend, cron, smoke tests) lives in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Deployment Order

1. Create a new Supabase project; never reuse a personal prototype project.
2. Apply both migrations and run the verification script.
3. Configure Google OAuth and the exact callback URL.
4. Add Vercel environment variables for preview and production separately.
5. Verify a Resend sender domain before enabling cohort email summaries.
6. Run a two-user isolation test before issuing beta invitations.
