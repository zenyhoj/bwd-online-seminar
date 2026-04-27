import { SeminarItemForm } from "@/components/admin/seminar-item-form";
import { getAdminSeminarItems } from "@/lib/queries";

export default async function AdminSeminarsPage() {
  const items = await getAdminSeminarItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Seminar management</h1>
        <p className="text-sm text-muted-foreground">
          Publish the seminar room content applicants must finish before submitting their information.
        </p>
      </div>
      <SeminarItemForm items={items} />
    </div>
  );
}
