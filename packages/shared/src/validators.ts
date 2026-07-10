export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('233') && cleaned.length === 12) return true;
  if (cleaned.startsWith('0') && cleaned.length === 10) return true;
  return false;
}

export function isValidGhanaCard(number: string): boolean {
  return /^GHA-\d{9}-\d{1}$/.test(number);
}

export function isValidGPSAddress(address: string): boolean {
  return /^[A-Z]{2}-\d{4}-\d{4}$/.test(address);
}

export function isValidPrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}

export function isValidStock(quantity: number): boolean {
  return quantity >= 0 && Number.isInteger(quantity);
}

export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5;
}

export function isValidDiscountPercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}
