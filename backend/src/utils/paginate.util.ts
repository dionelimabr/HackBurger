export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const page  = Math.max(1, options.page  ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 12));
  const totalPages = Math.ceil(total / limit);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
