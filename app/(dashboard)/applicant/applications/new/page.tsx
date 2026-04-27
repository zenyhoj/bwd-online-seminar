import Link from "next/link";

import { ApplicationSwitcher } from "@/components/applicant/application-switcher";
import { ApplicationForm } from "@/components/applicant/application-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantApplications, getApplicantSeminarState } from "@/lib/queries";

export default async function NewApplicationPage() {
  const [seminarState, applications] = await Promise.all([
    getApplicantSeminarState(),
    getApplicantApplications()
  ]);

  if (!seminarState.allCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seminar completion required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Finish all seminar items first. Your applicant information form unlocks only after the seminar series is
            complete.
          </p>
          <Button asChild>
            <Link href="/applicant/seminar">Return to seminar room</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Applicant information</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage one or more applicant records now that your seminar series is finished.
        </p>
      </div>
      {applications.length > 0 ? (
        <ApplicationSwitcher
          applications={applications}
          selectedApplicationId={applications[0]?.id}
          basePath="/applicant"
          title="Existing applicant records"
          description="You can add another applicant below or open an existing record from the dashboard."
        />
      ) : null}
      {applications.length > 0 ? (
        <Card className="border-border/70 bg-muted/20">
          <CardContent className="flex flex-col gap-4 p-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              You already have {applications.length} applicant record{applications.length === 1 ? "" : "s"} on file.
              Use this form to add another applicant under the same public account.
            </p>
            <Button asChild variant="outline">
              <Link href="/applicant">Open dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <ApplicationForm />
    </div>
  );
}
