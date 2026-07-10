import type { Timestamp } from './common';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  per_user_limit: number;
  applies_to: 'all' | 'categories' | 'products' | 'sellers';
  applicable_ids?: string[];
  starts_at: Timestamp;
  expires_at: Timestamp;
  is_active: boolean;
  created_by: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  used_at: Timestamp;
}
