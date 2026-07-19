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
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | **Server-only. Never expose.** |
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

When a `redirectTo` passed to `signInWithOAuth` / `signInWithOtp` is not on this allowlist, Supabase ignores it and redirects to the Site URL — i.e. the homepage, not `/auth/callback`. Confirm every entry is listed before testing login.

**Authentication → Sign In / Providers**

- **Email**: enabled.
- **Google**: enabled, with Client ID/Secret from Google Cloud Console. In Google Cloud → Credentials → OAuth client:
  - Authorized redirect URI: `https://jidzfgpnkmfctiplmraf.supabase.co/auth/v1/callback`
  - Authorized JavaScript origins: `https://gateeee.vercel.app`

**Authentication → Emails (templates)** — *required for the six-digit code login*

The login form asks for a **six-digit code** (`verifyOtp` with `type: "email"`). Supabase's default templates only contain a link, so update **both** templates — **Magic Link** (returning users) and **Confirm signup** (first-time OTP signups) — to include `{{ .Token }}`:

```html
<h2>Your GATE OS sign-in code</h2>
<p>Enter this six-digit code in GATE OS:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:.3em;font-family:monospace;">{{ .Token }}</p>
<p>Prefer one tap? <a href="{{ .ConfirmationURL }}">Sign in with this link</a> — it opens your workspace directly.</p>
<p style="color:#667;">The code expires in one hour. If you didn't request it, you can ignore this email.</p>
```

Both the code and the link work with the app: the code is typed into the login form; the link lands on `/auth/callback` and completes the same session.

**Authentication → SMTP (custom SMTP via Resend)** — *strongly recommended*

Supabase's built-in mailer is limited to ~2 emails/hour and is unreliable for real users. Configure:

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: your `RESEND_API_KEY`
- Sender email: `gateos@unhold.live` (any address on your verified Resend domain)
- Sender name: `GATE OS`

Then raise **Authentication → Rate Limits → Emails per hour** to a sane value (e.g. 30+).

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

- [ ] `/` renders; invite entry rejects a bogus code with a specific message
- [ ] `/login` → email code flow: email arrives (from your Resend domain), 6-digit code works, link in the email also works
- [ ] Google sign-in completes and returns to `gateeee.vercel.app` (never localhost)
- [ ] New invite → new account → onboarding saves → `/app` loads
- [ ] Vault: upload a PDF (≤50 MB) and open it (signed URL)
- [ ] Settings: enable browser reminders (push permission prompt appears — requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY`)
- [ ] `/api/cron/weekly-summary` with `Authorization: Bearer $CRON_SECRET` returns `{sent, periodKey}`
- [ ] Second user cannot see first user's notes/PDFs/goals (RLS isolation)
