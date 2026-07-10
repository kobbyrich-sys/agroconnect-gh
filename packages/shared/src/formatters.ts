import { CURRENCY_SYMBOL } from './constants';

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatDiscount(percentage: number): string {
  return `${Math.round(percentage)}% OFF`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('233')) {
    return `0${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

export function formatStock(quantity: number, threshold: number): {
  label: string;
  variant: 'in_stock' | 'low_stock' | 'out_of_stock';
} {
  if (quantity <= 0) return { label: 'Out of Stock', variant: 'out_of_stock' };
  if (quantity <= threshold) return { label: `${quantity} left`, variant: 'low_stock' };
  return { label: 'In Stock', variant: 'in_stock' };
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
