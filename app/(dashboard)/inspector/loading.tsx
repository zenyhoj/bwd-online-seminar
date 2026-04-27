import { Skeleton } from "@/components/ui/skeleton";

export default function InspectorLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
