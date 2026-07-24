# GATE OS — Production Deployment Guide

The production stack is: **Vercel** (Next.js app at `https://gateeee.vercel.app`) + **Supabase** (project `jidzfgpnkmfctiplmraf` — database, auth, storage) + **Resend** (transactional email).

This document is the single checklist to take a fresh clone to a fully working deployment. Everything in it is idempotent — re-running a step never breaks a working setup.

---

## 1. Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production; mirror to Preview if you use preview deploys). After changing env vars, **redeploy**.

| Variable | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jidzfgpnkmfctiplmraf.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Supabase → Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | legacy JWT anon key | Optional fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | **legacy JWT `service_role` key** (Supabase → Settings → API → *Legacy API keys* → `service_role`) | **Server-only. Never expose.** ⚠️ Use the legacy JWT, **not** the `sb_secret_…` key — this project's GoTrue and PostgREST reject `sb_secret_…` with *"Invalid API key"*, which silently breaks email sign-up, admin invites, account deletion, and cron. |
| `GATE_OS_INVITE_COOKIE_SECRET` | 32+ char random string | Signs beta-invite cookies |
| `ADMIN_EMAIL` | the owner email | Gates `/admin` invite minting |
| `NEXT_PUBLIC_APP_URL` | `https://gateeee.vercel.app` | **Must be the real production origin** — circle-invite links, sitemap, and OG URLs are built from it. Never leave it as `http://localhost:3000` in production. |
| `RESEND_API_KEY` | `re_…` | Resend → API Keys |
| `RESEND_FROM_EMAIL` | `GATE OS <gateos@unhold.live>` | Must be an address on a **verified** Resend domain. Weekly summaries are silently skipped while empty. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key | Enables the push-notification opt-in UI |
| `VAPID_PRIVATE_KEY` | VAPID private key | Keep paired with the public key |
| `CRON_SECRET` | random string | Vercel Cron automatically sends it as `Authorization: Bearer …` to `/api/cron/weekly-summary` |

Generate a fresh VAPID pair any time with `npx web-push generate-vapid-keys` (rotating it invalidates existing browser push subscriptions).

## 2. Supabase — database

Migrations live in `supabase/migrations` and must be applied **in filename order** (SQL Editor → paste → run, or `supabase db push`):

1. `202607180001_public_beta_schema.sql` — schema, RLS, RPCs, `private-notes` storage bucket + storage policies
2. `202607180002_seed_gate_2027_cs_it_catalog.sql` — subjects/topics/exam catalog seed
3. `202607180003_harden_function_access.sql` — moves helpers to `private` schema, re-grants RPCs
4. `202607180004_move_citext_extension.sql`

Verify with `supabase/verification/001_public_beta_schema.sql`. Expected state: ~29 tables, RPCs `validate_beta_invite(p_code)`, `consume_beta_invite(p_invite_id)`, `has_active_beta_access()`, `accept_circle_invite(p_token)`, and storage bucket `private-notes` (50 MB/file, `application/pdf` only, per-user folder RLS).

## 3. Supabase — Auth configuration (dashboard)

**Authentication → URL Configuration**

- **Site URL:** `https://gateeee.vercel.app`
- **Redirect URLs:** add **each** of these as an explicit entry (Supabase does **not** support `/**` path wildcards — a wildcarded entry will silently fail and Supabase falls back to the Site URL, which is the exact "Google login bounces me to the landing page" bug):
  - `https://gateeee.vercel.app/auth/callback` ← **the production OAuth/magic-link callback. This is the one that fixes Google login.**
  - `https://gateeee.vercel.app/onboarding`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/onboarding`
  - `https://*-vercel.app/auth/callback` ← optional, covers Vercel preview deploys (subdomain wildcards are supported)

When a `redirectTo` passed to `signInWithOAuth` is not on this allowlist, Supabase ignores it and redirects to the Site URL — i.e. the homepage, not `/auth/callback`. Confirm every entry is listed before testing Google login.

**Authentication → Sign In / Providers**

- **Email**: enabled. Sign-up is **email + password**, and accounts are confirmed server-side (`/api/auth/signup` calls `admin.createUser` with `email_confirm: true`), so there is **no verification email** to wait for and the project's "Confirm email" toggle does not matter. This is deliberate: it removes the whole class of "I never got the code / the link expired" failures.
- **Google**: enabled, with Client ID/Secret from Google Cloud Console. In Google Cloud → Credentials → OAuth client:
  - Authorized redirect URI: `https://jidzfgpnkmfctiplmraf.supabase.co/auth/v1/callback`
  - Authorized JavaScript origins: `https://gateeee.vercel.app`

**Authentication → Emails (templates)** — *not required for login*

Login is password-based and Google OAuth, so no code/magic-link email is sent at sign-in. Email templates only matter if you later add **password reset** (`resetPasswordForEmail`), which needs working SMTP (below).

**Authentication → SMTP (custom SMTP via Resend)** — *only needed for password reset and weekly summaries*

Sign-up and sign-in do **not** send email, so SMTP is not required for login. It is needed if you enable password reset or the weekly-summary cron. To configure:

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: your `RESEND_API_KEY`
- Sender email: `gateos@unhold.live` (any address on your verified Resend domain)
- Sender name: `GATE OS`

## 4. Resend

- Verify a sending domain (Resend → Domains). Current verified domain: `unhold.live`.
- `RESEND_FROM_EMAIL` must use that domain, e.g. `GATE OS <gateos@unhold.live>`.

## 5. Cron

`vercel.json` already schedules `GET /api/cron/weekly-summary` every **Monday 03:30 UTC** (09:00 IST). It requires `CRON_SECRET` to be set; Vercel Cron attaches it automatically. The route no-ops with `{skipped: true}` if the email env is incomplete.

## 6. First-run bootstrap

1. Deploy, then sign in at `/login` with the `ADMIN_EMAIL` account (Google or email code).
2. Open `/admin` and mint invite codes (each code: label + max uses, 21-day expiry).
3. Share codes. New members: landing page → **Enter invite code** → sign in with Google or email → onboarding → workspace.

## 7. Post-deploy smoke test

- [ ] `/` renders
- [ ] `/login` → **Create account** → email + password → lands in onboarding, no verification email needed
- [ ] `/login` → **Sign in** → same email + password → returns to `/app`; a wrong password is rejected
- [ ] Google sign-in completes and returns to `gateeee.vercel.app` (never localhost)
- [ ] New account → onboarding saves the name → welcome greets by name → `/app` loads, dashboard greets by name
- [ ] Vault: upload a PDF (≤50 MB) and open it (signed URL)
- [ ] Settings: enable browser reminders (push permission prompt appears — requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY`)
- [ ] `/api/cron/weekly-summary` with `Authorization: Bearer $CRON_SECRET` returns `{sent, periodKey}`
- [ ] Second user cannot see first user's notes/PDFs/goals (RLS isolation)
