import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PaginatedResult } from "@/types/domain";

type PaginationControlsProps = {
  basePath: string;
  pagination: Pick<PaginatedResult<unknown>, "page" | "pageCount" | "pageSize">;
  params?: Record<string, string | number | undefined>;
};

export function PaginationControls({ basePath, pagination, params }: PaginationControlsProps) {
  const previousPage = Math.max(1, pagination.page - 1);
  const nextPage = Math.min(pagination.pageCount, pagination.page + 1);
  const buildHref = (page: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pagination.pageSize));

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        return;
      }
      searchParams.set(key, String(value));
    });

    return `${basePath}?${searchParams.toString()}`;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {pagination.page} of {pagination.pageCount}
      </p>
      <div className="flex gap-2">
        {pagination.page === 1 ? (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(previousPage) as never}>Previous</Link>
          </Button>
        )}
        {pagination.page === pagination.pageCount ? (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(nextPage) as never}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
