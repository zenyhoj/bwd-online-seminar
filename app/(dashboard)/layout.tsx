import { AppShell } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/auth";
import { getApplicantSeminarState, getLatestApplicantApplication } from "@/lib/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  let applicantNavMode: "preseminar" | "hasApplication" | "newApplication" | undefined;

  if (profile.role === "applicant") {
    const [seminarState, latestApplication] = await Promise.all([
      getApplicantSeminarState(),
      getLatestApplicantApplication()
    ]);

    if (!seminarState.allCompleted) {
      applicantNavMode = "preseminar";
    } else if (latestApplication) {
      applicantNavMode = "hasApplication";
    } else {
      applicantNavMode = "newApplication";
    }
  }

  return (
    <AppShell profile={profile} applicantNavMode={applicantNavMode}>
      {children}
    </AppShell>
  );
}
