"use server";

import { revalidatePath } from "next/cache";

import { getActionContext, parseFormData, withErrorHandling } from "@/actions/_helpers";
import { concessionaireSchema } from "@/schemas";
import type { ActionState } from "@/types";

export async function createConcessionaireAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();
    const parsed = await parseFormData(concessionaireSchema, {
      applicationId: formData.get("applicationId"),
      profileId: formData.get("profileId"),
      concessionaireNumber: formData.get("concessionaireNumber"),
      connectionDate: formData.get("connectionDate"),
      meterNumber: formData.get("meterNumber")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("id, inhouse_installation_completed")
      .eq("id", parsed.data.applicationId)
      .eq("organization_id", profile.organization_id)
      .single();

    if (applicationError || !application) {
      return { success: false, message: applicationError?.message ?? "Application not found." };
    }

    if (!application.inhouse_installation_completed) {
      return {
        success: false,
        message: "Mark the inhouse installation as complete before converting this applicant to a concessionaire."
      };
    }

    const { error } = await supabase.from("concessionaires").insert({
      organization_id: profile.organization_id,
      application_id: parsed.data.applicationId,
      profile_id: parsed.data.profileId,
      concessionaire_number: parsed.data.concessionaireNumber,
      connection_date: parsed.data.connectionDate,
      meter_number: parsed.data.meterNumber,
      created_by: profile.id
    });

    if (error) {
      return { success: false, message: error.message };
    }

    await supabase
      .from("applications")
      .update({ status: "converted" })
      .eq("id", parsed.data.applicationId);

    revalidatePath("/admin/concessionaires");
    return { success: true, message: "Concessionaire record created." };
  });
}
