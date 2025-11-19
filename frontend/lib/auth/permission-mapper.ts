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
  
  // RFQ mappings
  'rfq.read': 'PM-020',                // RFQ_CREATE (view own RFQs)
  'rfq.write': 'PM-020',               // RFQ_CREATE
  'rfq.respond': 'PM-022',             // RFQ_RESPOND
  
  // Order mappings
  'orders.read': 'PM-030',             // ORDERS_MANAGE
  'orders.write': 'PM-030',            // ORDERS_MANAGE
  'orders.process': 'PM-030',          // ORDERS_MANAGE
  
  // Payment mappings
  'payments.view': 'PM-040',           // PAYMENTS_PROCESS
  'payments.process': 'PM-040',        // PAYMENTS_PROCESS
  'payments.escrow': 'PM-041',         // ESCROW_MANAGE
  
  // Review mappings
  'reviews.read': 'PM-060',            // REVIEWS_MANAGE
  'reviews.write': 'PM-060',           // REVIEWS_MANAGE
  'reviews.moderate': 'PM-060',        // REVIEWS_MANAGE
  
  // Dispute mappings
  'disputes.read': 'PM-050',           // DISPUTES_MANAGE
  'disputes.write': 'PM-050',          // DISPUTES_MANAGE
  'disputes.resolve': 'PM-050',        // DISPUTES_MANAGE
  
  // Account mappings
  'account.read': 'dashboard.view',    // Everyone can access their account
  'account.write': 'dashboard.view',   // Everyone can edit their account
  'account.verify': 'dashboard.view',  // Everyone can verify
  
  // Keep new format as-is
  'PM-001': 'PM-001',
  'PM-002': 'PM-002',
  'PM-003': 'PM-003',
  'PM-010': 'PM-010',
  'PM-011': 'PM-011',
  'PM-012': 'PM-012',
  'PM-013': 'PM-013',
  'PM-014': 'PM-014',
  'PM-020': 'PM-020',
  'PM-022': 'PM-022',
  'PM-030': 'PM-030',
  'PM-040': 'PM-040',
  'PM-041': 'PM-041',
  'PM-042': 'PM-042',
  'PM-043': 'PM-043',
  'PM-050': 'PM-050',
  'PM-060': 'PM-060',
  'PM-070': 'PM-070',
  
  // Rental Management Permissions (PM-100 to PM-141)
  'PM-100': 'PM-100',  // VIEW_RENTAL_CONTRACTS
  'PM-101': 'PM-101',  // CREATE_RENTAL_CONTRACT
  'PM-102': 'PM-102',  // EDIT_RENTAL_CONTRACT
  'PM-103': 'PM-103',  // EXTEND_RENTAL_CONTRACT
  'PM-104': 'PM-104',  // TERMINATE_RENTAL_CONTRACT
  'PM-105': 'PM-105',  // COMPLETE_RENTAL_CONTRACT
  'PM-110': 'PM-110',  // MANAGE_RENTAL_CONTAINERS
  'PM-111': 'PM-111',  // UPDATE_RENTAL_PRICING
  'PM-112': 'PM-112',  // VIEW_RENTAL_STATS
  'PM-120': 'PM-120',  // VIEW_MAINTENANCE_LOGS
  'PM-121': 'PM-121',  // CREATE_MAINTENANCE
  'PM-122': 'PM-122',  // UPDATE_MAINTENANCE
  'PM-123': 'PM-123',  // CANCEL_MAINTENANCE
  'PM-130': 'PM-130',  // VIEW_MY_RENTALS
  'PM-131': 'PM-131',  // REQUEST_RENTAL_EXTENSION
  'PM-132': 'PM-132',  // REPORT_CONTAINER_ISSUE
  'PM-133': 'PM-133',  // VIEW_RENTAL_INVOICES
  'PM-140': 'PM-140',  // MANAGE_RENTAL_PAYMENTS
  'PM-141': 'PM-141',  // VIEW_RENTAL_REPORTS
  
  // Other permissions (map to existing PM codes for buyer/seller access)
  'dashboard.view': 'dashboard.view',
  
  // Inspection & Delivery are part of order process → PM-030
  'inspection.read': 'PM-030',         // Part of ORDERS_MANAGE
  'inspection.schedule': 'PM-030',     // Part of ORDERS_MANAGE
  'delivery.read': 'PM-030',           // Part of ORDERS_MANAGE
  'delivery.track': 'PM-030',          // Part of ORDERS_MANAGE
  'delivery.request': 'PM-030',        // Part of ORDERS_MANAGE
  
  // Keep inspector/depot staff permissions as-is (for those specific roles)
  'inspection.write': 'inspection.write',
  'delivery.write': 'delivery.write',
  'delivery.schedule': 'delivery.schedule',
  'depot.read': 'depot.read',
  'depot.write': 'depot.write',
  'depot.inventory': 'depot.inventory',
  'depot.inspect': 'depot.inspect',
  'depot.repair': 'depot.repair',
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
  
  // Rental Management Permissions (PM-100 to PM-141)
  'PM-100': 'Xem danh sách hợp đồng cho thuê',
  'PM-101': 'Tạo hợp đồng cho thuê mới',
  'PM-102': 'Chỉnh sửa hợp đồng cho thuê',
  'PM-103': 'Gia hạn hợp đồng cho thuê',
  'PM-104': 'Kết thúc hợp đồng cho thuê',
  'PM-105': 'Hoàn thành hợp đồng cho thuê',
  'PM-110': 'Quản lý container cho thuê',
  'PM-111': 'Cập nhật giá cho thuê',
  'PM-112': 'Xem thống kê cho thuê',
  'PM-120': 'Xem nhật ký bảo trì',
  'PM-121': 'Tạo lịch bảo trì',
  'PM-122': 'Cập nhật bảo trì',
  'PM-123': 'Hủy bảo trì',
  'PM-130': 'Xem hợp đồng thuê của tôi',
  'PM-131': 'Yêu cầu gia hạn thuê',
  'PM-132': 'Báo cáo vấn đề container',
  'PM-133': 'Xem hóa đơn thuê',
  'PM-140': 'Quản lý thanh toán cho thuê',
  'PM-141': 'Xem báo cáo cho thuê',
  
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
