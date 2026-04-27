import Link from "next/link";

import { ConcessionaireForm } from "@/components/admin/concessionaire-form";
import { DocumentReviewForm } from "@/components/admin/document-review-form";
import { InspectionSchedulerForm } from "@/components/admin/inspection-scheduler-form";
import { InstallationSchedulerForm } from "@/components/admin/installation-scheduler-form";
import { PaymentSchedulerForm } from "@/components/admin/payment-scheduler-form";
import { InhouseInstallationForm } from "@/components/shared/inhouse-installation-form";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { parsePagination } from "@/lib/pagination";
import {
  getAccreditedPlumbers,
  getAdminApplicationDetail,
  getAdminApplicationsQueue,
  getOrganizationInspectors
} from "@/lib/queries";
import type { Document, Payment } from "@/types";

type AdminDashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  return typeof searchParams?.[key] === "string" ? searchParams[key] : undefined;
}

function getScheduledInspectionDate(record: Record<string, unknown>) {
  const inspections =
    ((record.inspections as { scheduled_at?: string | null }[] | undefined) ?? []).filter(
      (inspection) => Boolean(inspection.scheduled_at)
    );

  if (inspections.length === 0) {
    return null;
  }

  return inspections
    .map((inspection) => inspection.scheduled_at ?? null)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
}

function getLatestPaymentRecord(record: Record<string, unknown>) {
  const payments =
    ((record.payments as { id?: string; status?: string; paid_at?: string | null; due_date?: string | null }[] | undefined) ?? []);

  return [...payments].sort((a, b) => {
    const aTime = new Date(a.paid_at ?? a.due_date ?? 0).getTime();
    const bTime = new Date(b.paid_at ?? b.due_date ?? 0).getTime();
    return bTime - aTime;
  })[0] ?? null;
}

function getEffectiveApplicationStatus(record: Record<string, unknown>) {
  const status = String(record.status);
  const converted = (((record.concessionaires as { id: string }[] | undefined) ?? []).length ?? 0) > 0;
  const installationComplete = Boolean(record.inhouse_installation_completed);
  const latestPayment = getLatestPaymentRecord(record);

  if (converted || status === "converted") {
    return "converted";
  }

  if (latestPayment?.status === "paid" && installationComplete) {
    return "approved";
  }

  return status;
}

function nextAction(record: Record<string, unknown>) {
  const status = getEffectiveApplicationStatus(record);
  const inspections =
    ((record.inspections as {
      id: string;
      status?: string;
      plumbing_approved?: boolean | null;
      scheduled_at?: string | null;
    }[] | undefined) ?? []);
  const payments = ((record.payments as { id: string }[] | undefined) ?? []).length;
  const converted = (((record.concessionaires as { id: string }[] | undefined) ?? []).length ?? 0) > 0;
  const hasApprovedInspection = inspections.some(
    (inspection) => inspection.status === "approved"
  );
  const hasScheduledInspection = inspections.length > 0;
  const installationComplete = Boolean(record.inhouse_installation_completed);

  if (converted || status === "converted") return "Completed";
  if (!hasScheduledInspection) return "Schedule inspection";
  if (!hasApprovedInspection) return "Await inspection result";
  if (payments === 0) return "Schedule payment";
  if (!installationComplete) return "Mark installation complete";
  if (status === "approved") return "Convert account";
  return "Review payment and conversion";
}

function queueStage(record: Record<string, unknown>) {
  const status = getEffectiveApplicationStatus(record);
  const inspections =
    ((record.inspections as {
      id: string;
      status?: string;
      plumbing_approved?: boolean | null;
      scheduled_at?: string | null;
    }[] | undefined) ?? []);
  const payments = ((record.payments as { id: string }[] | undefined) ?? []).length;
  const converted = (((record.concessionaires as { id: string }[] | undefined) ?? []).length ?? 0) > 0;
  const hasApprovedInspection = inspections.some(
    (inspection) => inspection.status === "approved"
  );
  const hasScheduledInspection = inspections.length > 0;
  const installationComplete = Boolean(record.inhouse_installation_completed);

  if (converted || status === "converted") return "completed";
  if (!hasScheduledInspection) return "for-inspection";
  if (!hasApprovedInspection) return "under-review";
  if (payments === 0) return "for-payment";
  if (!installationComplete) return "for-installation";
  if (status === "approved") return "for-conversion";
  return "under-review";
}

