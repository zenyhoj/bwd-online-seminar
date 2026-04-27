import { ApplicationSwitcher } from "@/components/applicant/application-switcher";
import { DocumentUploadForm } from "@/components/applicant/document-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDocumentDownloadHref } from "@/lib/document-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { documentTypeLabels } from "@/lib/constants";
import type { Application, DocumentType } from "@/types";

type ApplicantDocumentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  return typeof searchParams?.[key] === "string" ? searchParams[key] : undefined;
}

export default async function ApplicantDocumentsPage({ searchParams }: ApplicantDocumentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, full_name, service_type, status, submitted_at, organization_id, applicant_id, accredited_plumber_id, cellphone_number, gender, age, address, number_of_users, inhouse_installation_completed, inhouse_installation_completed_at, inhouse_installation_updated_by, seminar_completed, reviewed_at, rejection_reason, created_at, updated_at")
    .eq("applicant_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Application[]>();

  const applicationList = applications ?? [];
  const selectedApplicationId = getStringParam(resolvedSearchParams, "application") ?? applicationList[0]?.id ?? null;
  const application = applicationList.find((item) => item.id === selectedApplicationId) ?? applicationList[0] ?? null;

  const { data: documents } = application
    ? await supabase.from("documents").select("*").eq("application_id", application.id).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">Upload and monitor document verification status.</p>
      </div>
      <ApplicationSwitcher
        applications={applicationList}
        selectedApplicationId={application?.id}
        basePath="/applicant/documents"
        title="Choose applicant"
        description="Switch between applicant records to upload and review the correct documents."
      />
      {application ? <DocumentUploadForm applicationId={application.id} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(documents ?? []).map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{documentTypeLabels[document.document_type as DocumentType]}</TableCell>
                  <TableCell>
                    <a href={getDocumentDownloadHref(document.id)} className="text-primary hover:underline">
                      {document.file_name}
                    </a>
                  </TableCell>
                  <TableCell><StatusBadge status={document.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
