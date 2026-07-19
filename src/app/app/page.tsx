import { ArrowRight, BookOpen, Check, Clock3, Flame, RotateCcw } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/os/page-heading";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const dateLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

export default async function WorkspaceHome() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "A quiet night";
  const clientResult = await getServerSupabaseClient();
  let displayName = "Aspirant";
  let currentSubject = "Choose your first subject";
  let weeklyCommitment = "Write one clear promise for this week.";
  let dueRevisionCount = 0;
  let completedTopicCount = 0;
  let totalTopicCount = 0;
  let focusedSecondsToday = 0;
  if (clientResult.value) {
    const { data: authData } = await clientResult.value.auth.getClaims();
    const userId = authData?.claims?.sub;
    if (userId) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const [{ data: profile }, { data: goal }, { count: revisionCount }, { data: versionData }, { data: sessions }] = await Promise.all([
        clientResult.value.from("profiles").select("display_name,preferred_study_window").eq("id", userId).maybeSingle(),
        clientResult.value.from("goals").select("title").eq("user_id", userId).eq("period", "weekly").is("completed_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        clientResult.value.from("revision_items").select("id", { count: "exact", head: true }).lte("due_on", new Date().toISOString().slice(0, 10)).is("completed_at", null),
        clientResult.value.from("exam_versions").select("id").eq("year", 2027).maybeSingle(),
        clientResult.value.from("study_sessions").select("elapsed_seconds").eq("status", "completed").gte("ended_at", startOfToday.toISOString()),
      ]);
      displayName = profile?.display_name ?? displayName;
      const windowData = profile?.preferred_study_window as { currentSubject?: string } | null;
      currentSubject = windowData?.currentSubject ?? currentSubject;
      weeklyCommitment = goal?.title ?? weeklyCommitment;
      dueRevisionCount = revisionCount ?? 0;
      focusedSecondsToday = (sessions ?? []).reduce((total, session) => total + (session.elapsed_seconds ?? 0), 0);

      if (versionData?.id) {
        const [{ count: progressCount }, { count: catalogCount }] = await Promise.all([
          clientResult.value.from("syllabus_progress").select("id", { count: "exact", head: true }).eq("exam_version_id", versionData.id).not("completed_at", "is", null),
          clientResult.value.from("exam_version_topics").select("topic_id", { count: "exact", head: true }).eq("exam_version_id", versionData.id),
        ]);
        completedTopicCount = progressCount ?? 0;
        totalTopicCount = catalogCount ?? 0;
      }
    }
  }
  const syllabusPercent = totalTopicCount ? Math.round((completedTopicCount / totalTopicCount) * 100) : 0;
  const focusedMinutesToday = Math.round(focusedSecondsToday / 60);

  return (
    <div className="mx-auto max-w-[1340px] px-4 py-6 sm:px-8 sm:py-10">
      <PageHeading eyebrow={dateLabel} title={`${greeting}, ${displayName}.`} description="Your space is clear. Choose one meaningful step and protect it." />

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--ink)] p-6 text-[var(--background)] sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold">NEXT MEANINGFUL ACTION</span>
            <span className="flex items-center gap-2 text-xs opacity-70"><Clock3 size={14} /> 50 min</span>
          </div>
          <h2 className="display-type mt-12 max-w-xl text-4xl leading-[1.02] sm:text-6xl">{currentSubject}</h2>
          <p className="mt-5 max-w-lg text-sm leading-6 opacity-70">Choose a topic and intention. Your workspace begins empty because progress should always be real.</p>
          <Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-5 font-semibold text-white" href="/app/focus">
            Start a focus session <ArrowRight size={17} />
          </Link>
        </div>

        <div className="surface-card p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="mono-label">This week</p>
              <h2 className="display-type mt-2 text-3xl">Your commitment</h2>
            </div>
            <span className="grid size-11 place-items-center rounded-full bg-[var(--soft-accent)] text-[var(--accent)]"><Flame size={20} /></span>
          </div>
          <p className="mt-8 text-lg font-semibold">{weeklyCommitment}</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full w-0 rounded-full bg-[var(--accent)]" /></div>
          <div className="mt-3 flex justify-between text-xs text-[var(--muted)]"><span>Ready to begin</span><span>This week</span></div>
          <Link className="quiet-button mt-6 inline-flex" href="/app/goals">Update commitment</Link>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="surface-card p-6">
          <div className="flex items-center justify-between"><p className="mono-label">Due for revision</p><RotateCcw size={17} className="text-[var(--accent)]" /></div>
          <p className="display-type mt-7 text-5xl">{dueRevisionCount}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{dueRevisionCount === 1 ? "item" : "items"} {dueRevisionCount ? "ready to revisit" : "— add one after your first session"}</p>
          <Link className="secondary-button mt-6 inline-flex" href="/app/revision">Open queue</Link>
        </article>
        <article className="surface-card p-6">
          <div className="flex items-center justify-between"><p className="mono-label">Syllabus</p><BookOpen size={17} className="text-[var(--accent)]" /></div>
          <p className="display-type mt-7 text-5xl">{syllabusPercent}%</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{completedTopicCount} / {totalTopicCount || "—"} topics complete</p>
          <Link className="secondary-button mt-6 inline-flex" href="/app/syllabus">Choose a topic</Link>
        </article>
        <article className="surface-card p-6">
          <div className="flex items-center justify-between"><p className="mono-label">Today</p><Check size={17} className="text-[var(--accent)]" /></div>
          <p className="display-type mt-7 text-5xl">{focusedMinutesToday}m</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{focusedMinutesToday ? "focused today" : "your first focused minute starts now"}</p>
          <Link className="secondary-button mt-6 inline-flex" href="/app/focus">Begin</Link>
        </article>
      </section>
    </div>
  );
}
