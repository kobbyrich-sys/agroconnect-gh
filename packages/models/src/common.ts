export type Timestamp = string;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  field: string;
  order: SortOrder;
}

export type UserRole = 'guest' | 'buyer' | 'farmer' | 'manufacturer' | 'wholesaler' | 'delivery_partner' | 'support' | 'admin' | 'super_admin';

export type BusinessType = 'farmer' | 'manufacturer' | 'wholesaler';

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'pending';
