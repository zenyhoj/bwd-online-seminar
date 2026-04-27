import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import { getInspectorAssignments } from "@/lib/queries";

export default async function InspectorDashboardPage() {
  const assignments = await getInspectorAssignments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Inspector Dashboard</h1>
        <p className="text-sm text-muted-foreground">Open assigned inspections and submit field findings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assigned inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((inspection) => {
                const application = inspection.applications as { full_name?: string } | null;

                return (
                  <TableRow key={inspection.id}>
                    <TableCell>{application?.full_name ?? "Unknown"}</TableCell>
                    <TableCell>{inspection.inspector_name ?? "Unassigned"}</TableCell>
                    <TableCell>{formatDateTime(inspection.scheduled_at)}</TableCell>
                    <TableCell><StatusBadge status={inspection.status} /></TableCell>
                    <TableCell>
                      <Link href={`/inspector/inspections/${inspection.id}`} className="text-primary hover:underline">
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
