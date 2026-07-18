import { createHmac, timingSafeEqual } from "node:crypto";

import { getInviteCookieSecret } from "@/lib/supabase/config";
import { loadZod } from "@/lib/supabase/runtime";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const inviteCookieName = "gate_os_beta_invite";
const inviteCookieLifetimeSeconds = 15 * 60;

export type InviteCookiePayload = {
  inviteId: string;
  expiresAt: number;
};

type InviteValidation = {
  invite_id: string;
};

function signInvitePayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function sameSignature(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createSignedInviteCookie(inviteId: string): { value: string; expiresAt: number; error: null } | { value: null; expiresAt: null; error: string } {
  const secret = getInviteCookieSecret();

  if (!secret) {
    return {
      value: null,
      expiresAt: null,
      error: "Invite validation is not configured. Add a 32-character GATE_OS_INVITE_COOKIE_SECRET.",
    };
  }

  const expiresAt = Date.now() + inviteCookieLifetimeSeconds * 1000;
  const encodedPayload = Buffer.from(JSON.stringify({ inviteId, expiresAt })).toString("base64url");
  const signature = signInvitePayload(encodedPayload, secret);

  return { value: `${encodedPayload}.${signature}`, expiresAt, error: null };
}

export function verifySignedInviteCookie(cookieValue: string | undefined): InviteCookiePayload | null {
  const secret = getInviteCookieSecret();

  if (!secret || !cookieValue) {
    return null;
  }

  const [encodedPayload, signature, unexpectedPart] = cookieValue.split(".");

  if (!encodedPayload || !signature || unexpectedPart || !sameSignature(signInvitePayload(encodedPayload, secret), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as InviteCookiePayload;

    if (
      typeof payload.inviteId !== "string" ||
      payload.inviteId.length === 0 ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function inviteCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(expiresAt),
  };
}

export async function validateInviteWithRpc(code: string): Promise<{ inviteId: string | null; error: string | null }> {
  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    return { inviteId: null, error: clientResult.error };
  }

  const { data, error } = await clientResult.value.rpc("validate_beta_invite", { p_code: code });

  if (error || !data) {
    return { inviteId: null, error: "That invitation code is not active. Check it and try again." };
  }

  const candidate = Array.isArray(data) ? data[0] : data;
  const zodResult = await loadZod();

  if (!zodResult.value) {
    return { inviteId: null, error: zodResult.error };
  }

  const schema = zodResult.value.object({
    invite_id: zodResult.value.string().trim().min(1).max(128),
  });
  const parsed = schema.safeParse(candidate) as
    | { success: true; data: InviteValidation }
    | { success: false; error: { issues: { message?: string }[] } };

  if (!parsed.success) {
    return { inviteId: null, error: "That invitation code is not active. Check it and try again." };
  }

  return { inviteId: parsed.data.invite_id, error: null };
}

export async function consumeInviteWithRpc(inviteId: string): Promise<string | null> {
  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    return clientResult.error;
  }

  const { error } = await clientResult.value.rpc("consume_beta_invite", { p_invite_id: inviteId });
  return error ? "This invitation cannot be completed. Please contact the GATE OS team." : null;
}

export async function hasActiveBetaAccess(): Promise<{ active: boolean; error: string | null }> {
  const clientResult = await getServerSupabaseClient();

  if (!clientResult.value) {
    return { active: false, error: clientResult.error };
  }

  const { data, error } = await clientResult.value.rpc("has_active_beta_access", {});

  if (error) {
    return { active: false, error: "We could not verify access to this workspace." };
  }

  const active = typeof data === "boolean" ? data : Boolean((data as { active?: boolean } | null)?.active);
  return { active, error: null };
}

export function safeNextPath(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/app";
}
