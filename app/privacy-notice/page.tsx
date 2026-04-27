import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyNoticePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Card className="border-0 bg-muted/30 shadow-none">
        <CardHeader>
          <CardTitle>Identity and Data Privacy Notice</CardTitle>
          <CardDescription>
            Guidance for account creation and personal data handling for online water district services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Use your own and actual information</h2>
            <p>
              Create this account using your true identity and current contact details. The information entered in
              the system should belong to the actual applicant or authorized customer who will use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">How we process your information</h2>
            <p>
              Your personal data may be collected and processed only for new water applications, reconnections,
              seminar compliance, document review, inspection scheduling, payment coordination, and other lawful
              water district transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">How your data is protected</h2>
            <p>
              We apply reasonable organizational, technical, and administrative safeguards to protect your personal
              information against unauthorized access, disclosure, alteration, misuse, and loss, in accordance with
              the Data Privacy Act of 2012 and applicable government data protection requirements.
            </p>
          </section>

          <div className="pt-2">
            <Button asChild>
              <Link href="/register">Back to account creation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
