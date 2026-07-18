import { notFound } from "next/navigation";
import { PdfReader } from "@/components/os/pdf-reader";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function PdfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientResult = await getServerSupabaseClient();
  if (!clientResult.value) notFound();
  const { data: pdf } = await clientResult.value.from("pdfs").select("id,title,storage_path,last_read_page").eq("id", id).maybeSingle();
  if (!pdf) notFound();
  const { data } = await clientResult.value.storage.from("private-notes").createSignedUrl(pdf.storage_path, 60 * 60);
  if (!data?.signedUrl) notFound();
  return <PdfReader id={pdf.id} title={pdf.title} url={data.signedUrl} initialPage={pdf.last_read_page ?? 1} />;
}
