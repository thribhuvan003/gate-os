import { PyqDesk } from "@/components/os/pyq-desk";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type PyqAttempt = { id: string; year: number; variant: string; status: "planned" | "attempted" | "reviewed"; score: number | null; attemptedOn: string | null; notes: string };

export default async function PyqPage() {
  const setup = await getServerSupabaseClient();
  let attempts: PyqAttempt[] = [];
  if (setup.value) {
    const { data } = await setup.value.from("pyq_attempts").select("id,year,paper_variant,status,score,attempted_on,notes").order("year", { ascending: false });
    attempts = (data ?? []).map((row) => ({ id: row.id, year: row.year, variant: row.paper_variant, status: row.status, score: row.score, attemptedOn: row.attempted_on, notes: row.notes ?? "" }));
  }
  return <PyqDesk initialAttempts={attempts} />;
}

