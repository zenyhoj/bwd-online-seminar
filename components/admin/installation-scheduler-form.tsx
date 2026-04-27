"use client";

import { useActionState, useEffect, useState } from "react";

import { scheduleInhouseInstallationAction } from "@/actions/accredited-plumbers";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format";

type InstallationSchedulerFormProps = {
  applicationId: string;
  scheduledAt?: string | null;
  canSchedule?: boolean;
};

export function InstallationSchedulerForm({
  applicationId,
  scheduledAt = null,
  canSchedule = false
}: InstallationSchedulerFormProps) {
  const [state, formAction, pending] = useActionState(scheduleInhouseInstallationAction, initialActionState);
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    setMaxDate(new Date().toISOString().slice(0, 10));
  }, []);

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Installation date</CardTitle>
        <CardDescription>
          Installation stays queued after payment. Set the installation date once work is completed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduledAt ? (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm text-muted-foreground">
            Recorded installation date: <span className="font-medium text-foreground">{formatDateTime(scheduledAt)}</span>
          </div>
        ) : null}
        <form action={formAction} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <input type="hidden" name="applicationId" value={applicationId} />
          <div className="space-y-2">
            <Label htmlFor={`installation-scheduled-at-${applicationId}`}>Installation date</Label>
            <Input
              id={`installation-scheduled-at-${applicationId}`}
              name="scheduledAt"
              type="date"
              max={maxDate || undefined}
              required
              disabled={!canSchedule}
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={pending || !canSchedule} className="w-full whitespace-nowrap lg:w-auto">
            {pending ? "Saving..." : scheduledAt ? "Update confirmed date" : "Confirm date"}
          </Button>
          {!canSchedule ? (
            <p className="lg:col-span-2 text-sm text-muted-foreground">
              Installation can be recorded after payment is marked as paid.
            </p>
          ) : null}
          <div className="lg:col-span-2">
            <FormMessage state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
