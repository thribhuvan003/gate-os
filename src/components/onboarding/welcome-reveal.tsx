"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export function WelcomeReveal({ name }: { name: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1800);
    void fetch("/api/welcome", { method: "POST" });
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-[var(--ink)] px-5 text-[var(--background)]">
      <div className="absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-15 blur-[120px]" />
      <div className="relative m-auto max-w-4xl text-center">
        <p className="mono-label !text-[var(--accent)]">GATE CS/IT · 2027</p>
        <h1 className="display-type mt-6 text-6xl leading-[.94] sm:text-8xl">Welcome to your own space, {name}.</h1>
        <p className="mx-auto mt-7 max-w-xl leading-7 opacity-65">Nothing is pre-completed. Every focused minute, note and checked topic will be yours.</p>
        <Link className={`mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-6 font-bold text-white transition duration-500 ${ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`} href="/app">
          Enter your space <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}

