"use client";

import { FormEvent, useMemo, useState } from "react";

import { getBrowserSupabaseClient, getBrowserSupabaseSetupError } from "@/lib/supabase/client";

type LoginFormProps = {
  initialError: string;
  nextPath: string;
};

type Mode = "signin" | "signup";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ initialError, nextPath }: LoginFormProps) {
  const setupError = useMemo(() => getBrowserSupabaseSetupError(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialError || setupError || "");
  const [isWorking, setIsWorking] = useState(false);

  function callbackUrl() {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", nextPath);
    return url.toString();
  }

  async function startGoogle() {
    setMessage("");
    setIsWorking(true);
    try {
      const clientResult = await getBrowserSupabaseClient();
      if (!clientResult.value) {
        setMessage(clientResult.error);
        return;
      }
      const { data, error } = await clientResult.value.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl(), queryParams: { prompt: "select_account" } },
      });
      if (error || !data.url) {
        setMessage(error?.message ?? "Google sign-in could not start. Please try again.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setMessage("We could not start Google sign-in. Check your connection and try again.");
    } finally {
      setIsWorking(false);
    }
  }

  // Both modes end the same way: a live session cookie, then hand off to the
  // callback which decides onboarding vs the workspace.
  async function finishWithPassword(): Promise<string | null> {
    const clientResult = await getBrowserSupabaseClient();
    if (!clientResult.value) return clientResult.error;
    const { data, error } = await clientResult.value.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.session) return error?.message ?? "That email and password did not match.";
    window.location.assign(callbackUrl());
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!emailPattern.test(email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setMessage("Use at least 8 characters for your password.");
      return;
    }

    setIsWorking(true);
    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          // If the account already exists, drop them straight into sign-in
          // rather than making them start over.
          if (response.status === 409) {
            setMode("signin");
            setMessage(body.error ?? "An account with this email already exists. Sign in instead.");
          } else {
            setMessage(body.error ?? "We could not create your account. Please try again.");
          }
          return;
        }
      }

      const failure = await finishWithPassword();
      if (failure) {
        setMessage(
          mode === "signin"
            ? "That email and password did not match. Check them, or create an account."
            : failure,
        );
      }
    } catch {
      setMessage("Something went wrong. Check your connection and try again.");
    } finally {
      setIsWorking(false);
    }
  }

  const disabled = Boolean(setupError) || isWorking;
  const isSignup = mode === "signup";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f2ec] px-4 py-8 text-[#1d2a2a] sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_10%_10%,rgba(166,211,196,.48),transparent_27%),radial-gradient(circle_at_90%_82%,rgba(244,199,129,.32),transparent_24%)]" />
      <section className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(36,52,48,.14)] backdrop-blur sm:p-9" aria-labelledby="login-title">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#183f3b] text-lg font-semibold text-white" aria-hidden="true">G</span>
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-[#52706a]">GATE OS</p>
            <p className="text-sm text-[#61706d]">Your preparation, in your own space.</p>
          </div>
        </div>

        <h1 id="login-title" className="text-3xl font-semibold tracking-tight text-[#162826] sm:text-[2.1rem]">
          {isSignup ? "Create your workspace." : "Welcome back."}
        </h1>
        <p className="mt-3 text-[0.98rem] leading-6 text-[#52635f]">
          {isSignup
            ? "One email and a password — your private space for GATE 2027, ready right away."
            : "Sign in to your private GATE 2027 workspace."}
        </p>

        {/* Mode toggle */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-[#d3e0da] bg-[#eef4f1] p-1" role="tablist" aria-label="Sign in or create an account">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            onClick={() => { setMode("signin"); setMessage(""); }}
            disabled={isWorking}
            className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#b7ded2] ${!isSignup ? "bg-white text-[#183f3b] shadow-sm" : "text-[#52706a] hover:text-[#29433e]"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            onClick={() => { setMode("signup"); setMessage(""); }}
            disabled={isWorking}
            className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#b7ded2] ${isSignup ? "bg-white text-[#183f3b] shadow-sm" : "text-[#52706a] hover:text-[#29433e]"}`}
          >
            Create account
          </button>
        </div>

        {message ? <p className="mt-5 rounded-xl border border-[#e9c7b5] bg-[#fff5ef] px-3 py-2.5 text-sm leading-5 text-[#88401f]" role="alert">{message}</p> : null}

        <button
          type="button"
          onClick={startGoogle}
          disabled={disabled}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#a9bbb5] bg-white px-4 text-base font-semibold text-[#29433e] shadow-sm transition hover:bg-[#f2f7f5] focus:outline-none focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="grid size-5 place-items-center rounded-full bg-[#183f3b] text-xs font-bold text-white" aria-hidden="true">G</span>
          {isWorking ? "Opening Google…" : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#d7e2dc]" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a9793]">or</span>
          <span className="h-px flex-1 bg-[#d7e2dc]" />
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#29433e]">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={disabled}
              placeholder="you@example.com"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#c8d6d0] bg-white px-3 text-base outline-none transition placeholder:text-[#84928f] focus:border-[#176558] focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#29433e]">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={disabled}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              minLength={8}
              className="mt-2 min-h-12 w-full rounded-xl border border-[#c8d6d0] bg-white px-3 text-base outline-none transition placeholder:text-[#84928f] focus:border-[#176558] focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60"
            />
            {isSignup ? <p className="mt-2 text-sm text-[#61706d]">Choose 8 characters or more.</p> : null}
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="min-h-12 w-full rounded-xl bg-[#183f3b] px-4 text-base font-semibold text-white transition hover:bg-[#0e302c] focus:outline-none focus:ring-4 focus:ring-[#9bcfc0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? (isSignup ? "Creating your workspace…" : "Signing in…") : isSignup ? "Create my workspace" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#52635f]">
          {isSignup ? "Already have an account? " : "New to GATE OS? "}
          <button
            type="button"
            onClick={() => { setMode(isSignup ? "signin" : "signup"); setMessage(""); }}
            disabled={isWorking}
            className="font-semibold text-[#176558] underline decoration-[#9ab9b0] underline-offset-4 focus:outline-none focus:ring-4 focus:ring-[#b7ded2]"
          >
            {isSignup ? "Sign in" : "Create a free account"}
          </button>
        </p>

        <p className="mt-6 text-center text-xs leading-5 text-[#70807c]">Private by default. Every account sees only its own notes, progress, files, goals, and sessions.</p>
        <p className="sr-only" aria-live="polite">{isWorking ? "Working" : ""}</p>
      </section>
    </main>
  );
}
