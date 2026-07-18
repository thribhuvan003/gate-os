import { VaultClient } from "@/components/os/vault-client";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function VaultPage() {
  const clientResult = await getServerSupabaseClient();
  let documents: Array<{ id: string; title: string; subject: string; tags: string[]; updatedLabel: string; page?: number; pinned?: boolean }> = [];
  if (clientResult.value) {
    const { data } = await clientResult.value.from("pdfs").select("id,title,tags,is_pinned,last_read_page,updated_at").order("updated_at", { ascending: false });
    documents = (data ?? []).map((item: { id: string; title: string; tags: string[]; is_pinned: boolean; last_read_page: number | null; updated_at: string }) => ({ id: item.id, title: item.title, subject: "Unsorted", tags: item.tags, pinned: item.is_pinned, page: item.last_read_page ?? undefined, updatedLabel: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(item.updated_at)) }));
  }
  return <VaultClient initialDocuments={documents} />;
}
