"use server";

import { unstable_rethrow } from "next/navigation";
import { ZodSchema } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils";
import type { ActionState } from "@/types";

export async function parseFormData<T extends Record<string, unknown>, U>(
  schema: ZodSchema<U>,
  values: T
) {
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).filter(
        ([, value]) => Array.isArray(value) && value.length > 0
      )
    ) as Record<string, string[]>;
    const firstError = Object.values(fieldErrors).flat()[0];

    return {
      data: null,
      error: {
        success: false,
        message: firstError ?? "Please review the highlighted fields.",
        fieldErrors
      } satisfies ActionState
    };
  }

  return { data: parsed.data, error: null };
}

export async function withErrorHandling<T>(callback: () => Promise<T>) {
  try {
    return await callback();
  } catch (error) {
    unstable_rethrow(error);

    return {
      success: false,
      message: getErrorMessage(error)
    } satisfies ActionState;
  }
}

export async function getActionContext() {
  const supabase = createSupabaseAdminClient();
  const profile = await getCurrentProfile();

  return {
    supabase,
    profile
  };
}
