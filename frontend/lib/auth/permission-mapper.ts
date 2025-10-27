/**
 * Permission Mapper Service
 * Maps legacy permission format to new PM-XXX format
 * This provides backward compatibility during migration
 */

export const PERMISSION_MAPPING: Record<string, string | string[]> = {
  // Legacy → New mapping
  'listings.read': 'PM-001',           // VIEW_PUBLIC_LISTINGS
  'listings.write': ['PM-010', 'PM-011'], // CREATE_LISTING + EDIT_LISTING
  'listings.delete': 'PM-014',         // DELETE_LISTING
  'listings.approve': 'PM-070',        // ADMIN_REVIEW_LISTING
  'listings.moderate': 'PM-070',       // ADMIN_REVIEW_LISTING
  
  // Keep new format as-is
  'PM-001': 'PM-001',
  'PM-002': 'PM-002',
  'PM-010': 'PM-010',
  'PM-011': 'PM-011',
  'PM-012': 'PM-012',
  'PM-013': 'PM-013',
  'PM-014': 'PM-014',
  'PM-070': 'PM-070',
  
  // Other permissions (keep as-is for now)
  'dashboard.view': 'dashboard.view',
  'account.read': 'account.read',
  'account.write': 'account.write',
  'account.verify': 'account.verify',
  'rfq.read': 'rfq.read',
  'rfq.write': 'rfq.write',
  'rfq.respond': 'rfq.respond',
  'orders.read': 'orders.read',
  'orders.write': 'orders.write',
  'orders.process': 'orders.process',
  'payments.view': 'payments.view',
  'payments.escrow': 'payments.escrow',
  'payments.process': 'payments.process',
  'delivery.read': 'delivery.read',
  'delivery.write': 'delivery.write',
  'delivery.track': 'delivery.track',
  'delivery.schedule': 'delivery.schedule',
  'depot.read': 'depot.read',
  'depot.write': 'depot.write',
  'depot.inventory': 'depot.inventory',
  'depot.inspect': 'depot.inspect',
  'depot.repair': 'depot.repair',
  'inspection.read': 'inspection.read',
  'inspection.write': 'inspection.write',
  'inspection.schedule': 'inspection.schedule',
  'reviews.read': 'reviews.read',
  'reviews.write': 'reviews.write',
  'reviews.moderate': 'reviews.moderate',
  'disputes.read': 'disputes.read',
  'disputes.write': 'disputes.write',
  'disputes.resolve': 'disputes.resolve',
  'billing.read': 'billing.read',
  'billing.write': 'billing.write',
  'admin.access': 'admin.access',
  'admin.users': 'admin.users',
  'admin.moderate': 'admin.moderate',
  'admin.settings': 'admin.settings',
  'admin.audit': 'admin.audit',
  'admin.analytics': 'admin.analytics',
};

/**
 * Normalize a permission code to the new format
 * @param permission - Legacy or new permission code
 * @returns Normalized permission code(s)
 */
export function normalizePermission(permission: string): string[] {
  const mapped = PERMISSION_MAPPING[permission];
  
  if (!mapped) {
    console.warn(`⚠️  Permission "${permission}" not found in mapping, using as-is`);
    return [permission];
  }
  
  return Array.isArray(mapped) ? mapped : [mapped];
}

/**
 * Check if a permission is a legacy format
 */
export function isLegacyPermission(permission: string): boolean {
  return permission.includes('.') && !permission.startsWith('PM-');
}

/**
 * Get the display name for a permission
 */
export const PERMISSION_NAMES: Record<string, string> = {
  'PM-001': 'Xem tin đăng công khai',
  'PM-002': 'Tìm kiếm tin đăng',
  'PM-010': 'Tạo tin đăng',
  'PM-011': 'Sửa tin đăng',
  'PM-012': 'Gửi duyệt/Xuất bản',
  'PM-013': 'Lưu trữ tin đăng',
  'PM-014': 'Xóa tin đăng',
  'PM-070': 'Duyệt tin đăng (Admin)',
  
  // Legacy names (for backward compatibility)
  'listings.read': 'Xem tin đăng',
  'listings.write': 'Tạo/Sửa tin đăng',
  'listings.delete': 'Xóa tin đăng',
  'listings.approve': 'Duyệt tin đăng',
  'listings.moderate': 'Kiểm duyệt tin đăng',
};

/**
 * Get user-friendly name for permission
 */
export function getPermissionName(permission: string): string {
  return PERMISSION_NAMES[permission] || permission;
}
