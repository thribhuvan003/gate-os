"use client";

import { FormEvent, useMemo, useState } from "react";

import { getBrowserSupabaseClient, getBrowserSupabaseSetupError } from "@/lib/supabase/client";

type LoginFormProps = {
  initialInviteCode: string;
  initialError: string;
};

type LoginStep = "start" | "email" | "code";

const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export function LoginForm({ initialInviteCode, initialError }: LoginFormProps) {
  const setupError = useMemo(() => getBrowserSupabaseSetupError(), []);
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("start");
  const [message, setMessage] = useState(initialError || setupError || "");
  const [isWorking, setIsWorking] = useState(false);

  async function prepareInvite(): Promise<boolean> {
    const code = inviteCode.trim();

    if (!code) {
      return true;
    }

    const response = await fetch("/api/invites/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "We could not validate that invitation code.");
      return false;
    }

    return true;
  }

  async function startGoogle() {
    setMessage("");
    setIsWorking(true);

    try {
      if (!(await prepareInvite())) {
        return;
      }

      const clientResult = await getBrowserSupabaseClient();

      if (!clientResult.value) {
        setMessage(clientResult.error);
        return;
      }

      const { data, error } = await clientResult.value.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
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

  async function requestEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!emailPattern.test(email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }

    setIsWorking(true);

    try {
      if (!(await prepareInvite())) {
        return;
      }

      const clientResult = await getBrowserSupabaseClient();

      if (!clientResult.value) {
        setMessage(clientResult.error);
        return;
      }

      const { error } = await clientResult.value.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: Boolean(inviteCode.trim()),
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setStep("code");
      setMessage(`A six-digit code was sent to ${email.trim()}.`);
    } catch {
      setMessage("We could not send a code. Check your connection and try again.");
    } finally {
      setIsWorking(false);
    }
  }

  async function verifyEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!/^\\d{6}$/.test(otp)) {
      setMessage("Enter the six digits from your email.");
      return;
    }

    setIsWorking(true);

    try {
      const clientResult = await getBrowserSupabaseClient();

      if (!clientResult.value) {
        setMessage(clientResult.error);
        return;
      }

      const { data, error } = await clientResult.value.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "email",
      });

      if (error || !data.session) {
        setMessage(error?.message ?? "That code is not valid. Request a new code and try again.");
        return;
      }

      window.location.assign("/auth/callback");
    } catch {
      setMessage("We could not verify that code. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }

  const disabled = Boolean(setupError) || isWorking;

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

        <h1 id="login-title" className="text-3xl font-semibold tracking-tight text-[#162826] sm:text-[2.1rem]">Welcome in.</h1>
        <p className="mt-3 text-[0.98rem] leading-6 text-[#52635f]">A quiet workspace for the work that gets you to GATE 2027.</p>

        <div className="mt-7 rounded-2xl border border-[#d8e2de] bg-[#f7fbf9] p-4">
          <label htmlFor="invite-code" className="block text-sm font-medium text-[#29433e]">Beta invitation code <span className="font-normal text-[#61706d]">(new members)</span></label>
          <input id="invite-code" name="invite-code" autoComplete="off" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} disabled={disabled} placeholder="Paste your invite code" className="mt-2 min-h-11 w-full rounded-xl border border-[#c8d6d0] bg-white px-3 text-base outline-none transition placeholder:text-[#84928f] focus:border-[#176558] focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60" aria-describedby="invite-help" />
          <p id="invite-help" className="mt-2 text-sm leading-5 text-[#61706d]">Returning beta members can continue without a code. New members need one before their account is opened.</p>
        </div>

        {message ? <p className="mt-5 rounded-xl border border-[#e9c7b5] bg-[#fff5ef] px-3 py-2.5 text-sm leading-5 text-[#88401f]" role="alert">{message}</p> : null}

        {step === "start" ? (
          <div className="mt-6 space-y-3">
            <button type="button" onClick={startGoogle} disabled={disabled} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#183f3b] px-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#0e302c] focus:outline-none focus:ring-4 focus:ring-[#9bcfc0] disabled:cursor-not-allowed disabled:opacity-60">
              <span className="grid size-5 place-items-center rounded-full bg-white text-xs font-bold text-[#183f3b]" aria-hidden="true">G</span>
              {isWorking ? "Opening Google…" : "Continue with Google"}
            </button>
            <button type="button" onClick={() => { setMessage(""); setStep("email"); }} disabled={disabled} className="min-h-12 w-full rounded-xl border border-[#a9bbb5] bg-white px-4 text-base font-semibold text-[#29433e] transition hover:bg-[#f2f7f5] focus:outline-none focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60">Use email instead</button>
          </div>
        ) : null}

        {step === "email" ? (
          <form className="mt-6 space-y-4" onSubmit={requestEmailCode} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#29433e]">Email address</label>
              <input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={disabled} placeholder="you@example.com" className="mt-2 min-h-12 w-full rounded-xl border border-[#c8d6d0] bg-white px-3 text-base outline-none transition placeholder:text-[#84928f] focus:border-[#176558] focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60" />
            </div>
            <button type="submit" disabled={disabled} className="min-h-12 w-full rounded-xl bg-[#183f3b] px-4 text-base font-semibold text-white transition hover:bg-[#0e302c] focus:outline-none focus:ring-4 focus:ring-[#9bcfc0] disabled:cursor-not-allowed disabled:opacity-60">{isWorking ? "Sending code…" : "Email me a six-digit code"}</button>
            <button type="button" onClick={() => { setMessage(""); setStep("start"); }} disabled={isWorking} className="min-h-11 w-full text-sm font-medium text-[#365951] underline decoration-[#9ab9b0] underline-offset-4 focus:outline-none focus:ring-4 focus:ring-[#b7ded2]">Back to sign-in options</button>
          </form>
        ) : null}

        {step === "code" ? (
          <form className="mt-6 space-y-4" onSubmit={verifyEmailCode} noValidate>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-[#29433e]">Six-digit code</label>
              <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\\D/g, ""))} disabled={disabled} placeholder="000000" className="mt-2 min-h-12 w-full rounded-xl border border-[#c8d6d0] bg-white px-3 text-center font-mono text-xl tracking-[0.45em] outline-none transition placeholder:tracking-normal placeholder:text-[#84928f] focus:border-[#176558] focus:ring-4 focus:ring-[#b7ded2] disabled:cursor-not-allowed disabled:opacity-60" aria-describedby="otp-help" />
              <p id="otp-help" className="mt-2 text-sm text-[#61706d]">Sent to {email}.</p>
            </div>
            <button type="submit" disabled={disabled} className="min-h-12 w-full rounded-xl bg-[#183f3b] px-4 text-base font-semibold text-white transition hover:bg-[#0e302c] focus:outline-none focus:ring-4 focus:ring-[#9bcfc0] disabled:cursor-not-allowed disabled:opacity-60">{isWorking ? "Verifying…" : "Enter my workspace"}</button>
            <button type="button" onClick={() => { setMessage(""); setOtp(""); setStep("email"); }} disabled={isWorking} className="min-h-11 w-full text-sm font-medium text-[#365951] underline decoration-[#9ab9b0] underline-offset-4 focus:outline-none focus:ring-4 focus:ring-[#b7ded2]">Use a different email</button>
          </form>
        ) : null}

        <p className="mt-7 text-center text-xs leading-5 text-[#70807c]">Private by default. Your notes and study materials stay in your own workspace.</p>
        <p className="sr-only" aria-live="polite">{isWorking ? "Sign-in in progress" : ""}</p>
      </section>
    </main>
  );
}
