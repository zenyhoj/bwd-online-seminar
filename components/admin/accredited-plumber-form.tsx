"use client";

import { useActionState } from "react";

import { createAccreditedPlumberAction, deleteAccreditedPlumberAction } from "@/actions/accredited-plumbers";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccreditedPlumber } from "@/types";

type AccreditedPlumberFormProps = {
  plumbers: AccreditedPlumber[];
};

function DeletePlumberButton({ plumberId }: { plumberId: string }) {
  const [state, formAction, pending] = useActionState(deleteAccreditedPlumberAction, initialActionState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="plumberId" value={plumberId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Removing..." : "Remove"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

export function AccreditedPlumberForm({ plumbers }: AccreditedPlumberFormProps) {
  const [state, formAction, pending] = useActionState(createAccreditedPlumberAction, initialActionState);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add accredited plumber</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License number</Label>
              <Input id="licenseNumber" name="licenseNumber" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <FormMessage state={state} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Add plumber"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accredited plumber registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plumbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accredited plumbers registered yet.</p>
          ) : (
            plumbers.map((plumber) => (
              <div
                key={plumber.id}
                className="flex flex-col gap-4 rounded-xl border border-border/80 p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{plumber.is_active ? "Active" : "Archived"}</span>
                    {plumber.license_number ? <span>License {plumber.license_number}</span> : null}
                  </div>
                  <h3 className="text-lg font-semibold">{plumber.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plumber.phone ? `Phone: ${plumber.phone}` : "No phone recorded"}
                  </p>
                  {plumber.notes ? <p className="text-sm text-muted-foreground">{plumber.notes}</p> : null}
                </div>
                <DeletePlumberButton plumberId={plumber.id} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
