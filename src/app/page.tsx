import { ArrowRight, BookOpen, CircleCheck, Clock3, LockKeyhole, Users } from "lucide-react";
import Link from "next/link";
import { InviteEntry } from "@/components/landing/invite-entry";
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

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden px-4 pb-16 sm:px-6 lg:px-10">
      <header className="mx-auto flex max-w-[1480px] items-center justify-between py-5 sm:py-7">
        <Link className="flex min-h-11 items-center gap-3" href="/" aria-label="GATE OS home">
          <span className="grid size-9 place-items-center rounded-full bg-[var(--accent)] text-[var(--paper)]">
            <CircleCheck aria-hidden="true" size={18} />
          </span>
          <span className="font-bold tracking-[-0.03em]">GATE OS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link className="quiet-button hidden sm:inline-flex" href="#preview">
            Preview space
          </Link>
          <Link className="secondary-button" href="/login">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[78vh] max-w-[1480px] items-center gap-12 py-10 lg:grid-cols-[1.03fr_.97fr] lg:py-16">
        <div className="reveal-up max-w-3xl">
          <p className="mono-label mb-6 text-[var(--accent)]">Private beta · GATE CS &amp; IT 2027</p>
          <h1 className="display-type text-[clamp(3.35rem,9.5vw,9.4rem)] leading-[.84] sm:leading-[.8]">
            Your preparation,
            <span className="block italic text-[var(--accent)]">in one space.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            GATE OS is the private study workspace that feels like your own website—focused, calm, and built around how you prepare every day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="primary-button" href="#invite">
              Enter invite code <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="quiet-button" href="/login">
              I already have an account
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

      <section id="invite" className="mx-auto max-w-[1480px] scroll-mt-6 py-10 sm:py-16" aria-labelledby="beta-title">
        <div className="grid gap-8 border-y border-[var(--line)] py-10 lg:grid-cols-[.8fr_1.2fr] lg:py-16">
          <div>
            <p className="mono-label text-[var(--accent)]">Founding beta</p>
            <h2 id="beta-title" className="display-type mt-3 max-w-lg text-6xl leading-[.9] sm:text-7xl">Make the space yours.</h2>
          </div>
          <div>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">We are opening GATE OS carefully to the first group of serious aspirants. Enter your invite code to create a private workspace.</p>
            <InviteEntry />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-4 py-10 md:grid-cols-3 sm:py-16">
        {productPillars.map(({ icon: Icon, title, copy, href, action }, index) => (
          <article className="surface-card min-h-64 p-6 sm:p-8" key={title}>
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-full border border-[var(--line)]"><Icon aria-hidden="true" size={19} /></span>
              <span className="mono-label text-[var(--muted)]">0{index + 1}</span>
            </div>
            <h3 className="display-type mt-12 text-4xl leading-none">{title}</h3>
            <p className="mt-4 leading-7 text-[var(--muted)]">{copy}</p>
            <Link className="quiet-button mt-5 !px-0 text-sm" href={href}>{action} <ArrowRight aria-hidden="true" size={16} /></Link>
          </article>
        ))}
      </section>
    </main>
  );
}
