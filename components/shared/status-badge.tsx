import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const variant =
    normalized.includes("disapproved") || normalized.includes("rejected") || normalized.includes("overdue")
      ? "destructive"
      : normalized.includes("approved") || normalized.includes("verified") || normalized.includes("paid")
      ? "success"
      : normalized.includes("scheduled")
        ? "secondary"
        : "warning";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
