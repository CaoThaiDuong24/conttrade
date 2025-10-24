/**
 * Container Type Utilities
 * 
 * Maps container type codes to Vietnamese labels
 * Based on md_container_types master data table
 */

/**
 * Container type mappings from database
 * These are the standard container types
 */
const CONTAINER_TYPE_LABELS: Record<string, string> = {
  // Standard types
  'DRY': 'Thùng khô',
  'REEFER': 'Thùng lạnh',
  'OPEN_TOP': 'Thùng hở nóc',
  'FLAT_RACK': 'Thùng phẳng',
  'TANK': 'Thùng bồn',
  'PLATFORM': 'Sàn phẳng',
  'HIGH_CUBE': 'Thùng cao',
  
  // Alternative codes
  'dry': 'Thùng khô',
  'reefer': 'Thùng lạnh',
  'open_top': 'Thùng hở nóc',
  'flat_rack': 'Thùng phẳng',
  'tank': 'Thùng bồn',
  'platform': 'Sàn phẳng',
  'high_cube': 'Thùng cao',
  
  // Uppercase variations
  'OPENTOP': 'Thùng hở nóc',
  'FLATRACK': 'Thùng phẳng',
  'HIGHCUBE': 'Thùng cao',
};

/**
 * Get Vietnamese label for container type
 * @param type - Container type code from database
 * @returns Vietnamese label
 */
export function getTypeLabel(type: string | number | undefined | null): string {
  if (!type) return 'N/A';
  
  const typeStr = String(type).trim();
  
  // Direct mapping
  if (CONTAINER_TYPE_LABELS[typeStr]) {
    return CONTAINER_TYPE_LABELS[typeStr];
  }
  
  // Try uppercase
  const upperType = typeStr.toUpperCase();
  if (CONTAINER_TYPE_LABELS[upperType]) {
    return CONTAINER_TYPE_LABELS[upperType];
  }
  
  // Try lowercase
  const lowerType = typeStr.toLowerCase();
  if (CONTAINER_TYPE_LABELS[lowerType]) {
    return CONTAINER_TYPE_LABELS[lowerType];
  }
  
  // If no mapping found, return the original value
  // This handles cases where the value is already in Vietnamese
  return typeStr;
}

/**
 * Get all available container types
 * @returns Array of container type options
 */
export function getContainerTypes() {
  return [
    { code: 'DRY', label: 'Thùng khô' },
    { code: 'REEFER', label: 'Thùng lạnh' },
    { code: 'OPEN_TOP', label: 'Thùng hở nóc' },
    { code: 'FLAT_RACK', label: 'Thùng phẳng' },
    { code: 'TANK', label: 'Thùng bồn' },
    { code: 'PLATFORM', label: 'Sàn phẳng' },
    { code: 'HIGH_CUBE', label: 'Thùng cao' },
  ];
}

/**
 * Check if a type code is valid
 * @param type - Type code to check
 * @returns True if valid
 */
export function isValidType(type: string): boolean {
  if (!type) return false;
  const upperType = type.toUpperCase();
  return Object.keys(CONTAINER_TYPE_LABELS).some(key => key.toUpperCase() === upperType);
}
