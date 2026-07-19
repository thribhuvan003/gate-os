import { FocusClient } from "@/components/os/focus-client";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function FocusPage() {
  const clientResult = await getServerSupabaseClient();
  let subjects: { id: string; name: string }[] = [];
  if (clientResult.value) {
    const { data } = await clientResult.value.from("subjects").select("id,name").order("position");
    subjects = (data ?? []) as { id: string; name: string }[];
  }
  return <FocusClient subjects={subjects} />;
}
