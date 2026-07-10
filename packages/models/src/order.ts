import type { Timestamp } from './common';
import type { Address } from './user';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';

export interface CartItem {
  product_id: string;
  seller_id: string;
  business_id: string;
  name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  wholesale: boolean;
  total: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  item_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

import type { EscrowStatus, EscrowReleaseType } from './escrow';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  business_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  commission: number;
  total: number;
  currency: string;
  notes?: string;
  is_read: boolean;
  paid_at?: Timestamp;
  completed_at?: Timestamp;
  escrow_status: EscrowStatus;
  escrow_held_amount?: number;
  escrow_released_at?: Timestamp;
  escrow_release_type?: EscrowReleaseType;
  escrow_expires_at?: Timestamp;
  seller_accepted_at?: Timestamp;
  buyer_confirmed_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  wholesale: boolean;
  total: number;
  created_at: Timestamp;
}
