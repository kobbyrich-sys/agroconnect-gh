import type { UserRole, EntityStatus, Timestamp } from './common';

export interface Profile {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  status: EntityStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  region: string;
  country: string;
  gps_address?: string;
  is_default: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_type: BusinessType;
  business_phone: string;
  business_email?: string;
  business_logo?: string;
  business_address: string;
  gps_address?: string;
  ghana_card_number?: string;
  registration_number?: string;
  is_verified: boolean;
  status: EntityStatus;
  approved_by?: string;
  approved_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SellerVerification {
  id: string;
  business_id: string;
  ghana_card_url: string;
  selfie_url: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  mobile_money_provider: string;
  mobile_money_number: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}
