"use client";

import { useActionState } from "react";

import { createApplicationAction } from "@/actions/applications";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(createApplicationAction, initialActionState);
  const fieldErrors = state.fieldErrors ?? {};
  const errorText = (name: string) => fieldErrors[name]?.[0];
  const hasError = (name: string) => Boolean(errorText(name));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicant information</CardTitle>
        <CardDescription>Provide the required public user details after finishing the seminar series.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              required
              aria-invalid={hasError("lastName")}
              className={hasError("lastName") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("lastName") ? <p className="text-xs text-destructive">{errorText("lastName")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              required
              aria-invalid={hasError("firstName")}
              className={hasError("firstName") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("firstName") ? <p className="text-xs text-destructive">{errorText("firstName")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleInitial">Middle initial</Label>
            <Input
              id="middleInitial"
              name="middleInitial"
              maxLength={3}
              placeholder="M.I."
              aria-invalid={hasError("middleInitial")}
              className={hasError("middleInitial") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("middleInitial") ? <p className="text-xs text-destructive">{errorText("middleInitial")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <select
              id="sex"
              name="sex"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${
                hasError("sex")
                  ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  : "border-input"
              }`}
              defaultValue="Male"
              aria-invalid={hasError("sex")}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {hasError("sex") ? <p className="text-xs text-destructive">{errorText("sex")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={1}
              max={120}
              required
              aria-invalid={hasError("age")}
              className={hasError("age") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("age") ? <p className="text-xs text-destructive">{errorText("age")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cellphoneNumber">Cellphone number</Label>
            <Input
              id="cellphoneNumber"
              name="cellphoneNumber"
              inputMode="tel"
              required
              aria-invalid={hasError("cellphoneNumber")}
              className={hasError("cellphoneNumber") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("cellphoneNumber") ? (
              <p className="text-xs text-destructive">{errorText("cellphoneNumber")}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Enter at least 11 digits including the mobile prefix.</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              required
              aria-invalid={hasError("address")}
              className={hasError("address") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("address") ? <p className="text-xs text-destructive">{errorText("address")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfUsers">Number of users</Label>
            <Input
              id="numberOfUsers"
              name="numberOfUsers"
              type="number"
              min={1}
              required
              aria-invalid={hasError("numberOfUsers")}
              className={hasError("numberOfUsers") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("numberOfUsers") ? <p className="text-xs text-destructive">{errorText("numberOfUsers")}</p> : null}
          </div>
          <div className="md:col-span-2">
            <FormMessage state={state} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting..." : "Submit applicant information"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
