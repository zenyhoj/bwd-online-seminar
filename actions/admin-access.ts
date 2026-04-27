"use server";

import { revalidatePath } from "next/cache";

import { parseFormData, withErrorHandling } from "@/actions/_helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { staffInviteSchema } from "@/schemas";
import type { ActionState } from "@/types";

export async function inviteStaffAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const profile = await getCurrentProfile();

    if (profile.role !== "admin") {
      return { success: false, message: "Only administrators can invite staff accounts." };
    }

    const parsed = await parseFormData(staffInviteSchema, {
      email: formData.get("email"),
      fullName: formData.get("fullName"),
      role: formData.get("role")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const adminClient = createSupabaseAdminClient();
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("full_name", parsed.data.fullName)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, message: "A staff profile with this name already exists in your organization." };
    }

    const inviteResult = await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role
      }
    });

    if (inviteResult.error || !inviteResult.data.user) {
      return {
        success: false,
        message: inviteResult.error?.message ?? "Unable to send the staff invitation."
      };
    }

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: inviteResult.data.user.id,
        organization_id: profile.organization_id,
        role: parsed.data.role,
        full_name: parsed.data.fullName,
        is_active: true,
        customer_type: null
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return { success: false, message: profileError.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/access");

    return {
      success: true,
      message: `Admin invitation sent to ${parsed.data.email}.`
    };
  });
}
