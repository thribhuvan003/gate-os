import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ code?: string | string[]; error?: string | string[] }>;
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

  return <LoginForm initialInviteCode={code} initialError={error} />;
}
