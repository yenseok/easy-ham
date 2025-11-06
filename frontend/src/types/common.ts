/**
 * 공통 타입 정의
 */

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page: number;
  limit: number;
  totalPages?: number;
  totalItems?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationParams;
}
