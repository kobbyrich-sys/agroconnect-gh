import type { Timestamp } from './common';

export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'paystack' | 'wallet' | 'card';

export type PaymentProvider = 'mtn' | 'vodafone' | 'airteltigo' | 'paystack' | 'hubtel';

export type WalletType = 'buyer' | 'seller' | 'escrow';

export type TransactionType = 'sale' | 'commission' | 'refund' | 'withdrawal' | 'adjustment' | 'bonus' | 'penalty' | 'manual_credit' | 'manual_debit' | 'escrow_hold' | 'escrow_release' | 'escrow_refund';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  order_id: string;
  buyer_id: string;
  amount: number;
  method: PaymentMethod;
  provider?: PaymentProvider;
  reference: string;
  status: TransactionStatus;
  paid_at?: Timestamp;
  created_at: Timestamp;
}

export interface Wallet {
  id: string;
  user_id?: string;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
  type: WalletType;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface WalletBalance {
  buyer: number;
  seller: number;
  escrow: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  type: TransactionType;
  reference: string;
  description?: string;
  order_id?: string;
  actor_id?: string;
  wallet_type?: WalletType;
  created_at: Timestamp;
}

export interface WithdrawalAccount {
  id: string;
  seller_id: string;
  account_name: string;
  account_number: string;
  network: string;
  bank_name?: string;
  branch?: string;
  is_primary: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PlatformRevenue {
  id: string;
  order_id: string;
  commission_amount: number;
  order_amount: number;
  commission_percentage: number;
  created_at: Timestamp;
}

export interface PaymentReceipt {
  id: string;
  order_id: string;
  buyer_id: string;
  receipt_number: string;
  amount: number;
  created_at: Timestamp;
}
