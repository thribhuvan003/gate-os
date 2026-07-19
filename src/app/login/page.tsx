import type { Metadata } from "next";

import { safeNextPath } from "@/lib/auth/invite";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in or create an account",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
};

const errorCopy: Record<string, string> = {
  callback: "We could not complete that sign-in. Please try again.",
  session: "Your sign-in session expired before it could be confirmed. Please try again.",
  setup: "Authentication is not configured for this deployment yet.",
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = errorCopy[firstValue(params.error)] ?? "";
  const nextPath = safeNextPath(firstValue(params.next) || null);

  return <LoginForm initialError={error} nextPath={nextPath} />;
}
