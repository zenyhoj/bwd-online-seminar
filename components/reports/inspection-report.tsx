import { InspectionReportMap } from "@/components/reports/inspection-report-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Application, Inspection } from "@/types";

type InspectionReportProps = {
  application: Application;
  inspection: Inspection;
};

export function InspectionReport({ application, inspection }: InspectionReportProps) {
  return (
    <div className="a4-page space-y-6 bg-white p-10 text-slate-900">
      <header className="border-b pb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">BWD Online Water Application System</p>
        <h1 className="mt-2 text-3xl font-bold">Inhouse Plumbing Inspection Report</h1>
        <p className="mt-1 text-sm text-slate-500">Printable A4 inspection form for approval processing.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Applicant details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {application.full_name}</p>
            <p><strong>Address:</strong> {application.address}</p>
            <p><strong>Gender:</strong> {application.gender}</p>
            <p><strong>Age:</strong> {application.age}</p>
            <p><strong>Service type:</strong> {application.service_type.replaceAll("_", " ")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Inspection details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Status:</strong> {inspection.status.replaceAll("_", " ")}</p>
            <p><strong>Inspector:</strong> {inspection.inspector_name ?? "N/A"}</p>
            <p><strong>Scheduled:</strong> {formatDateTime(inspection.scheduled_at)}</p>
            <p><strong>Inspected:</strong> {formatDateTime(inspection.inspected_at)}</p>
            <p><strong>Plumbing:</strong> {inspection.plumbing_approved ? "Approved" : "Rejected"}</p>
            <p><strong>Plumber:</strong> {inspection.plumber_name ?? "N/A"}</p>
            <p><strong>Reference account number:</strong> {inspection.reference_account_number ?? "N/A"}</p>
            <p><strong>Reference account name:</strong> {inspection.reference_account_name ?? "N/A"}</p>
            <p><strong>Account number:</strong> {inspection.account_number ?? "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Inspector remarks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7">{inspection.remarks ?? "No remarks recorded."}</CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Material list</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-line text-sm leading-7">
          {inspection.material_list ?? "No material list recorded."}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Location map</CardTitle>
        </CardHeader>
        <CardContent>
          {inspection.latitude !== null && inspection.longitude !== null ? (
            <InspectionReportMap
              latitude={inspection.latitude}
              longitude={inspection.longitude}
              applicantName={application.full_name}
            />
          ) : (
            <p className="text-sm text-slate-500">Coordinates have not been recorded for this inspection.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
