"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function InviteEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsError(false);
    if (code.trim().length < 6) {
      setStatus("Enter the complete invitation code.");
      setIsError(true);
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const result = (await response.json()) as { valid?: boolean; message?: string };
      if (!response.ok || !result.valid) throw new Error(result.message || "That invite is not available.");
      setStatus("Invitation accepted. Opening sign in…");
      router.push("/login");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not validate this invite.");
      setIsError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-7 max-w-xl" onSubmit={submitInvite} noValidate>
      <label className="field-label" htmlFor="invite-code">
        Invitation code
        <span className="flex rounded-[16px] border border-[var(--line)] bg-[var(--surface-strong)] p-1.5 shadow-sm focus-within:border-[var(--accent)]">
          <input
            id="invite-code"
            className="min-h-12 min-w-0 flex-1 bg-transparent px-3 font-mono tracking-[.12em] outline-none"
            autoComplete="one-time-code"
            placeholder="GATE-2027-…"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            aria-describedby="invite-status"
          />
          <button className="primary-button min-w-12 sm:min-w-36" type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <><span className="hidden sm:inline">Enter beta</span><ArrowRight aria-hidden="true" size={18} /></>}
          </button>
        </span>
      </label>
      <p id="invite-status" className="status-message mt-3" role="status" data-error={isError}>{status}</p>
    </form>
  );
}
