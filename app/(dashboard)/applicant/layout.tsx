import { requireRole } from "@/lib/auth";

export default async function ApplicantAreaLayout({ children }: { children: React.ReactNode }) {
  await requireRole("applicant");
  return children;
}
