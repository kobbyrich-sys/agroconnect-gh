import type { Timestamp } from './common';

export interface Chat {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  order_id?: string;
  last_message?: string;
  last_message_at?: Timestamp;
  unread_count_1: number;
  unread_count_2: number;
  is_blocked: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  read_at?: Timestamp;
  created_at: Timestamp;
}
