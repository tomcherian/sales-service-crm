// Envelope types for the server's standard response format (see plan.md section 9).

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export interface ListParams {
  page: number;
  limit: number;
  search: string;
}

// A reference the server returns either as a raw ObjectId or as a populated document.
export type RefDto = string | null | { _id: string; name?: string; email?: string };
