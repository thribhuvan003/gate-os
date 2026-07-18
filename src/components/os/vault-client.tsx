"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VaultWorkspace, type VaultDocument } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const subjects = ["Unsorted", "Mathematics", "Digital Logic", "COA", "Programming & DS", "Algorithms", "TOC", "Compiler Design", "Operating Systems", "Databases", "Computer Networks"];

export function VaultClient({ initialDocuments }: { initialDocuments: VaultDocument[] }) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);

  async function upload(file: File, details: { title: string; subject: string; tags: string[] }) {
    const setup = await getBrowserSupabaseClient();
    if (!setup.value) return window.alert(setup.error);
    const { data: authData } = await setup.value.auth.getUser();
    if (!authData.user) return window.alert("Sign in again to upload.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${authData.user.id}/${crypto.randomUUID()}/${safeName}`;
    const { error: storageError } = await setup.value.storage.from("private-notes").upload(path, file, { contentType: "application/pdf", upsert: false });
    if (storageError) return window.alert(storageError.message);
    const { data, error } = await setup.value.from("pdfs").insert({ user_id: authData.user.id, title: details.title, storage_path: path, original_filename: file.name, byte_size: file.size, tags: details.tags }).select("id,title,tags,is_pinned,updated_at").single();
    if (error) {
      await setup.value.storage.from("private-notes").remove([path]);
      return window.alert(error.message);
    }
    setDocuments((current) => [{ id: data.id, title: data.title, subject: details.subject || "Unsorted", tags: data.tags, pinned: data.is_pinned, updatedLabel: "Just now" }, ...current]);
  }

  async function togglePin(document: VaultDocument, pinned: boolean) {
    setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, pinned } : item));
    const setup = await getBrowserSupabaseClient();
    const { error } = setup.value ? await setup.value.from("pdfs").update({ is_pinned: pinned }).eq("id", document.id) : { error: new Error(setup.error) };
    if (error) setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, pinned: !pinned } : item));
  }

  return <VaultWorkspace documents={documents} subjectOptions={subjects} onUpload={upload} onOpen={(document) => router.push(`/app/vault/${document.id}`)} onPinChange={togglePin} />;
}
