"use client";

import { Button } from "@/components/ui/button";

export default function ApplicantError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <h2 className="text-xl font-semibold">Applicant data could not be loaded</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