function queueStageLabel(stage: string) {
  switch (stage) {
    case "for-inspection":
      return "For inspection";
    case "under-review":
      return "Under review";
    case "for-payment":
      return "For payment";
    case "for-installation":
      return "For installation";
    case "for-conversion":
      return "For conversion";
    case "completed":
      return "Completed";
    default:
      return "Under review";
  }
}

function workflowStepState({
  inspections,
  payments,
  applicationStatus,
  installationCompleted
}: {
  inspections: { status?: string; scheduled_at?: string | null }[];
  payments: Payment[];
  applicationStatus: string;
  installationCompleted: boolean;
}) {
  const hasScheduledInspection = inspections.length > 0;
  const hasApprovedInspection = inspections.some((inspection) => inspection.status === "approved");
  const hasPayment = payments.length > 0;

  return {
    inspection: hasApprovedInspection ? "Complete" : hasScheduledInspection ? "Scheduled" : "Pending",
    payment: hasPayment ? "Scheduled" : hasApprovedInspection ? "Ready" : "Waiting",
    installation: installationCompleted ? "Complete" : hasPayment ? "Ready" : "Waiting",
    conversion:
      applicationStatus === "converted" ? "Complete" : applicationStatus === "approved" ? "Ready" : "Waiting"
  };
}

