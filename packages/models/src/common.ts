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

export type UserRole = 'guest' | 'buyer' | 'seller' | 'support' | 'admin' | 'super_admin';

export type PlatformRole = 'buyer' | 'seller';

export type SellerBusinessType = 'farmer' | 'manufacturer' | 'wholesaler' | 'food_processor' | 'cooperative' | 'agro_dealer' | 'input_supplier' | 'exporter';

export type BusinessType = 'farmer' | 'manufacturer' | 'wholesaler';

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'pending';
