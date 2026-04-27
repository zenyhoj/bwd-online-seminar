"use server";

import { revalidatePath } from "next/cache";

import { getActionContext, parseFormData, withErrorHandling } from "@/actions/_helpers";
import { deleteSeminarItemSchema, seminarItemSchema, seminarProgressSchema } from "@/schemas";
import type { ActionState } from "@/types";

export async function updateSeminarProgressAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();
    const parsed = await parseFormData(seminarProgressSchema, {
      seminarItemId: formData.get("seminarItemId"),
      completed: formData.get("completed")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const { data: seminarItem, error: seminarItemError } = await supabase
      .from("seminar_items")
      .select("id")
      .eq("id", parsed.data.seminarItemId)
      .eq("organization_id", profile.organization_id)
      .eq("is_active", true)
      .single();

    if (seminarItemError || !seminarItem) {
      return { success: false, message: "This seminar item is no longer available." };
    }

    const { error } = await supabase.from("applicant_seminar_progress").upsert(
      {
        organization_id: profile.organization_id,
        applicant_id: profile.id,
        seminar_item_id: parsed.data.seminarItemId,
        completed: parsed.data.completed,
        completed_at: parsed.data.completed ? new Date().toISOString() : null
      },
      { onConflict: "applicant_id,seminar_item_id" }
    );

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/applicant/seminar");
    revalidatePath("/applicant/applications/new");
    revalidatePath("/applicant");
    return { success: true, message: "Seminar item marked as complete." };
  });
}

export async function createSeminarItemAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();

    if (profile.role !== "admin") {
      return { success: false, message: "Only administrators can manage seminar items." };
    }

    const parsed = await parseFormData(seminarItemSchema, {
      title: formData.get("title"),
      description: formData.get("description"),
      mediaType: formData.get("mediaType"),
      mediaUrl: formData.get("mediaUrl"),
      displayOrder: formData.get("displayOrder")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const { error } = await supabase.from("seminar_items").insert({
      organization_id: profile.organization_id,
      title: parsed.data.title,
      description: parsed.data.description,
      media_type: parsed.data.mediaType,
      media_url: parsed.data.mediaUrl || null,
      display_order: parsed.data.displayOrder,
      created_by: profile.id
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/seminars");
    revalidatePath("/applicant/seminar");
    return { success: true, message: "Seminar item added." };
  });
}

export async function deleteSeminarItemAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const { supabase, profile } = await getActionContext();

    if (profile.role !== "admin") {
      return { success: false, message: "Only administrators can manage seminar items." };
    }

    const parsed = await parseFormData(deleteSeminarItemSchema, {
      seminarItemId: formData.get("seminarItemId")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const { error } = await supabase
      .from("seminar_items")
      .delete()
      .eq("id", parsed.data.seminarItemId)
      .eq("organization_id", profile.organization_id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/seminars");
    revalidatePath("/applicant/seminar");
    return { success: true, message: "Seminar item deleted." };
  });
}
