import type { Timestamp } from './common';

export interface WithdrawalRequest {
  id: string;
  seller_id: string;
  business_id: string;
  amount: number;
  method: 'bank_transfer' | 'mobile_money';
  account_name: string;
  account_number: string;
  bank_name?: string;
  mobile_provider?: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}
