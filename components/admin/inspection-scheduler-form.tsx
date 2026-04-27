"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { scheduleInspectionAction } from "@/actions/inspections";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InspectorRecord } from "@/types";

type InspectionSchedulerFormProps = {
  applicationId: string;
  inspectors: InspectorRecord[];
};

export function InspectionSchedulerForm({ applicationId, inspectors }: InspectionSchedulerFormProps) {
  const [state, formAction, pending] = useActionState(scheduleInspectionAction, initialActionState);
  const [minSchedule, setMinSchedule] = useState("");

  useEffect(() => {
    setMinSchedule(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  }, []);

  if (inspectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule inspection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No inspectors are available yet. Add an inspector first before scheduling this application.
          </p>
          <Button asChild>
            <Link href="/admin/inspectors">Add inspector</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule inspection</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <input type="hidden" name="applicationId" value={applicationId} />
          <div className="space-y-2">
            <Label htmlFor={`inspector-${applicationId}`}>Inspector</Label>
            <select
              id={`inspector-${applicationId}`}
              name="inspectorId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select inspector</option>
              {inspectors.map((inspector) => (
                <option key={inspector.id} value={inspector.id}>
                  {inspector.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`scheduled-${applicationId}`}>Scheduled time</Label>
            <Input
              id={`scheduled-${applicationId}`}
              name="scheduledAt"
              type="datetime-local"
              min={minSchedule || undefined}
              required
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Schedule"}
          </Button>
          <div className="md:col-span-3">
            <FormMessage state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
