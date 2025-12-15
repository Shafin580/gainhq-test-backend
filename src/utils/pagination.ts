export interface PaginationArgs {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

export const paginate = <T>(
  items: T[],
  totalCount: number,
  limit: number = 10,
  offset: number = 0
): PaginatedResult<T> => {
  return {
    items,
    totalCount,
    hasMore: offset + items.length < totalCount,
    limit,
    offset,
  };
};

export const getPaginationParams = (args: PaginationArgs) => {
  const limit = Math.min(args.limit || 10, 100); // Max 100 items per page
  const offset = args.offset || 0;
  return { limit, offset };
};
