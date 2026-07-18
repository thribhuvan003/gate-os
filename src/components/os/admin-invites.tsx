"use client";

import { FormEvent, useState } from "react";

export function AdminInvites() {
  const [label, setLabel] = useState("First cohort");
  const [maxUses, setMaxUses] = useState(1);
  const [code, setCode] = useState("");
  async function create(event: FormEvent) {
    event.preventDefault(); setCode("");
    const response = await fetch("/api/admin/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label, maxUses }) });
    const result = await response.json() as { code?: string };
    if (response.ok && result.code) setCode(result.code);
  }
  return <section className="surface-card mt-10 p-6"><form className="grid gap-4" onSubmit={create}><label className="field-label">Internal label<input className="text-field" value={label} onChange={(event) => setLabel(event.target.value)} /></label><label className="field-label">Maximum uses<input className="text-field" type="number" min="1" max="100" value={maxUses} onChange={(event) => setMaxUses(Number(event.target.value))} /></label><button className="primary-button w-fit" type="submit">Create invitation</button></form>{code ? <div className="mt-6 rounded-2xl bg-[var(--ink)] p-5 text-[var(--background)]"><p className="mono-label !text-[var(--accent)]">Copy now · shown once</p><code className="mt-3 block break-all text-lg">{code}</code><button className="mt-4 text-sm underline" onClick={() => navigator.clipboard.writeText(code)}>Copy code</button></div> : null}</section>;
}

