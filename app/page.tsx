import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
      <div className="mx-auto max-w-[800px] space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">BWD Online</p>
          <h1 className="text-5xl font-normal leading-tight tracking-[-0.04em] text-foreground">
            Apply for water service and complete your required seminar online with less hassle.
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Make new water applications, reconnections, and seminar-based water district services easier to start,
            track, and complete from home.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </div>
      </div>
    </main>
  );
}
