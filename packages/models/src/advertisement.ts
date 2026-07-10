import type { Timestamp } from './common';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  placement: 'home_banner' | 'home_featured' | 'category_top' | 'search_top' | 'sidebar' | 'popup';
  starts_at: Timestamp;
  ends_at: Timestamp;
  is_active: boolean;
  click_count: number;
  impression_count: number;
  created_by: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
