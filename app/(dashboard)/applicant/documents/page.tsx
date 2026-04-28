import { redirect } from "next/navigation";
import { ApplicantSwitcher } from "@/components/applicant/applicant-switcher";
import { ApplicationSwitcher } from "@/components/applicant/application-switcher";
import { DocumentUploadForm } from "@/components/applicant/document-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDocumentDownloadHref } from "@/lib/document-links";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { documentTypeLabels } from "@/lib/constants";
import { getApplicants, getApplicantApplications } from "@/lib/queries";
import type { DocumentType } from "@/types";

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
  // Use admin client — ownership is already verified via getApplicants().
  const supabase = createSupabaseAdminClient();

  const applicants = await getApplicants();
  const selectedApplicantId = getStringParam(resolvedSearchParams, "applicant") ?? applicants[0]?.id ?? null;

  if (!selectedApplicantId && applicants.length === 0) {
    redirect("/applicant");
  }

  const effectiveApplicantId = selectedApplicantId ?? applicants[0]?.id ?? null;
  const applicationList = effectiveApplicantId ? await getApplicantApplications(effectiveApplicantId) : [];

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
      <ApplicantSwitcher
        applicants={applicants}
        selectedApplicantId={effectiveApplicantId}
        basePath="/applicant/documents"
        queryParams={{ application: selectedApplicationId ?? undefined }}
        title="Choose applicant"
        description="Switch between applicants to view their documents."
      />
      {applicationList.length > 1 ? (
        <ApplicationSwitcher
          applications={applicationList}
          selectedApplicationId={application?.id}
          basePath="/applicant/documents"
          queryParams={{ applicant: effectiveApplicantId ?? undefined }}
          title="Choose application"
          description="This applicant has multiple applications. Choose one to view documents."
        />
      ) : null}
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
