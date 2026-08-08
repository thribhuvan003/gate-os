import { VaultClient } from "@/components/os/vault-client";
import { toOne } from "@/lib/supabase/relation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function VaultPage() {
  const clientResult = await getServerSupabaseClient();
  let documents: Array<{ id: string; title: string; subject: string; tags: string[]; updatedLabel: string; page?: number; pinned?: boolean }> = [];
  let subjects: { id: string; name: string }[] = [];
  if (clientResult.value) {
    const [{ data }, { data: subjectData }] = await Promise.all([
      clientResult.value.from("pdfs").select("id,title,tags,is_pinned,last_read_page,updated_at,subjects(name)").order("updated_at", { ascending: false }),
      clientResult.value.from("subjects").select("id,name").order("position"),
    ]);
    documents = (data ?? []).map((item: { id: string; title: string; tags: string[]; is_pinned: boolean; last_read_page: number | null; updated_at: string; subjects: { name: string } | { name: string }[] | null }) => ({ id: item.id, title: item.title, subject: toOne(item.subjects)?.name ?? "Unsorted", tags: item.tags, pinned: item.is_pinned, page: item.last_read_page ?? undefined, updatedLabel: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(item.updated_at)) }));
    subjects = (subjectData ?? []) as { id: string; name: string }[];
  }
  return <VaultClient initialDocuments={documents} subjects={subjects} />;
}
