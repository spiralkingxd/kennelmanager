export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  take?: number;  // alias for limit (frontend compatibility)
}

const MAX_PAGE = 10000;

export function getPaginationOptions(params?: PaginationParams) {
  const page = Math.min(Math.max(1, params?.page || 1), MAX_PAGE);
  const effectiveLimit = params?.limit ?? params?.take ?? 20;
  const parsedLimit = Math.max(1, effectiveLimit);
  const limit = Math.min(parsedLimit, 1000); // max 1000 per page
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

export function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
