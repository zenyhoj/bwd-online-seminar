"use client";

import { useActionState, useEffect, useState } from "react";

import { schedulePaymentAction, updatePaymentStatusAction } from "@/actions/payments";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/types";

type PaymentSchedulerFormProps = {
  applicationId: string;
  payment?: Payment;
  canSchedule?: boolean;
  scheduleHint?: string;
};

export function PaymentSchedulerForm({
  applicationId,
  payment,
  canSchedule = true,
  scheduleHint
}: PaymentSchedulerFormProps) {
  const action = payment ? updatePaymentStatusAction : schedulePaymentAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [minOfficePaymentAt, setMinOfficePaymentAt] = useState("");
  const isPaidLocked = payment?.status === "paid";

  useEffect(() => {
    setMinOfficePaymentAt(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  }, []);

  if (isPaidLocked && payment) {
    return (
      <Card className="border-emerald-200/80 bg-emerald-50/30">
        <CardHeader>
          <CardTitle>Payment completed</CardTitle>
          <CardDescription>This record is locked because it is already marked as paid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
              <div className="mt-3">
                <StatusBadge status="paid" />
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</p>
              <p className="mt-3 text-lg font-semibold">{formatCurrency(payment.amount ?? 0)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Official receipt no.</p>
              <p className="mt-3 font-semibold">{payment.official_receipt_number?.trim() || "N/A"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Paid at</p>
              <p className="mt-3 font-semibold">{formatDateTime(payment.paid_at)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
            <p className="mt-3 text-sm text-muted-foreground">{payment.notes?.trim() || "No notes."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{payment ? "Update payment" : "Schedule office payment"}</CardTitle>
        <CardDescription>
          {payment
            ? "Update the receipt details and payment status for this applicant."
            : "Set the exact date and time when the applicant should report to the BWD office for payment."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
          Required fields: status and official receipt amount.
        </div>
        <form action={formAction} className="grid gap-5 md:grid-cols-2">
          {payment ? <input type="hidden" name="paymentId" value={payment.id} /> : null}
          {!payment ? <input type="hidden" name="applicationId" value={applicationId} /> : null}
          {payment ? (
            <>
              <div className="space-y-2">
                <Label htmlFor={`status-${payment.id}`}>Status</Label>
                <select
                  id={`status-${payment.id}`}
                  name="status"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={payment.status}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`amount-${payment.id}`}>Official receipt amount</Label>
                <Input
                  id={`amount-${payment.id}`}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={payment.amount > 0 ? payment.amount : undefined}
                  placeholder="0.00"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`or-${payment.id}`}>Official receipt no.</Label>
                <Input
                  id={`or-${payment.id}`}
                  name="officialReceiptNumber"
                  defaultValue={payment.official_receipt_number ?? ""}
                  placeholder="Enter official receipt number"
                  className="h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`notes-${payment.id}`}>Notes</Label>
                <Textarea
                  id={`notes-${payment.id}`}
                  name="notes"
                  rows={3}
                  defaultValue={payment.notes ?? ""}
                  placeholder="Add payment notes (optional)"
                  className="resize-y"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`paymentType-${applicationId}`}>Payment type</Label>
                <Input id={`paymentType-${applicationId}`} value="Application fee" readOnly disabled className="h-11" />
                <input type="hidden" name="paymentType" value="inspection_fee" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`officePaymentAt-${applicationId}`}>Office payment date and time</Label>
                <Input
                  id={`officePaymentAt-${applicationId}`}
                  name="officePaymentAt"
                  type="datetime-local"
                  min={minOfficePaymentAt || undefined}
                  required
                  disabled={!canSchedule}
                  className="h-11"
                />
              </div>
            </>
          )}
          {!payment && !canSchedule ? (
            <div className="md:col-span-2 rounded-lg border border-border/80 bg-muted/40 p-3 text-sm text-muted-foreground">
              {scheduleHint ?? "Office payment can be scheduled after the inspector approves the inhouse inspection."}
            </div>
          ) : null}
          <div className="md:col-span-2">
            <FormMessage state={state} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending || (!payment && !canSchedule)} className="w-full sm:w-auto">
              {pending ? "Saving..." : payment ? "Update payment" : "Set office payment date"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
