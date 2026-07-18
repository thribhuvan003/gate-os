import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function DELETE() {
  const sessionResult = await getServerSupabaseClient();
  if (!sessionResult.value) return NextResponse.json({ ok: false }, { status: 503 });
  const { data } = await sessionResult.value.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ ok: false }, { status: 503 });
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const bucket = admin.storage.from("private-notes");
  const { data: directories } = await bucket.list(userId, { limit: 1000 });
  const paths: string[] = [];
  for (const directory of directories ?? []) {
    const prefix = `${userId}/${directory.name}`;
    const { data: files } = await bucket.list(prefix, { limit: 1000 });
    paths.push(...(files ?? []).map((file) => `${prefix}/${file.name}`));
  }
  if (paths.length) await bucket.remove(paths);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
