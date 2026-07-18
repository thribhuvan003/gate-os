# GATE OS Public Beta Design

## Product thesis

GATE OS is a private, personalized preparation workspace for GATE CS/IT 2027 aspirants. It turns daily focus, syllabus coverage, PDFs, notes, revision, mistakes, goals, reflections, reminders, and small study circles into one coherent habit system.

The product is not a generic analytics dashboard, a coaching marketplace, a social network, or a full Notion clone. Its primary success signal is meaningful preparation on at least four days per week and return usage in week two.

## First-run experience

1. A visitor enters a beta invite code.
2. They continue with Google or a six-digit email code.
3. They set their name, timezone, GATE target, preferred study window, visual personality, and first weekly commitment.
4. A one-time reveal welcomes them to their own space.
5. Returning visits open quickly with a time-aware greeting and the next meaningful action.

## Visual direction

Editorial Calm is the default: warm ivory paper, charcoal ink, deep forest accents, tactile matte cards, a characterful serif display face, and restrained motion. Focus Tech, Soft Personal, and Midnight Paper are curated alternatives. Users may change theme, font pair, accent, density, motion level, layout preset, module order, and module visibility without creating free-form layouts that break on phones.

## Private workspace

- Home combines the next action, focus, commitments, revision, syllabus, and study rhythm.
- Focus provides an accurate offline-safe timer with intention and completion reflection.
- Syllabus uses a reviewed, versioned official catalog with private progress.
- Vault stores private PDFs with search, tags, reading position, and optional offline cache.
- Notes supports daily and topic notes with study-focused rich text.
- Revision Queue and Mistake Book create the daily return loop.
- Goals and Reflections keep commitments and learning history dated and actionable.
- AI handoff prepares context for ChatGPT and NotebookLM; no built-in tutor ships in v1.

## Study circles

Circles are separate from the personal vault. Members share a session goal, server-anchored timer, presence, reactions, and short completion check-ins. Circles do not include public discovery, persistent chat, direct messages, or access to another member's private workspace.

## Platform boundaries

- New private GitHub repository under `thribhuvan003`.
- New Vercel project and URL.
- New empty Supabase project with fresh migrations and RLS.
- Resend for production auth and summary email after a sender domain is verified.
- Web Push is opt-in; WhatsApp and billing are outside v1.
- The Saket app, repository, deployment, database, URL, credentials, and data remain untouched.

## Quality contract

The product must work from 320px phones through wide desktops with no clipped controls or unreachable destinations. Mobile navigation uses a safe-area-aware horizontal rail with visible labels, snapping, active-item centering, and edge affordances. Routine motion uses transform and opacity, honors reduced motion, and never delays daily work. Core flows must satisfy WCAG 2.2 AA, two-user isolation tests, offline recovery tests, and mobile performance budgets.
