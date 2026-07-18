import { ArrowRight, BookOpen, CircleCheck, Clock3, LockKeyhole, Users } from "lucide-react";
import Link from "next/link";
import { InviteEntry } from "@/components/landing/invite-entry";

const productPillars = [
  {
    icon: Clock3,
    title: "Begin the right block",
    copy: "A precise focus timer, one intention, and the next meaningful action—not another crowded dashboard.",
  },
  {
    icon: BookOpen,
    title: "Know what to revise",
    copy: "Your syllabus, PDFs, notes, mistakes, and revision queue stay connected to the work you are actually doing.",
  },
  {
    icon: Users,
    title: "Study together, privately",
    copy: "Invite friends into focused study circles without exposing your notes, goals, files, or personal progress.",
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
          <Link className="quiet-button hidden sm:inline-flex" href="/demo">
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
          <h1 className="display-type text-[clamp(4.25rem,9.5vw,9.4rem)] leading-[.78]">
            Your preparation,
            <span className="block italic text-[var(--accent)]">in one space.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            GATE OS is the private study workspace that feels like your own website—focused, calm, and built around how you prepare every day.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-2"><LockKeyhole size={16} /> Private by default</span>
            <span className="flex items-center gap-2"><CircleCheck size={16} /> One useful next step</span>
            <span className="flex items-center gap-2"><BookOpen size={16} /> Every subject connected</span>
          </div>
        </div>

        <div className="relative reveal-up [animation-delay:120ms]">
          <div className="absolute -inset-8 -z-10 rounded-[48px] bg-[var(--accent-soft)] opacity-65 blur-3xl" />
          <div className="surface-card overflow-hidden p-3 shadow-[var(--shadow)] sm:p-4">
            <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-6 border-b border-[var(--line)] pb-6">
                <div>
                  <p className="mono-label text-[var(--muted)]">Your quiet start</p>
                  <h2 className="display-type mt-2 text-5xl leading-none">Good evening, Arjun.</h2>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-bold text-[var(--accent)]">27 day rhythm</span>
              </div>
              <div className="grid gap-4 pt-5 sm:grid-cols-[1.12fr_.88fr]">
                <article className="rounded-[18px] bg-[var(--accent)] p-6 text-white">
                  <p className="mono-label text-white/65">Next focus</p>
                  <div className="mt-10 flex items-end justify-between gap-4">
                    <div>
                      <strong className="display-type text-7xl font-normal">45</strong>
                      <span className="ml-2 text-sm text-white/70">minutes</span>
                    </div>
                    <span className="rounded-full bg-white/12 p-3"><ArrowRight aria-hidden="true" /></span>
                  </div>
                  <p className="mt-6 text-sm text-white/75">Data Structures · Trees and heaps</p>
                </article>
                <div className="grid gap-4">
                  <article className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5">
                    <p className="mono-label text-[var(--muted)]">Syllabus</p>
                    <strong className="display-type mt-3 block text-5xl font-normal">42%</strong>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--paper-deep)]"><i className="block h-full w-[42%] rounded-full bg-[var(--accent)]" /></div>
                  </article>
                  <article className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5">
                    <p className="mono-label text-[var(--muted)]">Revision queue</p>
                    <strong className="mt-3 block text-lg">3 ideas worth returning to</strong>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] py-10 sm:py-16" aria-labelledby="beta-title">
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
        {productPillars.map(({ icon: Icon, title, copy }, index) => (
          <article className="surface-card min-h-64 p-6 sm:p-8" key={title}>
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-full border border-[var(--line)]"><Icon aria-hidden="true" size={19} /></span>
              <span className="mono-label text-[var(--muted)]">0{index + 1}</span>
            </div>
            <h3 className="display-type mt-12 text-4xl leading-none">{title}</h3>
            <p className="mt-4 leading-7 text-[var(--muted)]">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

