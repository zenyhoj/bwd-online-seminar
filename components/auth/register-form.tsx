"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";

import { registerAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialActionState);
  const [mounted, setMounted] = useState(false);
  const fieldErrors = state.fieldErrors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const errorText = (name: string) => fieldErrors[name]?.[0];
  const hasError = (name: string) => Boolean(errorText(name));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="mx-auto w-full max-w-lg border-border/70 bg-card shadow-xl ring-1 ring-black/5">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-3xl tracking-tight">Create account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground/80">
          Register an applicant account for online water district services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted/70" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted/70" />
            </div>
            <div className="h-20 rounded-md bg-muted/70 md:col-span-2" />
            <div className="h-10 w-40 rounded-md bg-muted/70 md:col-span-2" />
          </div>
        ) : (
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              required
              autoComplete="name"
              data-lpignore="true"
              aria-invalid={hasError("fullName")}
              className={hasError("fullName") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("fullName") ? <p className="text-xs text-destructive">{errorText("fullName")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              data-lpignore="true"
              aria-invalid={hasError("email")}
              className={hasError("email") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("email") ? <p className="text-xs text-destructive">{errorText("email")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              data-lpignore="true"
              aria-invalid={hasError("password")}
              className={hasError("password") ? "border-destructive focus-visible:ring-destructive" : undefined}
            />
            {hasError("password") ? <p className="text-xs text-destructive">{errorText("password")}</p> : null}
            {!hasError("password") ? (
              <p className="text-xs text-muted-foreground">Use 12+ chars with upper, lower, number, and symbol.</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerType">Customer type</Label>
            <select
              id="customerType"
              name="customerType"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${
                hasError("customerType")
                  ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  : "border-input"
              }`}
              defaultValue="residential"
              aria-invalid={hasError("customerType")}
              required
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="government">Government</option>
              <option value="industrial">Industrial</option>
              <option value="others">Others</option>
            </select>
            {hasError("customerType") ? <p className="text-xs text-destructive">{errorText("customerType")}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label
              className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                hasError("acceptPrivacyNotice") ? "border-destructive" : "border-border/80"
              }`}
            >
              <input
                id="acceptPrivacyNotice"
                name="acceptPrivacyNotice"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-input"
                aria-invalid={hasError("acceptPrivacyNotice")}
                required
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I confirm this information belongs to the actual user or authorized applicant, and I understand how
                personal data will be processed under the Data Privacy Act of 2012.
              </span>
            </label>
            {hasError("acceptPrivacyNotice") ? (
              <p className="mt-2 text-xs text-destructive">{errorText("acceptPrivacyNotice")}</p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground/80">
              See our{" "}
              <Link href="/privacy-notice" className="underline underline-offset-4">
                identity and data privacy notice
              </Link>
              .
            </p>
          </div>
          <div className="md:col-span-2">
            {state.success || !hasFieldErrors ? <FormMessage state={state} /> : null}
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create account"}
            </Button>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  );
}
