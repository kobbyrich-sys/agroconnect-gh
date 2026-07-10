import type { Timestamp } from './common';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory = 'order_issue' | 'payment' | 'account' | 'seller_support' | 'technical' | 'other';

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id?: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  is_staff: boolean;
  created_at: Timestamp;
}
