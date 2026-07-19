import type { Metadata } from "next";

import { LoginForm } from "./login-form";
import { safeNextPath } from "@/lib/auth/invite";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ code?: string | string[]; error?: string | string[]; next?: string | string[] }>;
};

const errorCopy: Record<string, string> = {
  access: "This account does not have an active beta invitation yet.",
  callback: "We could not complete that sign-in. Please try again.",
  session: "Your sign-in session expired before it could be confirmed. Please try again.",
  setup: "Authentication is not configured for this deployment yet.",
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const code = firstValue(params.code).slice(0, 96);
  const error = errorCopy[firstValue(params.error)] ?? "";
  const nextPath = safeNextPath(firstValue(params.next) || null);

  return <LoginForm initialInviteCode={code} initialError={error} nextPath={nextPath} />;
}
