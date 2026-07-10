import type { Timestamp, EntityStatus } from './common';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  order_index: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: Timestamp;
}

export interface Product {
  id: string;
  seller_id: string;
  business_id: string;
  category_id: string;
  subcategory_id?: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  barcode?: string;
  brand?: string;
  weight?: number;
  weight_unit?: string;
  unit?: string;
  retail_price: number;
  wholesale_price?: number;
  wholesale_min_quantity?: number;
  discount_percentage?: number;
  discount_end_date?: Timestamp;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_published: boolean;
  status: EntityStatus;
  location?: string;
  region?: string;
  average_rating: number;
  review_count: number;
  sold_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  order_index: number;
  created_at: Timestamp;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  video_url: string;
  thumbnail_url?: string;
  title?: string;
  created_at: Timestamp;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  change_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'restock';
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: Timestamp;
}
