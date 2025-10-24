/**
 * Quality Standard Utilities
 * 
 * Utility functions for displaying quality standard labels in Vietnamese
 * Maps codes from md_quality_standards table to Vietnamese names
 */

/**
 * Vietnamese labels for quality standards from database
 * Based on md_quality_standards table with name_vi field
 */
const STANDARD_LABELS: Record<string, string> = {
  // From database (uppercase)
  'WWT': 'Kín gió và nước',
  'CW': 'Đạt chuẩn vận chuyển hàng',
  'IICL': 'Tiêu chuẩn IICL',
  'ASIS': 'Nguyên trạng',
  
  // Lowercase variants for compatibility
  'ww': 'Kín gió và nước',
  'cw': 'Đạt chuẩn vận chuyển hàng',
  'iicl': 'Tiêu chuẩn IICL',
  'asis': 'Nguyên trạng',
};

/**
 * Get Vietnamese display label for a quality standard
 * @param standard - Standard code from database (e.g., 'WWT', 'CW', 'IICL', 'ASIS')
 * @returns Vietnamese standard label
 */
export function getStandardLabel(standard: string | undefined | null): string {
  if (!standard) return 'N/A';
  
  const standardStr = standard.toString().trim();
  
  // If it's already a formatted name (long string with spaces), return as-is
  // This handles cases where API already returns name_vi
  if (standardStr.length > 10 || standardStr.includes(' ')) {
    return standardStr;
  }
  
  // Try uppercase match
  const upperStandard = standardStr.toUpperCase();
  if (STANDARD_LABELS[upperStandard]) {
    return STANDARD_LABELS[upperStandard];
  }
  
  // Try lowercase match
  const lowerStandard = standardStr.toLowerCase();
  if (STANDARD_LABELS[lowerStandard]) {
    return STANDARD_LABELS[lowerStandard];
  }
  
  // Try exact match
  if (STANDARD_LABELS[standardStr]) {
    return STANDARD_LABELS[standardStr];
  }
  
  // Return original if no match found
  return standardStr;
}

/**
 * Get standard display name with full formatting
 * @param standard - Standard code or name
 * @returns Formatted standard display name
 */
export function getStandardDisplayName(standard: string | undefined | null): string {
  return getStandardLabel(standard);
}
