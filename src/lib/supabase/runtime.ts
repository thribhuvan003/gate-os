import type { SupabaseClient } from "@supabase/supabase-js";

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

const dynamicImport = new Function(
  "moduleName",
  "return import(moduleName)",
) as (moduleName: string) => Promise<unknown>;

export async function loadSupabaseSsr(): Promise<RuntimeResult<SupabaseSsrModule>> {
  try {
    const loadedModule = (await dynamicImport("@supabase/ssr")) as Partial<SupabaseSsrModule>;

    if (typeof loadedModule.createBrowserClient !== "function" || typeof loadedModule.createServerClient !== "function") {
      return { value: null, error: "@supabase/ssr is installed but is not a supported version." };
    }

    return { value: loadedModule as SupabaseSsrModule, error: null };
  } catch {
    return {
      value: null,
      error: "Authentication packages are missing. Install @supabase/ssr, @supabase/supabase-js, and zod before enabling login.",
    };
  }
}

export async function loadZod(): Promise<RuntimeResult<ZodRuntime>> {
  try {
    const loadedModule = (await dynamicImport("zod")) as { z?: ZodRuntime };

    if (!loadedModule.z) {
      return { value: null, error: "zod is installed but could not be loaded." };
    }

    return { value: loadedModule.z, error: null };
  } catch {
    return {
      value: null,
      error: "Authentication validation is unavailable. Install zod before enabling login.",
    };
  }
}

export type { DynamicSupabaseClient };
