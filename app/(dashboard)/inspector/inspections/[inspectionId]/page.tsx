import { notFound } from "next/navigation";

import { InspectionForm } from "@/components/inspector/inspection-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentInspectorRegistryIds } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InspectorInspectionPageProps = {
  params: Promise<{ inspectionId: string }>;
};

export default async function InspectorInspectionPage({ params }: InspectorInspectionPageProps) {
  const { inspectionId } = await params;
  const supabase = await createSupabaseServerClient();
  const registryInspectorIds = await getCurrentInspectorRegistryIds();

  if (registryInspectorIds.length === 0) {
    notFound();
  }

  const { data: inspection } = await supabase
    .from("inspections")
    .select("*, applications(accredited_plumbers(full_name))")
    .eq("id", inspectionId)
    .in("registry_inspector_id", registryInspectorIds)
    .single();

  if (!inspection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assigned inspection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Record complete field findings including reference accounts, coordinates, material list, and inspection result.
        </CardContent>
      </Card>
      <InspectionForm
        inspection={inspection}
        pulledPlumberName={
          ((inspection.applications as { accredited_plumbers?: { full_name?: string } | null } | null)?.accredited_plumbers
            ?.full_name ?? null)
        }
      />
    </div>
  );
}
