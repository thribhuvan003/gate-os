import { ArrowRight, BookOpen, CircleCheck, Clock3, LockKeyhole, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";
import { InteractivePreview } from "@/components/landing/interactive-preview";

const productPillars = [
  {
    icon: Clock3,
    title: "Begin the right block",
    copy: "A precise focus timer, one intention, and the next meaningful action—not another crowded dashboard.",
    href: "/login?next=%2Fapp%2Ffocus",
    action: "Set up a focus block",
  },
  {
    icon: BookOpen,
    title: "Know what to revise",
    copy: "Your syllabus, PDFs, notes, mistakes, and revision queue stay connected to the work you are actually doing.",
    href: "/login?next=%2Fapp%2Fsyllabus",
    action: "Explore your syllabus",
  },
  {
    icon: Users,
    title: "Study together, privately",
    copy: "Invite friends into focused study circles without exposing your notes, goals, files, or personal progress.",
    href: "/login?next=%2Fapp%2Fcircles",
    action: "See private circles",
  },
];

const quietFeatures = [
  { icon: Target, label: "One intention per block" },
  { icon: BookOpen, label: "Syllabus, notes & revision linked" },
  { icon: LockKeyhole, label: "Private by default" },
  { icon: Users, label: "Circles that protect your data" },
  { icon: Clock3, label: "Built for the 27-day rhythm" },
  { icon: Sparkles, label: "Calm, not a dashboard" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GATE OS",
  url: "https://gateeee.vercel.app",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: "A private, personal operating system for GATE CS & IT 2027 preparation.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export default function LandingPage() {
  return (
    <main id="main-content" className="landing min-h-screen overflow-hidden px-4 pb-16 sm:px-6 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="mx-auto flex max-w-[1480px] flex-col items-center gap-1 pt-4 text-center text-xs text-[var(--muted)] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-1 sm:pt-5">
        <span className="mono-label text-[var(--accent)]">Free private workspace</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>Built for GATE CS &amp; IT 2027 aspirants</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>Google or email signup</span>
      </div>

      <header className="landing-header mx-auto flex max-w-[1480px] items-center justify-between py-5 sm:py-7">
        <Link className="flex min-h-11 items-center gap-3" href="/" aria-label="GATE OS home">
          <span className="grid size-9 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]" aria-hidden="true">
            <CircleCheck aria-hidden="true" size={18} />
          </span>
          <span className="font-bold tracking-[-0.03em]">GATE OS</span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Primary">
          <Link className="quiet-button hidden sm:inline-flex" href="#preview">
            Preview space
          </Link>
          <Link className="quiet-button hidden sm:inline-flex" href="#how">
            How it works
          </Link>
          <Link className="secondary-button" href="/login">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[78vh] max-w-[1480px] items-center gap-12 py-10 lg:grid-cols-[1.03fr_.97fr] lg:py-16">
        <div className="reveal-up max-w-3xl">
          <p className="mono-label mb-6 text-[var(--accent)]">Open now · GATE CS &amp; IT 2027</p>
          <h1 className="display-type text-[clamp(3.35rem,9.5vw,9.4rem)] leading-[.84] sm:leading-[.8]">
            Your preparation,
            <span className="block italic text-[var(--accent)]">in one space.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            GATE OS is the private study workspace that feels like your own website—focused, calm, and built around how you prepare every day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="primary-button" href="/login">
              Create my free workspace <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="quiet-button" href="#preview">
              Try the interactive preview
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-2"><LockKeyhole aria-hidden="true" size={16} /> Private by default</span>
            <span className="flex items-center gap-2"><CircleCheck aria-hidden="true" size={16} /> One useful next step</span>
            <span className="flex items-center gap-2"><BookOpen aria-hidden="true" size={16} /> Every subject connected</span>
          </div>
        </div>

        <InteractivePreview />
      </section>

      <section id="start" className="mx-auto max-w-[1480px] scroll-mt-6 py-10 sm:py-16" aria-labelledby="start-title">
        <div className="grid gap-8 border-y border-[var(--line)] py-10 lg:grid-cols-[.8fr_1.2fr] lg:py-16">
          <div>
            <p className="mono-label text-[var(--accent)]">Your account, your data</p>
            <h2 id="start-title" className="display-type mt-3 max-w-lg text-[length:var(--text-4xl)] leading-[.92]">Make the space yours.</h2>
          </div>
          <div>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">Create an account with Google or email. Your progress, notes, goals, sessions, and private PDFs follow you across every device where you sign in.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="primary-button" href="/login">Create free workspace <ArrowRight aria-hidden="true" size={17} /></Link>
              <Link className="secondary-button" href="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1480px] scroll-mt-6 py-10 sm:py-16" aria-labelledby="how-title">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14">
          <div className="max-w-xl">
            <p className="mono-label text-[var(--accent)]">How it works</p>
            <h2 id="how-title" className="display-type mt-3 text-[length:var(--text-4xl)] leading-[.92]">Three quiet habits, one calm space.</h2>
          </div>
          <p className="max-w-sm leading-7 text-[var(--muted)]">
            Every part of GATE OS points you to the single most useful next action — and keeps the rest out of your way.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {productPillars.map(({ icon: Icon, title, copy, href, action }, index) => (
            <article className="surface-card group min-h-64 p-6 transition-transform duration-200 hover:-translate-y-1 sm:p-8" key={title}>
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full border border-[var(--line)]"><Icon aria-hidden="true" size={19} /></span>
                <span className="mono-label text-[var(--muted)]">0{index + 1}</span>
              </div>
              <h3 className="display-type mt-8 text-4xl leading-none">{title}</h3>
              <p className="mt-4 leading-7 text-[var(--muted)]">{copy}</p>
              <Link className="quiet-button mt-5 !px-0 text-sm" href={href}>{action} <ArrowRight aria-hidden="true" size={16} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] py-10 sm:py-16" aria-labelledby="quiet-title">
        <div className="grid gap-4 border-y border-[var(--line)] py-10 sm:grid-cols-2 lg:grid-cols-3 lg:py-14">
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="mono-label text-[var(--accent)]">Everything in one place</p>
            <h2 id="quiet-title" className="display-type mt-3 max-w-2xl text-[length:var(--text-4xl)] leading-[.92]">No tabs. No spreadsheets. No scattered PDFs.</h2>
          </div>
          {quietFeatures.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><Icon aria-hidden="true" size={18} /></span>
              <p className="font-semibold leading-5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] py-10 sm:py-16" aria-labelledby="cta-title">
        <div className="surface-card relative overflow-hidden p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[var(--accent-soft)] opacity-70 blur-3xl" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mono-label text-[var(--accent)]">Begin today</p>
              <h2 id="cta-title" className="display-type mt-3 max-w-xl text-[length:var(--text-4xl)] leading-[.92]">Open the space that gets you to GATE 2027.</h2>
              <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">Sign up with Google or email and start your first focus block in under a minute. Your workspace begins empty and records only your work.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link className="primary-button" href="/login">Create free workspace <ArrowRight aria-hidden="true" size={17} /></Link>
              <Link className="secondary-button" href="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] py-8 text-sm text-[var(--muted)]">
        <p>© 2026 GATE OS · A private preparation workspace for GATE CS &amp; IT 2027.</p>
        <nav className="flex items-center gap-5" aria-label="Footer">
          <Link className="transition hover:text-[var(--accent)]" href="/login">
            Sign in
          </Link>
          <Link className="transition hover:text-[var(--accent)]" href="/login">
            Create account
          </Link>
          <a className="transition hover:text-[var(--accent)]" href="#how">
            How it works
          </a>
        </nav>
      </footer>
    </main>
  );
}
