import type { Timestamp } from './common';

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface DeliveryPartner {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_number?: string;
  license_number?: string;
  is_available: boolean;
  current_location_lat?: number;
  current_location_lng?: number;
  rating: number;
  total_deliveries: number;
  is_verified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_partner_id?: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  distance_km?: number;
  delivery_fee: number;
  status: DeliveryStatus;
  estimated_delivery_time?: Timestamp;
  actual_delivery_time?: Timestamp;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface DeliveryTracking {
  id: string;
  delivery_id: string;
  status: DeliveryStatus;
  lat?: number;
  lng?: number;
  location_name?: string;
  notes?: string;
  created_at: Timestamp;
}
