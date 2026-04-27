import { AccreditedPlumberForm } from "@/components/admin/accredited-plumber-form";
import { getAllAccreditedPlumbers } from "@/lib/queries";

export default async function AdminPlumbersPage() {
  const plumbers = await getAllAccreditedPlumbers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Accredited plumbers</h1>
        <p className="text-sm text-muted-foreground">
          Maintain the plumber registry used when applicants mark inhouse installation as complete.
        </p>
      </div>
      <AccreditedPlumberForm plumbers={plumbers} />
    </div>
  );
}
