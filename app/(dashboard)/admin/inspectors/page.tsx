import { InspectorRegistryForm } from "@/components/admin/inspector-registry-form";
import { getAllInspectors } from "@/lib/queries";

export default async function AdminInspectorsPage() {
  const inspectors = await getAllInspectors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Inspectors</h1>
        <p className="text-sm text-muted-foreground">
          Maintain the inspector registry used when scheduling inspections.
        </p>
      </div>
      <InspectorRegistryForm inspectors={inspectors} />
    </div>
  );
}
