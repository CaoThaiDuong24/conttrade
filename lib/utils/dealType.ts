/**
 * Deal Type Mapping Utilities
 * Handles mapping between API deal type codes and display names
 */

export type DealTypeCode = 'SALE' | 'RENTAL' | 'LEASE' | 'SWAP';
export type DealTypeDisplay = 'sale' | 'rental' | 'lease' | 'swap';

/**
 * Map API deal type code to display name in Vietnamese
 */
export function getDealTypeDisplayName(code: string): string {
  switch (code?.toUpperCase()) {
    case 'SALE':
      return 'Bán';
    case 'RENTAL':
      return 'Thuê ngắn hạn';
    case 'LEASE':
      return 'Thuê dài hạn';
    case 'SWAP':
      return 'Trao đổi';
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
    case 'LEASE':
      return 'rental';
    case 'SWAP':
      return 'swap';
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
    case 'LEASE':
      return 'secondary';
    case 'SWAP':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Check if deal type is rental (includes both RENTAL and LEASE)
 */
export function isRentalType(code: string): boolean {
  const upperCode = code?.toUpperCase();
  return upperCode === 'RENTAL' || upperCode === 'LEASE';
}

/**
 * Check if deal type is sale
 */
export function isSaleType(code: string): boolean {
  return code?.toUpperCase() === 'SALE';
}