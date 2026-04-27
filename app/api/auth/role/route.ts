import { NextResponse } from "next/server";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_active) {
    return NextResponse.json({ message: "This account is not authorized to access the system." }, { status: 403 });
  }

  return NextResponse.json({ role: profile.role });
}
