export const APP_NAME = 'AgroConnect GH';
export const APP_DESCRIPTION =
  "Ghana's premier digital marketplace connecting farmers, manufacturers, wholesalers, retailers, and consumers.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const CURRENCY = 'GHS';
export const CURRENCY_SYMBOL = '₵';

export const GHANA_REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
] as const;

export const PRODUCT_UNITS = [
  'kg',
  'g',
  'tonne',
  'bag',
  'crate',
  'bunch',
  'piece',
  'dozen',
  'litre',
  'ml',
  'acre',
  'hectare',
] as const;

export const MOBILE_MONEY_PROVIDERS = ['MTN', 'Vodafone', 'AirtelTigo'] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'returned',
  'refunded',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const COMMISSION_PERCENTAGE = 5;

export const WITHDRAWAL_MINIMUM = 50;
export const WITHDRAWAL_FEE = 2;

export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  PRODUCT_VIDEOS: 'product-videos',
  AVATARS: 'avatars',
  BUSINESS_LOGOS: 'business-logos',
  VERIFICATION_DOCS: 'verification-docs',
  CHAT_IMAGES: 'chat-images',
  REVIEW_IMAGES: 'review-images',
} as const;
