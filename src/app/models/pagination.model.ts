export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: Pagination;
}
