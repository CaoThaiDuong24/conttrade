/**
 * Deal Type Mapping Utilities
 * Handles mapping between API deal type codes and display names
 */

export type DealTypeCode = 'SALE' | 'RENTAL';
export type DealTypeDisplay = 'sale' | 'rental';

/**
 * Map API deal type code to display name in Vietnamese
 */
export function getDealTypeDisplayName(code: string): string {
  switch (code?.toUpperCase()) {
    case 'SALE':
      return 'Bán';
    case 'RENTAL':
      return 'Thuê';
    default:
      return code || 'N/A';
  }
}

/**
 * Map API deal type code to frontend display type
 */
export function getDealTypeDisplay(code: string): DealTypeDisplay {
  switch (code?.toUpperCase()) {
    case 'SALE':
      return 'sale';
    case 'RENTAL':
      return 'rental';
    default:
      return 'sale';
  }
}

/**
 * Get badge variant for deal type
 */
export function getDealTypeBadgeVariant(code: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (code?.toUpperCase()) {
    case 'SALE':
      return 'default';
    case 'RENTAL':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Check if deal type is rental
 */
export function isRentalType(code: string): boolean {
  const upperCode = code?.toUpperCase();
  return upperCode === 'RENTAL';
}

/**
 * Check if deal type is sale
 */
export function isSaleType(code: string): boolean {
  return code?.toUpperCase() === 'SALE';
}