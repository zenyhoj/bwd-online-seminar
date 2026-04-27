import { ApplicationSwitcher } from "@/components/applicant/application-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import type { Application } from "@/types";

const applicationFeeGuide = [
  {
    title: "Residential & Commercial C Connection",
    details: [
      "Php 3,000.00 total application fee.",
      "Php 1,500.00 may be paid as the initial payment.",
      "The remaining Php 1,500.00 may be paid in monthly installments for six (6) months.",
      "Equivalent monthly added charge: Php 250.00 until fully paid.",
      "The installment balance must be paid on time to avoid service disconnection."
    ]
  },
  {
    title: "Commercial A and B",
    details: ["Php 4,000.00 application fee."]
  },
  {
    title: "Commercial / Industrial & Bulk Connection",
    details: ["Php 5,000.00 application fee."]
  }
];

const documentaryRequirements = [
  "Photocopy of valid ID.",
  "For an authorized representative: authorization letter from applicant and photocopy of valid ID.",
  "For accounts named after organizations or establishments: Special Power of Attorney (SPA).",
  "Proof of ownership: Title or Tax Declaration. Attach the Deed of Sale if ownership transfer is not yet updated.",
  "If not the lot owner: authorization from the lot and house owner, plus ID of the lot owner.",
  "Official receipt of Water Permit (Php 130.00 to be paid at the LGU).",
  "Cellphone number."
];

function formatScheduledAmount(amount: number) {
  return amount > 0 ? formatCurrency(amount) : "To be set on official receipt";
}

function getOfficePaymentDisplay(payment: { office_payment_at?: string | null; due_date: string }) {
  return payment.office_payment_at ? formatDateTime(payment.office_payment_at) : formatDate(payment.due_date);
}

function getStringParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  return typeof searchParams?.[key] === "string" ? searchParams[key] : undefined;
}

type ApplicantPaymentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicantPaymentsPage({ searchParams }: ApplicantPaymentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile();
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Application[]>();

  const applicationList = applications ?? [];
  const selectedApplicationId = getStringParam(resolvedSearchParams, "application") ?? applicationList[0]?.id ?? null;
  const application = applicationList.find((item) => item.id === selectedApplicationId) ?? applicationList[0] ?? null;

  const { data: payments } = application
    ? await supabase.from("payments").select("*").eq("application_id", application.id).order("due_date", { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground">
          View the date you should go to the office for payment, plus your payment status.
        </p>
      </div>
      <ApplicationSwitcher
        applications={applicationList}
        selectedApplicationId={application?.id}
        basePath="/applicant/payments"
        title="Choose applicant"
        description="Switch between applicant records to review the correct payment schedule."
      />
      <Card>
        <CardHeader>
          <CardTitle>Office payment schedule</CardTitle>
          <p className="text-sm text-muted-foreground">
            Applicant: <span className="font-medium text-foreground">{application?.full_name ?? "No applicant selected"}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Office payment schedule</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments ?? []).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.payment_type.replaceAll("_", " ")}</TableCell>
                  <TableCell>{formatScheduledAmount(payment.amount)}</TableCell>
                  <TableCell>{getOfficePaymentDisplay(payment)}</TableCell>
                  <TableCell><StatusBadge status={payment.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Application fee guide</p>
              <div className="mt-4 space-y-4">
                {applicationFeeGuide.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <p className="font-medium">{item.title}</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {item.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Documentary requirements to bring to BWD Office
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {documentaryRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
