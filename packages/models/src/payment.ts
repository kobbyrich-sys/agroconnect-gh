import type { Timestamp } from './common';

export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'paystack' | 'cash_on_delivery' | 'wallet' | 'card';

export type PaymentProvider = 'mtn' | 'vodafone' | 'airteltigo' | 'paystack' | 'hubtel';

export type TransactionType = 'payment' | 'refund' | 'withdrawal' | 'commission' | 'deposit';

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
  user_id: string;
  balance: number;
  locked_balance: number;
  currency: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  description?: string;
  order_id?: string;
  created_at: Timestamp;
}
