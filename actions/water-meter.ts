"use server";

import { revalidatePath } from "next/cache";

import { getActionContext, parseFormData, withErrorHandling } from "@/actions/_helpers";
import { waterMeterScheduleSchema } from "@/schemas/water-meter";
import { validateBusinessSchedule } from "@/lib/business-hours";
import type { ActionState } from "@/types";

export async function scheduleWaterMeterAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();
    const parsed = await parseFormData(waterMeterScheduleSchema, {
      applicationId: formData.get("applicationId"),
      scheduledAt: formData.get("scheduledAt"),
      minDate: formData.get("minDate") || undefined
    });

    if (parsed.error) {
      return parsed.error;
    }

    if (parsed.data.minDate && parsed.data.scheduledAt < parsed.data.minDate) {
      return { success: false, message: "Installation date cannot be before the payment date." };
    }

    const scheduleValidation = validateBusinessSchedule(parsed.data.scheduledAt);
    if (!scheduleValidation.valid) {
      return { success: false, message: scheduleValidation.message ?? "Invalid schedule." };
    }

    const { error } = await supabase
      .from("applications")
      .update({
        water_meter_installation_scheduled_at: new Date(parsed.data.scheduledAt).toISOString(),
        water_meter_installation_scheduled_by: profile.id
      })
      .eq("id", parsed.data.applicationId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/reports/${parsed.data.applicationId}`);

    return { success: true, message: "Water meter installation scheduled successfully." };
  });
}

export async function markWaterMeterInstalledAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();
    const applicationId = formData.get("applicationId");

    if (typeof applicationId !== "string" || !applicationId) {
      return { success: false, message: "Invalid application ID." };
    }

    const { error } = await supabase
      .from("applications")
      .update({
        water_meter_installed_at: new Date().toISOString()
      })
      .eq("id", applicationId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/reports/${applicationId}`);

    return { success: true, message: "Water meter installation marked as complete." };
  });
}
