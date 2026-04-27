"use client";

import { useEffect, useState } from "react";

import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleHome } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import type { ActionState, AppRole } from "@/types";

export function LoginForm() {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ActionState>({ success: false, message: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setState({ success: false, message: "" });

    const supabase = createClient();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { data: authResult, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !authResult.user) {
      setPending(false);
      setState({ success: false, message: "Invalid email or password." });
      return;
    }

    const roleResponse = await fetch("/api/auth/role", {
      method: "GET",
      cache: "no-store"
    });

    if (!roleResponse.ok) {
      const payload = (await roleResponse.json().catch(() => null)) as { message?: string } | null;
      await supabase.auth.signOut();
      setPending(false);
      setState({
        success: false,
        message: payload?.message ?? "This account is not authorized to access the system."
      });
      return;
    }

    const payload = (await roleResponse.json()) as { role: AppRole };
    const role = payload.role;
    window.location.assign(roleHome[role] ?? "/login");
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access the online water application system.</CardDescription>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted/70" />
            </div>
            <div className="h-10 rounded-md bg-muted/70" />
          </div>
        ) : (
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              data-lpignore="true"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              data-lpignore="true"
              required
            />
          </div>
          <FormMessage state={state} />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        )}
      </CardContent>
    </Card>
  );
}
