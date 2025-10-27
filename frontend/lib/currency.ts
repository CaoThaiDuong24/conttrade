// Utility functions for formatting currency in Vietnamese locale

/**
 * Format number to Vietnamese currency (VND)
 * @param amount - Amount in string or number format
 * @returns Formatted string with VND currency
 */
export function formatVND(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  return `${numAmount.toLocaleString('vi-VN')} VND`;
}

/**
 * Format number to Vietnamese locale without currency
 * @param amount - Amount in string or number format
 * @returns Formatted string without currency
 */
export function formatNumber(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  return numAmount.toLocaleString('vi-VN');
}

/**
 * Format currency with proper Vietnamese formatting
 * @param amount - Amount in string or number format
 * @param currency - Currency code (defaults to VND)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: string | number, currency = 'VND'): string {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  
  // Always display as VND for Vietnamese market
  return `${numAmount.toLocaleString('vi-VN')} VND`;
}

/**
 * Format price with Vietnamese formatting
 * Handles both unit price and total price formatting
 */
export function formatPrice(amount: string | number): string {
  return formatVND(amount);
}

/**
 * Vietnamese number words (for display purposes)
 * @param amount - Amount to convert to words
 * @returns Vietnamese text representation
 */
export function formatVietnameseWords(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  // This is a simplified version - full implementation would be more complex
  if (numAmount >= 1000000000) {
    return `${Math.round(numAmount / 1000000000)} tỷ đồng`;
  } else if (numAmount >= 1000000) {
    return `${Math.round(numAmount / 1000000)} triệu đồng`;
  } else if (numAmount >= 1000) {
    return `${Math.round(numAmount / 1000)} nghìn đồng`;
  }
  return `${numAmount} đồng`;
}