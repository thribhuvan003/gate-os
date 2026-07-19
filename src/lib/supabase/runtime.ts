import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

type DynamicSupabaseClient = SupabaseClient;

type SupabaseSsrModule = {
  createBrowserClient: (url: string, key: string) => DynamicSupabaseClient;
  createServerClient: (url: string, key: string, options: unknown) => DynamicSupabaseClient;
};

type ZodIssue = { message?: string };
export type ZodSchema<T> = {
  safeParse: (value: unknown) =>
    | { success: true; data: T }
    | { success: false; error: { issues: ZodIssue[] } };
};

type ZodStringSchema = ZodSchema<string> & {
  trim: () => ZodStringSchema;
  min: (length: number, message?: string) => ZodStringSchema;
  max: (length: number, message?: string) => ZodStringSchema;
  email: (message?: string) => ZodStringSchema;
  regex: (expression: RegExp, message?: string) => ZodStringSchema;
  optional: () => ZodSchema<string | undefined>;
};

type ZodRuntime = {
  string: () => ZodStringSchema;
  object: <T extends Record<string, ZodSchema<unknown>>>(
    shape: T,
  ) => ZodSchema<{ [K in keyof T]: T[K] extends ZodSchema<infer Value> ? Value : never }>;
};

export type RuntimeResult<T> =
  | { value: T; error: null }
  | { value: null; error: string };

export async function loadSupabaseSsr(): Promise<RuntimeResult<SupabaseSsrModule>> {
  return { value: { createBrowserClient, createServerClient } as unknown as SupabaseSsrModule, error: null };
}

export async function loadZod(): Promise<RuntimeResult<ZodRuntime>> {
  return { value: z as unknown as ZodRuntime, error: null };
}

export type { DynamicSupabaseClient };
