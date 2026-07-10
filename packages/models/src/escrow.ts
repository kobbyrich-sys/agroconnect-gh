import type { Timestamp } from './common';
import type { TransactionType } from './payment';

export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'partially_released' | 'disputed';

export type EscrowReleaseType = 'completed' | 'cancelled' | 'refunded' | 'dispute_resolved' | 'auto_release';

export type WalletType = 'buyer' | 'seller' | 'escrow';

export type DisputeStatus = 'open' | 'under_review' | 'resolved_buyer' | 'resolved_seller' | 'cancelled';

export type TimeoutStage = 'seller_acceptance' | 'fulfillment' | 'buyer_confirmation' | 'auto_release';

export type TimeoutAction = 'cancel' | 'refund' | 'release_to_seller' | 'notify_admin';

export interface EscrowTransaction {
  id: string;
  order_id: string;
  transaction_id?: string;
  from_wallet_id?: string;
  to_wallet_id?: string;
  amount: number;
  type: 'hold' | 'release' | 'refund' | 'partial_release' | 'partial_refund' | 'commission' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  actor_id?: string;
  notes?: string;
  created_at: Timestamp;
}

export interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  raised_against?: string;
  reason: string;
  description?: string;
  status: DisputeStatus;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: Timestamp;
}

export interface EscrowTimeoutConfig {
  id: string;
  stage: TimeoutStage;
  timeout_hours: number;
  default_action: TimeoutAction;
  enabled: boolean;
  updated_by?: string;
  updated_at: Timestamp;
}

export interface WalletConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at: Timestamp;
}

export interface EscrowSummary {
  total_in_escrow: number;
  total_released: number;
  total_refunded: number;
  pending_releases: number;
  active_disputes: number;
}
