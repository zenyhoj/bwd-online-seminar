import { requireRole } from "@/lib/auth";

export default async function InspectorAreaLayout({ children }: { children: React.ReactNode }) {
  await requireRole("inspector");
  return children;
}
