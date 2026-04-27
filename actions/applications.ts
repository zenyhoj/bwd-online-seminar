"use server";

import { revalidatePath } from "next/cache";

import { getActionContext, parseFormData, withErrorHandling } from "@/actions/_helpers";
import { applicationSchema, applicationStatusSchema } from "@/schemas";
import type { ActionState } from "@/types";

export async function createApplicationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();
    const parsed = await parseFormData(applicationSchema, {
      lastName: formData.get("lastName"),
      firstName: formData.get("firstName"),
      middleInitial: formData.get("middleInitial"),
      sex: formData.get("sex"),
      age: formData.get("age"),
      address: formData.get("address"),
      cellphoneNumber: formData.get("cellphoneNumber"),
      numberOfUsers: formData.get("numberOfUsers")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const { data: seminarItems, error: seminarItemsError } = await supabase
      .from("seminar_items")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("is_active", true);

    if (seminarItemsError) {
      return { success: false, message: seminarItemsError.message };
    }

    const seminarItemIds = seminarItems?.map((item) => item.id) ?? [];
    if (seminarItemIds.length === 0) {
      return { success: false, message: "No seminar items are configured yet. Please contact the administrator." };
    }

    const { data: completedItems, error: completedItemsError } = await supabase
      .from("applicant_seminar_progress")
      .select("seminar_item_id")
      .eq("applicant_id", profile.id)
      .eq("completed", true)
      .in("seminar_item_id", seminarItemIds);

    if (completedItemsError) {
      return { success: false, message: completedItemsError.message };
    }

    if ((completedItems?.length ?? 0) < seminarItemIds.length) {
      return { success: false, message: "Complete the full seminar series before submitting your information." };
    }

    const middleInitial = parsed.data.middleInitial?.trim();
    const fullName = `${parsed.data.lastName}, ${parsed.data.firstName}${middleInitial ? ` ${middleInitial}` : ""}`.trim();

    const { error } = await supabase.from("applications").insert({
      organization_id: profile.organization_id,
      applicant_id: profile.id,
      full_name: fullName,
      gender: parsed.data.sex,
      age: parsed.data.age,
      address: parsed.data.address,
      cellphone_number: parsed.data.cellphoneNumber,
      number_of_users: parsed.data.numberOfUsers,
      service_type: "new_connection",
      seminar_completed: true,
      status: "submitted",
      submitted_at: new Date().toISOString()
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/applicant");
    revalidatePath("/applicant/applications/new");
    revalidatePath("/applicant/documents");
    revalidatePath("/applicant/payments");
    return { success: true, message: "Applicant information submitted successfully." };
  });
}

export async function updateApplicationStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase } = await getActionContext();
    const parsed = await parseFormData(applicationStatusSchema, {
      applicationId: formData.get("applicationId"),
      status: formData.get("status"),
      rejectionReason: formData.get("rejectionReason")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const { error } = await supabase
      .from("applications")
      .update({
        status: parsed.data.status,
        rejection_reason: parsed.data.rejectionReason,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", parsed.data.applicationId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Application status updated." };
  });
}
