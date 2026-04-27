import { SeminarModuleList } from "@/components/applicant/seminar-module-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantSeminarState } from "@/lib/queries";

export default async function ApplicantSeminarPage() {
  const seminarState = await getApplicantSeminarState();

  if (seminarState.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No seminar items yet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The administrator has not published any seminar content yet. Please check back later.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {seminarState.allCompleted ? (
        <Card className="border-0 bg-[linear-gradient(135deg,rgba(47,160,183,0.14),rgba(255,179,26,0.18))]">
          <CardContent className="flex flex-col gap-2 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Next step unlocked</p>
            <CardTitle className="text-2xl">Seminar completed</CardTitle>
            <p className="max-w-2xl text-sm text-foreground/80">
              Your applicant information form is now available below.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Seminar room</h1>
          <p className="text-sm text-muted-foreground">
            Complete each seminar item in sequence before filling out your application information.
          </p>
        </div>
        <Card className="min-w-[240px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {seminarState.completedCount} of {seminarState.items.length} seminar items completed
            </p>
            {seminarState.allCompleted ? (
              <p className="font-medium text-foreground/80">Scroll down for the next step.</p>
            ) : (
              <p>Finish all items to unlock the information form.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <SeminarModuleList items={seminarState.items} progress={seminarState.progress} />
    </div>
  );
}
