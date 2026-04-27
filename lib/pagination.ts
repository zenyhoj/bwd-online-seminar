import type { PaginationParams, PaginatedResult } from "@/types/domain";

export function parsePagination(searchParams?: Record<string, string | string[] | undefined>): PaginationParams {
  const pageParam = typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const pageSizeParam = typeof searchParams?.pageSize === "string" ? Number(searchParams.pageSize) : 10;

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 50) : 10;

  return { page, pageSize };
}

export function buildPaginatedResult<T>(
  data: T[],
  count: number,
  { page, pageSize }: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    count,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(count / pageSize))
  };
}