function StageTable({
  title,
  description,
  records,
  selectedId,
  page,
  pageSize,
  q,
  workflow
}: {
  title: string;
  description: string;
  records: Record<string, unknown>[];
  selectedId: string;
  page: number;
  pageSize: number;
  q: string;
  workflow: string;
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-sm font-medium text-foreground">
            {records.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inspection schedule</TableHead>
              <TableHead>Installation</TableHead>
              <TableHead>Next action</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const isSelected = String(record.id) === selectedId;
              const query = new URLSearchParams();
              query.set("page", String(page));
              query.set("pageSize", String(pageSize));
              if (q) query.set("q", q);
              if (workflow && workflow !== "all") query.set("workflow", workflow);
              query.set("selected", String(record.id));

              return (
                <TableRow
                  key={String(record.id)}
                  className={isSelected ? "border-l-4 border-l-primary bg-primary/5" : "hover:bg-muted/20"}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{String(record.full_name)}</p>
                      <p className="text-xs text-muted-foreground">{String(record.service_type).replaceAll("_", " ")}</p>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={getEffectiveApplicationStatus(record)} /></TableCell>
                  <TableCell>{formatDateTime(getScheduledInspectionDate(record))}</TableCell>
                  <TableCell>{Boolean(record.inhouse_installation_completed) ? "Complete" : "Pending"}</TableCell>
                  <TableCell>{nextAction(record)}</TableCell>
                  <TableCell>{formatDateTime((record.submitted_at as string | null | undefined) ?? null)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant={isSelected ? "secondary" : "outline"} size="sm">
                      <Link href={`/admin?${query.toString()}` as never}>{isSelected ? "Selected" : "Manage"}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const parsedPagination = parsePagination(resolvedSearchParams);
  const pagination = {
    ...parsedPagination,
    pageSize: getStringParam(resolvedSearchParams, "pageSize") ? parsedPagination.pageSize : 5
  };
  const q = getStringParam(resolvedSearchParams, "q") ?? "";
  const workflow = getStringParam(resolvedSearchParams, "workflow") ?? "all";

  const [applications, inspectors, plumbers] = await Promise.all([
    getAdminApplicationsQueue(pagination, { q, workflow }),
    getOrganizationInspectors(),
    getAccreditedPlumbers()
  ]);
  const searchMatchesAcrossAllStages =
    q && workflow !== "all"
      ? await getAdminApplicationsQueue({ page: 1, pageSize: 1000 }, { q, workflow: "all" })
      : null;

  const selectedId = getStringParam(resolvedSearchParams, "selected") ?? String(applications.data[0]?.id ?? "");
  const selectedApplication = selectedId ? await getAdminApplicationDetail(selectedId) : null;
  const hasActiveFilters = Boolean(q) || workflow !== "all";
  const noQueueResults = applications.data.length === 0;
  const hasMatchesInOtherStages = Boolean(searchMatchesAcrossAllStages && searchMatchesAcrossAllStages.count > 0);
  const showStageTables = workflow === "all";

  const readyForInspection = applications.data.filter((item) => {
    const inspections = ((item.inspections as { id?: string }[] | undefined) ?? []);
    return inspections.length === 0;
  }).length;
  const readyForPayment = applications.data.filter((item) => {
    const inspections = ((item.inspections as { status?: string }[] | undefined) ?? []);
    const payments = ((item.payments as { id: string }[] | undefined) ?? []).length;
    return inspections.some((inspection) => inspection.status === "approved") && payments === 0;
  }).length;
  const readyForConversionEffective = applications.data.filter((item) => getEffectiveApplicationStatus(item as Record<string, unknown>) === "approved").length;
  const workflowStages = [
    {
      key: "for-inspection",
      title: "For inspection",
      description: "Applicants ready to be scheduled for inspection."
    },
    {
      key: "under-review",
      title: "Under review",
      description: "Applicants with inspection activity still being reviewed."
    },
    {
      key: "for-payment",
      title: "For payment",
      description: "Applicants with approved inspections waiting for office payment scheduling."
    },
    {
      key: "for-installation",
      title: "For installation",
      description: "Applicants with payment scheduled and waiting for installation completion."
    },
    {
      key: "for-conversion",
      title: "For conversion",
      description: "Applicants ready for final conversion."
    },
    {
      key: "completed",
      title: "Completed",
      description: "Applicants already converted and finished."
    }
  ] as const;
  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const stage of workflowStages) grouped.set(stage.key, []);
  for (const item of applications.data as Record<string, unknown>[]) {
    const stage = queueStage(item);
    grouped.set(stage, [...(grouped.get(stage) ?? []), item]);
  }
  const visibleStages =
    workflow === "all" ? workflowStages : workflowStages.filter((stage) => stage.key === workflow);

  const selectedDocuments = ((selectedApplication?.documents as Document[] | undefined) ?? []);
  const selectedPayments = ((selectedApplication?.payments as Payment[] | undefined) ?? []);
  const latestSelectedPayment = selectedPayments[0] ?? null;
  const canScheduleInstallation = latestSelectedPayment?.status === "paid";
  const selectedApplicationStatus = String(selectedApplication?.status ?? "");
  const selectedInspections =
    ((selectedApplication?.inspections as {
      id?: string;
      status?: string;
      plumbing_approved?: boolean | null;
      scheduled_at?: string | null;
    }[] | undefined) ?? []);
  const hasScheduledInspection = selectedInspections.length > 0;
  const latestSelectedInspection =
    [...selectedInspections]
      .sort((a, b) => new Date(b.scheduled_at ?? 0).getTime() - new Date(a.scheduled_at ?? 0).getTime())[0] ?? null;
  const canSchedulePayment = selectedInspections.some(
    (inspection) => inspection.status === "approved"
  );
  const canMarkInstallationComplete =
    selectedPayments.length > 0 ||
    ["payment_scheduled", "approved", "converted"].includes(selectedApplicationStatus);
  const inspectionWorkflowComplete =
    canSchedulePayment ||
    ["inspection_completed", "payment_scheduled", "approved", "converted"].includes(selectedApplicationStatus);
  const selectedInspectionSchedule =
    selectedInspections
      .map((inspection) => inspection.scheduled_at ?? null)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const selectedQueueStage = selectedApplication ? queueStage(selectedApplication) : "under-review";
  const stepState = workflowStepState({
    inspections: selectedInspections,
    payments: selectedPayments,
    applicationStatus: selectedApplicationStatus,
    installationCompleted: Boolean(selectedApplication?.inhouse_installation_completed)
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin queue</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage one application at a time without loading every workflow form at once.
          </p>
        </div>
        <Link href="/admin/inspections" className="text-sm text-primary hover:underline">
          View inspection reports
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total in queue</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{applications.count}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ready for inspection</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{readyForInspection}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ready for payment</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{readyForPayment}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ready for conversion</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{readyForConversionEffective}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search applicant name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <select
              name="workflow"
              defaultValue={workflow}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All workflow stages</option>
              {workflowStages.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.title}
                </option>
              ))}
            </select>
            <Button type="submit">Apply filters</Button>
          </form>

          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {workflowStages.map((stage) => {
              const query = new URLSearchParams();
              query.set("page", "1");
              query.set("pageSize", String(applications.pageSize));
              if (q) query.set("q", q);
              query.set("workflow", stage.key);
              if (selectedId) query.set("selected", selectedId);

              const isSelected = workflow === stage.key;

              return (
                <Link
                  key={stage.key}
                  href={`/admin?${query.toString()}` as never}
                  className={`rounded-lg border p-3 transition ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/80 bg-background/70 hover:border-primary/40"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{stage.title}</p>
                  <p className="mt-2 text-2xl font-semibold">{grouped.get(stage.key)?.length ?? 0}</p>
                </Link>
              );
            })}
            {workflow !== "all" ? (
              <Link
                href={`/admin?${new URLSearchParams({
                  page: "1",
                  pageSize: String(applications.pageSize),
                  ...(q ? { q } : {}),
                  ...(selectedId ? { selected: selectedId } : {})
                }).toString()}` as never}
                className="rounded-lg border border-dashed border-border/80 bg-background/60 p-3 text-sm text-muted-foreground hover:border-primary/40"
              >
                Show all stages
              </Link>
            ) : null}
          </div>

          {!noQueueResults ? (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-4">
                <div>
                  <p className="font-semibold">Matching applicants</p>
                  <p className="text-sm text-muted-foreground">
                    Showing {applications.data.length} applicant{applications.data.length === 1 ? "" : "s"} on this page.
                  </p>
                </div>
                <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-sm font-medium">
                  {workflow === "all" ? "All stages" : queueStageLabel(workflow)}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(applications.data as Record<string, unknown>[]).map((record) => {
                    const recordStage = queueStage(record);
                    const isSelected = String(record.id) === selectedId;
                    const query = new URLSearchParams();
                    query.set("page", String(applications.page));
                    query.set("pageSize", String(applications.pageSize));
                    if (q) query.set("q", q);
                    if (workflow !== "all") query.set("workflow", workflow);
                    query.set("selected", String(record.id));

                    return (
                      <TableRow
                        key={`queue-${String(record.id)}`}
                        className={isSelected ? "border-l-4 border-l-primary bg-primary/5" : "hover:bg-muted/20"}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{String(record.full_name)}</p>
                            <p className="text-xs text-muted-foreground">
                              {String(record.service_type).replaceAll("_", " ")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium">
                            {queueStageLabel(recordStage)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getEffectiveApplicationStatus(record)} />
                        </TableCell>
                        <TableCell>
                          {formatDateTime((record.submitted_at as string | null | undefined) ?? null)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant={isSelected ? "secondary" : "outline"} size="sm">
                            <Link href={`/admin?${query.toString()}` as never}>{isSelected ? "Selected" : "Open"}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <PaginationControls
            basePath="/admin"
            pagination={applications}
            params={{
              q: q || undefined,
              workflow: workflow !== "all" ? workflow : undefined,
              selected: selectedId || undefined
            }}
          />

          {noQueueResults ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  No applicants matched your current search and workflow filter.
                  {q
                    ? hasMatchesInOtherStages
                      ? ` "${q}" exists in the database, but not under the selected "${workflow.replaceAll("-", " ")}" stage.`
                      : ` No record was found for "${q}".`
                    : ""}
                </>
              ) : (
                "No applications are in the queue yet."
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!noQueueResults && showStageTables ? (
        <div className="space-y-4">
          {visibleStages.map((stage) => (
            <StageTable
              key={stage.key}
              title={stage.title}
              description={stage.description}
              records={grouped.get(stage.key) ?? []}
              selectedId={selectedId}
              page={applications.page}
              pageSize={applications.pageSize}
              q={q}
              workflow={workflow}
            />
          ))}
        </div>
      ) : null}

      {selectedApplication ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {queueStageLabel(selectedQueueStage)}
                      </span>
                    </div>
                    <CardTitle>{String(selectedApplication.full_name)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {String(selectedApplication.service_type).replaceAll("_", " ")} • Submitted{" "}
                      {formatDateTime((selectedApplication.submitted_at as string | null | undefined) ?? null)}
                    </p>
                  </div>
                  <StatusBadge status={getEffectiveApplicationStatus(selectedApplication as Record<string, unknown>)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "1. Inspection", value: stepState.inspection },
                    { label: "2. Payment", value: stepState.payment },
                    { label: "3. Installation", value: stepState.installation },
                    { label: "4. Conversion", value: stepState.conversion }
                  ].map((step) => (
                    <div key={step.label} className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{step.label}</p>
                      <p className="mt-3 text-lg font-semibold">{step.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <div className="rounded-2xl border border-border/80 bg-muted/10 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current details</p>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Inspection schedule</dt>
                        <dd className="mt-1 font-medium">{formatDateTime(selectedInspectionSchedule)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Inspection result</dt>
                        <dd className="mt-1">
                          <StatusBadge status={latestSelectedInspection?.status ?? "Not scheduled"} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Uploaded documents</dt>
                        <dd className="mt-1 font-medium">{selectedDocuments.length}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Payment records</dt>
                        <dd className="mt-1 font-medium">{selectedPayments.length}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next action</p>
                    <p className="mt-3 text-xl font-semibold">{nextAction(selectedApplication)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {inspectionWorkflowComplete
                        ? "Inspection is already complete. Continue with payment scheduling, then installation, before conversion."
                        : "Finish the remaining inspection steps before moving to payment scheduling."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!inspectionWorkflowComplete ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Inspection step</p>
                <InspectionSchedulerForm applicationId={String(selectedApplication.id)} inspectors={inspectors} />
              </div>
            ) : null}

            <Card className="border-border/70 shadow-sm">
              <CardHeader><CardTitle>Document verification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {selectedDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No uploaded documents yet.</p>
                ) : (
                  selectedDocuments.map((document) => <DocumentReviewForm key={document.id} document={document} />)
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Office payment scheduling</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Set the date when the applicant should go to the BWD office for payment.
                    </p>
                  </div>
                  <StatusBadge status={canSchedulePayment ? "Ready to schedule" : "Waiting for inspection approval"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestSelectedPayment ? (
                  <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm text-muted-foreground">
                    {latestSelectedPayment.status === "paid"
                      ? "Payment is already marked as paid. Details are shown below in read-only mode."
                      : "A payment schedule already exists for this application. Update it below if needed."}
                  </div>
                ) : null}
                <PaymentSchedulerForm
                  applicationId={String(selectedApplication.id)}
                  payment={latestSelectedPayment ?? undefined}
                  canSchedule={canSchedulePayment}
                  scheduleHint="You can schedule the office payment date here after the inspection is approved."
                />
              </CardContent>
            </Card>
            <InstallationSchedulerForm
              applicationId={String(selectedApplication.id)}
              scheduledAt={(selectedApplication.inhouse_installation_scheduled_at as string | null | undefined) ?? null}
              canSchedule={Boolean(canScheduleInstallation)}
            />
            {canMarkInstallationComplete ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Installation step</p>
                <InhouseInstallationForm
                  applicationId={String(selectedApplication.id)}
                  plumbers={plumbers}
                  currentPlumberId={(selectedApplication.accredited_plumber_id as string | null | undefined) ?? null}
                  isCompleted={Boolean(selectedApplication.inhouse_installation_completed)}
                  variant="admin"
                />
              </div>
            ) : (
              <Card className="border-border/70 shadow-sm">
                <CardHeader><CardTitle>Inhouse installation</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Mark installation complete after the office payment date has been scheduled.
                </CardContent>
              </Card>
            )}
            <ConcessionaireForm
              applicationId={String(selectedApplication.id)}
              profileId={String(selectedApplication.applicant_id)}
            />
          </div>
        </div>
      ) : noQueueResults ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Change the search text or selected workflow stage to find an applicant."
              : "No application is available to manage yet."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No application is selected yet. Pick one from the queue to open the management panel.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
