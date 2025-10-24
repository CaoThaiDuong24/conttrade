/**
 * Container Size Utilities
 * 
 * Utility functions for displaying container size labels in Vietnamese
 * Uses real data from API instead of hardcoded mapping
 */

/**
 * Get Vietnamese display label for a size
 * @param size - Size value from database (e.g., 20, 40, 45)
 * @returns Formatted size label with "feet" unit
 */
export function getSizeLabel(size: string | number | undefined | null): string {
  if (!size) return 'N/A';
  
  const sizeStr = size.toString().trim();
  
  // For numeric values, add 'feet' suffix
  if (!isNaN(Number(sizeStr))) {
    return `${sizeStr} feet`;
  }
  
  // Handle special codes like "20HC", "40HC"
  if (sizeStr.toUpperCase().includes('HC')) {
    const numericPart = sizeStr.match(/\d+/)?.[0];
    if (numericPart) {
      return `${numericPart} feet (High Cube)`;
    }
  }
  
  // Return as-is if no match
  return sizeStr;
}

/**
 * Get size display name with full formatting
 * @param size - Size code
 * @returns Formatted size display name
 */
export function getSizeDisplayName(size: string | number | undefined | null): string {
  return getSizeLabel(size);
}

/**
 * Check if a size is a high cube variant
 * @param size - Size code
 * @returns true if high cube variant
 */
export function isHighCube(size: string | number | undefined | null): boolean {
  if (!size) return false;
  const sizeStr = size.toString().toUpperCase();
  return sizeStr.includes('HC') || sizeStr.includes('HIGH');
}

/**
 * Get numeric value from size code
 * @param size - Size code (e.g., '20', '40HC')
 * @returns Numeric size value in feet
 */
export function getSizeNumericValue(size: string | number | undefined | null): number {
  if (!size) return 0;
  
  const sizeStr = size.toString().trim();
  
  // Extract numeric part (e.g., '40HC' -> 40)
  const match = sizeStr.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}

/**
 * Format size with Vietnamese measurement unit
 * @param size - Size code
 * @returns Formatted size with unit
 */
export function formatSizeWithUnit(size: string | number | undefined | null): string {
  return getSizeLabel(size);
}
