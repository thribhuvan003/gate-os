"use client";

import { ArrowRight, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CircleInviteConfirmation({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function acceptInvitation() {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/circles/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setMessage(result.message ?? "This invitation could not be accepted. It may have expired.");
        return;
      }

      router.replace("/app/circles?invite=joined");
    } catch {
      setMessage("We could not accept that invitation. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <section className="surface-card w-full max-w-lg p-7 sm:p-10" aria-labelledby="circle-invite-title">
        <span className="grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <UsersRound aria-hidden="true" size={22} />
        </span>
        <p className="mono-label mt-7 text-[var(--accent)]">Private study circle</p>
        <h1 id="circle-invite-title" className="display-type mt-3 text-5xl leading-[.9]">Join this circle?</h1>
        <p className="mt-5 max-w-md leading-7 text-[var(--muted)]">
          Your notes, files, goals, and syllabus progress remain private. Only focused sessions and short check-ins are shared.
        </p>
        {message ? <p className="mt-6 rounded-xl border border-[#e9c7b5] bg-[#fff5ef] px-3 py-2.5 text-sm leading-5 text-[#88401f]" role="alert">{message}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="primary-button" type="button" onClick={acceptInvitation} disabled={pending}>
            {pending ? "Joining…" : "Join study circle"} <ArrowRight aria-hidden="true" size={17} />
          </button>
          <button className="quiet-button" type="button" onClick={() => router.replace("/app/circles")} disabled={pending}>
            Not now
          </button>
        </div>
      </section>
    </main>
  );
}
