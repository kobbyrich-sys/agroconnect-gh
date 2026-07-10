import type { Timestamp } from './common';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface WithdrawalRequest {
  id: string;
  seller_id: string;
  business_id: string;
  amount: number;
  account_name: string;
  account_number: string;
  network: string;
  bank_name?: string;
  status: WithdrawalStatus;
  admin_notes?: string;
  processed_by?: string;
  processed_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SellerWalletSummary {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  current_balance: number;
}

export interface WalletAdjustment {
  seller_id: string;
  amount: number;
  type: 'manual_credit' | 'manual_debit' | 'bonus' | 'penalty';
  reason: string;
}

export interface CommissionSettings {
  percentage: number;
  updated_by?: string;
  updated_at?: Timestamp;
}
