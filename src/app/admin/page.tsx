import { redirect } from "next/navigation";
import { AdminInvites } from "@/components/os/admin-invites";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const setup = await getServerSupabaseClient(); if (!setup.value) redirect("/login");
  const { data } = await setup.value.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : "";
  if (!email || email !== process.env.ADMIN_EMAIL?.toLowerCase()) redirect("/app");
  return <main className="mx-auto min-h-dvh max-w-4xl px-5 py-12 sm:px-8"><p className="mono-label">Private beta administration</p><h1 className="display-type mt-4 text-6xl">Invite carefully.</h1><p className="mt-4 max-w-xl text-[var(--muted)]">Create limited, expiring invitation codes. Plaintext codes appear once and are never stored.</p><AdminInvites /></main>;
}

