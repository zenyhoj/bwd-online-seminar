import Link from "next/link";

import { InspectionScheduleInlineEditor } from "@/components/admin/inspection-schedule-inline-editor";
import { InspectionForm } from "@/components/inspector/inspection-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type InspectionApplicationRelation = {
  full_name?: string;
  accredited_plumbers?: { full_name?: string } | null;
} | null;

type AdminInspectionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  return typeof searchParams?.[key] === "string" ? searchParams[key] : undefined;
}

function getPlumbingResult(plumbingApproved: boolean | null) {
  if (plumbingApproved === null) {
    return "Pending";
  }

  return plumbingApproved ? "Approved" : "Disapproved";
}

function matchesStatusFilter(statusFilter: string, inspectionStatus: string) {
  if (statusFilter === "all") {
    return true;
  }

  if (statusFilter === "needs_update") {
    return inspectionStatus === "scheduled" || inspectionStatus === "in_progress";
  }

  return inspectionStatus === statusFilter;
}

export default async function AdminInspectionsPage({ searchParams }: AdminInspectionsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = getStringParam(resolvedSearchParams, "q")?.trim() ?? "";
  const statusFilter = getStringParam(resolvedSearchParams, "status") ?? "all";
  const inspectorFilter = getStringParam(resolvedSearchParams, "inspector") ?? "all";
  const scheduledDateFilter = getStringParam(resolvedSearchParams, "scheduledDate") ?? "";
  const supabase = createSupabaseAdminClient();
  const profile = await getCurrentProfile();
  const { data: inspections } = await supabase
    .from("inspections")
    .select("*, applications(full_name, accredited_plumbers(full_name))")
    .eq("organization_id", profile.organization_id)
    .order("scheduled_at", { ascending: false });

  const allInspectionRows = inspections ?? [];
  const inspectorOptions = Array.from(
    new Set(
      allInspectionRows
        .map((inspection) => inspection.inspector_name?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));
  const inspectionRows = allInspectionRows.filter((inspection) => {
    const applicantName = ((inspection.applications as InspectionApplicationRelation)?.full_name ?? "").toLowerCase();
    const inspectorName = (inspection.inspector_name ?? "").toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      applicantName.includes(q.toLowerCase()) ||
      inspectorName.includes(q.toLowerCase());
    const matchesStatus = matchesStatusFilter(statusFilter, inspection.status);
    const matchesInspector = inspectorFilter === "all" || inspection.inspector_name === inspectorFilter;
    const matchesScheduledDate =
      scheduledDateFilter.length === 0 || (inspection.scheduled_at?.slice(0, 10) ?? "") === scheduledDateFilter;

    return matchesQuery && matchesStatus && matchesInspector && matchesScheduledDate;
  });
  const selectedId = getStringParam(resolvedSearchParams, "selected") ?? inspectionRows[0]?.id ?? "";
  const selectedInspection = inspectionRows.find((inspection) => inspection.id === selectedId) ?? inspectionRows[0] ?? null;
  const pendingCount = inspectionRows.filter((inspection) => inspection.status === "scheduled").length;
  const approvedCount = inspectionRows.filter((inspection) => inspection.status === "approved").length;
  const rescheduledCount = inspectionRows.filter((inspection) => inspection.status === "rescheduled").length;
  const quickFilters = [
    { value: "all", label: "All", count: allInspectionRows.length },
    {
      value: "needs_update",
      label: "Needs update",
      count: allInspectionRows.filter(
        (inspection) => inspection.status === "scheduled" || inspection.status === "in_progress"
      ).length
    },
    {
      value: "approved",
      label: "Approved",
      count: allInspectionRows.filter((inspection) => inspection.status === "approved").length
    },
    {
      value: "rejected",
      label: "Disapproved",
      count: allInspectionRows.filter((inspection) => inspection.status === "rejected").length
    },
    {
      value: "rescheduled",
      label: "Rescheduled",
      count: allInspectionRows.filter((inspection) => inspection.status === "rescheduled").length
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Inspection schedule</h1>
        <p className="text-sm text-muted-foreground">
          Review schedules, record inspector feedback, and mark each inspection as approved or disapproved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total inspections</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{inspectionRows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Awaiting update</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{pendingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved / rescheduled</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{approvedCount + rescheduledCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px_180px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search applicant or inspector"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="needs_update">Needs update</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Disapproved</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
            <select
              name="inspector"
              defaultValue={inspectorFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All inspectors</option>
              {inspectorOptions.map((inspectorName) => (
                <option key={inspectorName} value={inspectorName}>
                  {inspectorName}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="scheduledDate"
              defaultValue={scheduledDateFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <Button type="submit">Apply filters</Button>
              <Button asChild variant="outline">
                <Link href="/admin/inspections">Clear</Link>
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                asChild
                variant={statusFilter === filter.value ? "secondary" : "outline"}
                size="sm"
              >
                <Link
                  href={
                    (
                      `/admin/inspections?${new URLSearchParams({
                        ...(q ? { q } : {}),
                        ...(filter.value !== "all" ? { status: filter.value } : {}),
                        ...(inspectorFilter !== "all" ? { inspector: inspectorFilter } : {}),
                        ...(scheduledDateFilter ? { scheduledDate: scheduledDateFilter } : {})
                      }).toString()}`
                    ) as never
                  }
                >
                  {filter.label} ({filter.count})
                </Link>
              </Button>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plumbing result</TableHead>
                <TableHead>Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectionRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No inspections have been scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                inspectionRows.map((inspection) => {
                  return (
                    <TableRow key={inspection.id} className={inspection.id === selectedInspection?.id ? "bg-accent/10" : undefined}>
                      <TableCell>
                        <Link
                          href={(
                            `/admin/inspections?${new URLSearchParams({
                              ...(q ? { q } : {}),
                              ...(statusFilter !== "all" ? { status: statusFilter } : {}),
                              ...(inspectorFilter !== "all" ? { inspector: inspectorFilter } : {}),
                              ...(scheduledDateFilter ? { scheduledDate: scheduledDateFilter } : {}),
                              selected: inspection.id
                            }).toString()}#inspection-editor`
                          ) as never}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {(inspection.applications as InspectionApplicationRelation)?.full_name ?? "Unknown"}
                        </Link>
                      </TableCell>
                      <TableCell>{inspection.inspector_name ?? "Unassigned"}</TableCell>
                      <TableCell>
                        <InspectionScheduleInlineEditor
                          inspectionId={inspection.id}
                          scheduledAt={inspection.scheduled_at}
                        />
                      </TableCell>
                      <TableCell><StatusBadge status={inspection.status} /></TableCell>
                      <TableCell>
                        <StatusBadge status={getPlumbingResult(inspection.plumbing_approved)} />
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/reports/${inspection.id}`} className="text-primary hover:underline">
                          Open report
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInspection ? (
        <Card id="inspection-editor">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>
                  {(selectedInspection.applications as InspectionApplicationRelation)?.full_name ?? "Unknown applicant"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedInspection.inspector_name ?? "Unassigned inspector"} • Scheduled{" "}
                  {formatDateTime(selectedInspection.scheduled_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select an applicant name above to open the findings form for that inspection.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedInspection.status} />
                <StatusBadge status={getPlumbingResult(selectedInspection.plumbing_approved)} />
              </div>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              You are editing this inspection now. Update the schedule, result, and material list below.
            </div>
          </CardHeader>
          <CardContent>
             <InspectionForm
               inspection={selectedInspection}
               pulledPlumberName={
                 (selectedInspection.applications as InspectionApplicationRelation)?.accredited_plumbers?.full_name ?? null
               }
             />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
