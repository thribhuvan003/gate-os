"use client";

import { useState } from "react";
import { RevisionWorkspace, type RevisionItem } from "@/components/workspace";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function RevisionClient({ initialItems }: { initialItems: RevisionItem[] }) {
  const [items, setItems] = useState(initialItems);
  async function update(item: RevisionItem, values: Record<string, unknown>, local: Partial<RevisionItem>) {
    const previous = items;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...local } : entry));
    const setup = await getBrowserSupabaseClient();
    const error = setup.value
      ? (await setup.value.from("revision_items").update(values).eq("id", item.id)).error
      : { message: setup.error ?? "Not signed in." };
    if (error) setItems(previous);
  }
  function complete(item: RevisionItem) { void update(item, { completed_at: new Date().toISOString(), status: "completed" }, { completed: true }); }
  function reschedule(item: RevisionItem) {
    const next = new Date(); next.setDate(next.getDate() + 3);
    void update(item, { due_on: next.toISOString().slice(0, 10), completed_at: null, status: "queued" }, { completed: false, dueLabel: "In 3 days" });
  }
  return <RevisionWorkspace items={items} onComplete={complete} onReschedule={reschedule} />;
}
