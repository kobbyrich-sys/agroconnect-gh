import type { Timestamp } from './common';

export interface Review {
  id: string;
  product_id: string;
  order_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_published: boolean;
  helpful_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Rating {
  id: string;
  product_id: string;
  average_rating: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
  total_count: number;
  updated_at: Timestamp;
}
