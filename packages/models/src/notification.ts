import type { Timestamp } from './common';

export type NotificationType =
  | 'order_update'
  | 'payment'
  | 'message'
  | 'review'
  | 'promotion'
  | 'system'
  | 'verification'
  | 'withdrawal';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: Timestamp;
  created_at: Timestamp;
}
