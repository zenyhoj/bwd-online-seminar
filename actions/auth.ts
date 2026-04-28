"use server";

import { redirect } from "next/navigation";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { roleHome } from "@/lib/routes";
import { loginSchema, registerSchema } from "@/schemas";
import { parseFormData, withErrorHandling } from "@/actions/_helpers";
import { initialActionState } from "@/actions/state";
import type { ActionState, AppRole } from "@/types";

async function delayAuthenticationResponse() {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const parsed = await parseFormData(loginSchema, {
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (parsed.error) {
      return parsed.error;
    }

    const supabase = await createSupabaseServerClient();
    const { data: authResult, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      await delayAuthenticationResponse();
      return { success: false, message: "Invalid email or password." };
    }

    const user = authResult.user;

    if (!user) {
      await delayAuthenticationResponse();
      return { success: false, message: "Unable to resolve the signed-in user." };
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      await delayAuthenticationResponse();
      return { success: false, message: "This account is not authorized to access the system." };
    }

    const role = profile?.role as AppRole | undefined;

    return {
      success: true,
      message: "",
      redirectTo: role ? roleHome[role] : "/login"
    };
  });
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return withErrorHandling(async () => {
    const parsed = await parseFormData(registerSchema, {
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
      acceptPrivacyNotice: formData.get("acceptPrivacyNotice") === "on"
    });

    if (parsed.error) {
      return parsed.error;
    }

    const adminClient = createSupabaseAdminClient();
    const { data: organization } = await adminClient
      .from("organizations")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!organization) {
      return { success: false, message: "No water district organization is configured for registration yet." };
    }

    // Use admin client to create the user with email pre-confirmed,
    // so the applicant can log in immediately without clicking a verification link.
    const { data: authResult, error } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true
    });

    if (error || !authResult.user) {
      return { success: false, message: "Unable to create account with the supplied details." };
    }

    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authResult.user.id,
      organization_id: organization.id,
      role: "applicant",
      full_name: parsed.data.fullName
    });

    if (profileError) {
      return { success: false, message: profileError.message };
    }

    return {
      success: true,
      message: "Account created successfully. You can now sign in."
    };
  });
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
