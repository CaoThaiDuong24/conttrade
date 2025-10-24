/**
 * Container Condition Utilities
 * Handles mapping between condition codes and Vietnamese display names
 */

export type ConditionCode = 'NEW' | 'USED' | 'REFURBISHED' | 'DAMAGED' | 'new' | 'used' | 'refurbished' | 'damaged';

/**
 * Condition mapping - Vietnamese labels
 */
export const CONDITION_LABELS: Record<string, string> = {
  // Uppercase versions
  NEW: 'Mới',
  USED: 'Đã qua sử dụng',
  REFURBISHED: 'Đã tân trang',
  DAMAGED: 'Hư hỏng',
  // Lowercase versions for compatibility
  new: 'Mới',
  used: 'Đã qua sử dụng',
  refurbished: 'Đã tân trang',
  damaged: 'Hư hỏng',
};

/**
 * Badge variant mapping for conditions
 */
export const CONDITION_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  NEW: 'default',
  USED: 'secondary',
  REFURBISHED: 'outline',
  DAMAGED: 'destructive',
  new: 'default',
  used: 'secondary',
  refurbished: 'outline',
  damaged: 'destructive',
};

/**
 * Get Vietnamese label for condition
 */
export function getConditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] || condition;
}

/**
 * Get badge variant for condition
 */
export function getConditionVariant(condition: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  return CONDITION_VARIANTS[condition] || 'outline';
}

/**
 * Get display name for condition (alias for getConditionLabel)
 */
export function getConditionDisplayName(condition: string): string {
  return getConditionLabel(condition);
}

/**
 * Check if condition is damaged
 */
export function isDamagedCondition(condition: string): boolean {
  return condition?.toUpperCase() === 'DAMAGED';
}

/**
 * Check if condition is new
 */
export function isNewCondition(condition: string): boolean {
  return condition?.toUpperCase() === 'NEW';
}

/**
 * Get all condition options for select
 */
export function getConditionOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'NEW', label: 'Mới' },
    { value: 'USED', label: 'Đã qua sử dụng' },
    { value: 'REFURBISHED', label: 'Đã tân trang' },
    { value: 'DAMAGED', label: 'Hư hỏng' },
  ];
}
