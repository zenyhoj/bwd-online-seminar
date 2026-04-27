import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DocumentDownloadRouteProps = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_request: Request, { params }: DocumentDownloadRouteProps) {
  const { documentId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select("id, file_path")
    .eq("id", documentId)
    .single();

  if (error || !document) {
    return NextResponse.json({ message: "Document not found." }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("application-documents")
    .createSignedUrl(document.file_path, 60, {
      download: true
    });

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json({ message: "Unable to generate secure download link." }, { status: 500 });
  }

  const response = NextResponse.redirect(signedUrl.signedUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
