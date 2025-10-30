/**
 * COMPLETE SEED FILE - i-ContExchange Platform
 * 
 * Tổng hợp toàn bộ dữ liệu seed cần thiết cho hệ thống:
 * 1. RBAC System (10 Roles, 53 Permissions, 10 Demo Users)
 * 2. Master Data (48 bảng md_* - TẤT CẢ các bảng master data)
 * 
 * Run: node scripts/seed/seed-complete.mjs
 * 
 * Danh sách 48 bảng md_* được seed:
 * - md_unlocodes, md_adjust_reasons, md_business_hours_policies
 * - md_cancel_reasons, md_cities, md_commission_codes
 * - md_container_sizes, md_container_types, md_container_statuses
 * - md_countries, md_currencies, md_deal_types
 * - md_delivery_event_types, md_delivery_statuses
 * - md_dispute_reasons, md_dispute_statuses, md_document_types
 * - md_feature_flag_codes, md_fee_codes, md_form_schema_codes
 * - md_i18n_namespaces, md_inspection_item_codes, md_inspection_statuses
 * - md_insurance_coverages, md_integration_vendor_codes
 * - md_listing_statuses, md_movement_types
 * - md_notification_channels, md_notification_event_types
 * - md_order_statuses, md_payment_failure_reasons, md_payment_methods
 * - md_payment_statuses, md_pricing_regions, md_provinces
 * - md_quality_standards, md_rating_scales, md_redaction_channels
 * - md_ref_doc_types, md_rental_units, md_repair_item_codes
 * - md_rfq_statuses, md_quote_statuses
 * - md_sla_codes, md_tax_codes, md_template_codes
 * - md_units, md_violation_codes
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

// ============================================================================
// SECTION 1: RBAC SYSTEM (Roles, Permissions, Users)
// ============================================================================

async function seedRBAC() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║         SECTION 1: RBAC SYSTEM SEEDING                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1.1 Create 10 Roles
  console.log('🎭 Creating 10 roles...');
  
  const adminRole = await prisma.roles.upsert({
    where: { code: 'admin' },
    update: {},
    create: { id: 'admin-role-id', code: 'admin', name: 'Quản trị viên', level: 100, is_system_role: true, updated_at: new Date() }
  });

  const configManagerRole = await prisma.roles.upsert({
    where: { code: 'config_manager' },
    update: {},
    create: { id: 'config-role-id', code: 'config_manager', name: 'Quản lý cấu hình', level: 80, updated_at: new Date() }
  });

  const financeRole = await prisma.roles.upsert({
    where: { code: 'finance' },
    update: {},
    create: { id: 'finance-role-id', code: 'finance', name: 'Kế toán', level: 70, updated_at: new Date() }
  });

  const priceManagerRole = await prisma.roles.upsert({
    where: { code: 'price_manager' },
    update: {},
    create: { id: 'price-role-id', code: 'price_manager', name: 'Quản lý giá', level: 60, updated_at: new Date() }
  });

  const customerSupportRole = await prisma.roles.upsert({
    where: { code: 'customer_support' },
    update: {},
    create: { id: 'support-role-id', code: 'customer_support', name: 'Hỗ trợ khách hàng', level: 50, updated_at: new Date() }
  });

  const depotManagerRole = await prisma.roles.upsert({
    where: { code: 'depot_manager' },
    update: {},
    create: { id: 'depot-manager-role-id', code: 'depot_manager', name: 'Quản lý kho bãi', level: 30, updated_at: new Date() }
  });

  const inspectorRole = await prisma.roles.upsert({
    where: { code: 'inspector' },
    update: {},
    create: { id: 'inspector-role-id', code: 'inspector', name: 'Giám định viên', level: 25, updated_at: new Date() }
  });

  const depotStaffRole = await prisma.roles.upsert({
    where: { code: 'depot_staff' },
    update: {},
    create: { id: 'depot-staff-role-id', code: 'depot_staff', name: 'Nhân viên kho', level: 20, updated_at: new Date() }
  });

  const sellerRole = await prisma.roles.upsert({
    where: { code: 'seller' },
    update: {},
    create: { id: 'seller-role-id', code: 'seller', name: 'Người bán', level: 10, updated_at: new Date() }
  });

  const buyerRole = await prisma.roles.upsert({
    where: { code: 'buyer' },
    update: {},
    create: { id: 'buyer-role-id', code: 'buyer', name: 'Người mua', level: 10, updated_at: new Date() }
  });

  console.log('✅ Created 10 roles');

  // 1.2 Create 53 Permissions
  console.log('🔐 Creating 53 permissions...');
  
  const permissions = [
    // Public & Viewing Permissions (PM-001 to PM-003)
    { code: 'PM-001', name: 'VIEW_PUBLIC_LISTINGS', description: 'Xem tin công khai', category: 'listings' },
    { code: 'PM-002', name: 'SEARCH_LISTINGS', description: 'Tìm kiếm, lọc tin', category: 'listings' },
    { code: 'PM-003', name: 'VIEW_SELLER_PROFILE', description: 'Xem hồ sơ người bán', category: 'users' },
    
    // Listing Management Permissions (PM-010 to PM-014)
    { code: 'PM-010', name: 'CREATE_LISTING', description: 'Tạo tin đăng', category: 'listings' },
    { code: 'PM-011', name: 'EDIT_LISTING', description: 'Sửa tin đăng', category: 'listings' },
    { code: 'PM-012', name: 'PUBLISH_LISTING', description: 'Gửi duyệt/Xuất bản tin', category: 'listings' },
    { code: 'PM-013', name: 'ARCHIVE_LISTING', description: 'Ẩn/Lưu trữ tin', category: 'listings' },
    { code: 'PM-014', name: 'DELETE_LISTING', description: 'Xóa tin đăng', category: 'listings' },
    
    // RFQ & Quote Permissions (PM-020 to PM-024)
    { code: 'PM-020', name: 'CREATE_RFQ', description: 'Tạo RFQ (yêu cầu báo giá)', category: 'rfq' },
    { code: 'PM-021', name: 'ISSUE_QUOTE', description: 'Phát hành báo giá', category: 'quotes' },
    { code: 'PM-022', name: 'VIEW_QUOTES', description: 'Xem/so sánh báo giá', category: 'quotes' },
    { code: 'PM-023', name: 'MANAGE_QA', description: 'Quản lý Q&A có kiểm duyệt', category: 'qa' },
    { code: 'PM-024', name: 'REDACTION_ENFORCE', description: 'Thực thi che thông tin liên hệ', category: 'moderation' },
    
    // Inspection Permissions (PM-030 to PM-031)
    { code: 'PM-030', name: 'REQUEST_INSPECTION', description: 'Yêu cầu giám định', category: 'inspection' },
    { code: 'PM-031', name: 'VIEW_INSPECTION_REPORT', description: 'Xem báo cáo giám định', category: 'inspection' },
    
    // Order Permissions (PM-040 to PM-043)
    { code: 'PM-040', name: 'CREATE_ORDER', description: 'Tạo đơn hàng', category: 'orders' },
    { code: 'PM-041', name: 'PAY_ESCROW', description: 'Thanh toán ký quỹ', category: 'payments' },
    { code: 'PM-042', name: 'REQUEST_DELIVERY', description: 'Yêu cầu vận chuyển', category: 'delivery' },
    { code: 'PM-042B', name: 'VIEW_DELIVERY', description: 'Xem thông tin vận chuyển', category: 'delivery' },
    { code: 'PM-043', name: 'CONFIRM_RECEIPT', description: 'Xác nhận nhận hàng', category: 'orders' },
    
    // Review & Dispute Permissions (PM-050, PM-060, PM-061)
    { code: 'PM-050', name: 'RATE_AND_REVIEW', description: 'Đánh giá sau giao dịch', category: 'reviews' },
    { code: 'PM-060', name: 'FILE_DISPUTE', description: 'Khiếu nại', category: 'disputes' },
    { code: 'PM-061', name: 'RESOLVE_DISPUTE', description: 'Xử lý tranh chấp', category: 'disputes' },
    
    // Admin Permissions (PM-070 to PM-074)
    { code: 'PM-070', name: 'ADMIN_REVIEW_LISTING', description: 'Duyệt tin đăng', category: 'admin' },
    { code: 'PM-071', name: 'ADMIN_MANAGE_USERS', description: 'Quản lý người dùng/vai trò', category: 'admin' },
    { code: 'PM-072', name: 'ADMIN_VIEW_DASHBOARD', description: 'Xem KPI dashboard', category: 'admin' },
    { code: 'PM-073', name: 'ADMIN_CONFIG_PRICING', description: 'Cấu hình phí, gói', category: 'admin' },
    { code: 'PM-074', name: 'MANAGE_PRICE_RULES', description: 'Quản lý Pricing Rules/price band', category: 'pricing' },
    
    // Depot Inventory Permissions (PM-080 to PM-086)
    { code: 'PM-080', name: 'DEPOT_CREATE_JOB', description: 'Tạo lệnh việc depot', category: 'depot' },
    { code: 'PM-081', name: 'DEPOT_UPDATE_JOB', description: 'Cập nhật công việc depot', category: 'depot' },
    { code: 'PM-082', name: 'DEPOT_ISSUE_EIR', description: 'Lập EIR', category: 'depot' },
    { code: 'PM-083', name: 'DEPOT_VIEW_STOCK', description: 'Xem tồn kho depot', category: 'depot' },
    { code: 'PM-084', name: 'DEPOT_VIEW_MOVEMENTS', description: 'Xem nhật ký nhập-xuất-chuyển', category: 'depot' },
    { code: 'PM-085', name: 'DEPOT_ADJUST_STOCK', description: 'Điều chỉnh tồn (manual IN/OUT)', category: 'depot' },
    { code: 'PM-086', name: 'DEPOT_TRANSFER_STOCK', description: 'Chuyển giữa các Depot', category: 'depot' },
    
    // Finance Permissions (PM-090 to PM-091)
    { code: 'PM-090', name: 'FINANCE_RECONCILE', description: 'Đối soát/giải ngân', category: 'finance' },
    { code: 'PM-091', name: 'FINANCE_INVOICE', description: 'Xuất hóa đơn', category: 'finance' },
    { code: 'PM-091B', name: 'VIEW_SELLER_INVOICES', description: 'Xem hóa đơn/doanh thu seller', category: 'billing' },
    
    // Customer Support Permission (PM-100)
    { code: 'PM-100', name: 'CS_MANAGE_TICKETS', description: 'Xử lý yêu cầu hỗ trợ', category: 'support' },
    
    // Configuration Management Permissions (PM-110 to PM-125)
    { code: 'PM-110', name: 'CONFIG_NAMESPACE_RW', description: 'Tạo/sửa namespace cấu hình', category: 'config' },
    { code: 'PM-111', name: 'CONFIG_ENTRY_RW', description: 'Tạo/sửa entry cấu hình', category: 'config' },
    { code: 'PM-112', name: 'CONFIG_PUBLISH', description: 'Phát hành cấu hình, rollback phiên bản', category: 'config' },
    { code: 'PM-113', name: 'FEATURE_FLAG_RW', description: 'Quản lý feature flags/rollout', category: 'config' },
    { code: 'PM-114', name: 'TAX_RATE_RW', description: 'Quản lý thuế', category: 'config' },
    { code: 'PM-115', name: 'FEE_SCHEDULE_RW', description: 'Quản lý biểu phí', category: 'config' },
    { code: 'PM-116', name: 'COMMISSION_RULE_RW', description: 'Quản lý hoa hồng', category: 'config' },
    { code: 'PM-117', name: 'TEMPLATE_RW', description: 'Quản lý template thông báo', category: 'config' },
    { code: 'PM-118', name: 'I18N_RW', description: 'Quản lý từ điển i18n', category: 'config' },
    { code: 'PM-119', name: 'FORM_SCHEMA_RW', description: 'Quản lý biểu mẫu (JSON Schema)', category: 'config' },
    { code: 'PM-120', name: 'SLA_RW', description: 'Quản lý SLA', category: 'config' },
    { code: 'PM-121', name: 'BUSINESS_HOURS_RW', description: 'Quản lý lịch làm việc', category: 'config' },
    { code: 'PM-122', name: 'DEPOT_CALENDAR_RW', description: 'Quản lý lịch đóng Depot', category: 'config' },
    { code: 'PM-123', name: 'INTEGRATION_CONFIG_RW', description: 'Quản lý cấu hình tích hợp (vendor)', category: 'config' },
    { code: 'PM-124', name: 'PAYMENT_METHOD_RW', description: 'Quản lý phương thức thanh toán', category: 'config' },
    { code: 'PM-125', name: 'PARTNER_RW', description: 'Quản lý đối tác (carrier/insurer/PSP/DMS)', category: 'config' },
  ];

  for (const perm of permissions) {
    await prisma.permissions.upsert({
      where: { code: perm.code },
      update: { name: perm.name },
      create: { 
        id: `perm-${perm.code.toLowerCase()}`,
        ...perm,
        updated_at: new Date()
      }
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // 1.3 Create 10 Demo Users
  console.log('👥 Creating 10 demo users...');
  
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@i-contexchange.vn' },
    update: {},
    create: {
      id: uuid(),
      email: 'admin@i-contexchange.vn',
      password_hash: await bcrypt.hash('admin123', 10),
      display_name: 'Quản trị viên hệ thống',
      phone: '+84901234567',
      status: 'ACTIVE',
      kyc_status: 'VERIFIED',
      updated_at: new Date()
    }
  });

  const configUser = await prisma.users.upsert({
    where: { email: 'config@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'config@example.com',
      password_hash: await bcrypt.hash('config123', 10),
      display_name: 'Quản lý cấu hình',
      phone: '+84901234568',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const financeUser = await prisma.users.upsert({
    where: { email: 'finance@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'finance@example.com',
      password_hash: await bcrypt.hash('finance123', 10),
      display_name: 'Kế toán',
      phone: '+84901234569',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const priceUser = await prisma.users.upsert({
    where: { email: 'price@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'price@example.com',
      password_hash: await bcrypt.hash('price123', 10),
      display_name: 'Quản lý giá',
      phone: '+84901234570',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const supportUser = await prisma.users.upsert({
    where: { email: 'support@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'support@example.com',
      password_hash: await bcrypt.hash('support123', 10),
      display_name: 'Hỗ trợ khách hàng',
      phone: '+84901234571',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const managerUser = await prisma.users.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'manager@example.com',
      password_hash: await bcrypt.hash('manager123', 10),
      display_name: 'Quản lý kho bãi',
      phone: '+84901234572',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const inspectorUser = await prisma.users.upsert({
    where: { email: 'inspector@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'inspector@example.com',
      password_hash: await bcrypt.hash('inspector123', 10),
      display_name: 'Giám định viên',
      phone: '+84901234573',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const depotUser = await prisma.users.upsert({
    where: { email: 'depot@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'depot@example.com',
      password_hash: await bcrypt.hash('depot123', 10),
      display_name: 'Nhân viên kho',
      phone: '+84901234574',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const sellerUser = await prisma.users.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'seller@example.com',
      password_hash: await bcrypt.hash('seller123', 10),
      display_name: 'Người bán container',
      phone: '+84901234575',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  const buyerUser = await prisma.users.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'buyer@example.com',
      password_hash: await bcrypt.hash('buyer123', 10),
      display_name: 'Người mua container',
      phone: '+84901234576',
      status: 'ACTIVE',
      updated_at: new Date()
    }
  });

  console.log('✅ Created 10 demo users');

  // 1.4 Assign roles to users
  console.log('🔗 Assigning roles to users...');
  
  const roleAssignments = [
    { user: adminUser, role: adminRole },
    { user: configUser, role: configManagerRole },
    { user: financeUser, role: financeRole },
    { user: priceUser, role: priceManagerRole },
    { user: supportUser, role: customerSupportRole },
    { user: managerUser, role: depotManagerRole },
    { user: inspectorUser, role: inspectorRole },
    { user: depotUser, role: depotStaffRole },
    { user: sellerUser, role: sellerRole },
    { user: buyerUser, role: buyerRole },
  ];

  for (const { user, role } of roleAssignments) {
    await prisma.user_roles.upsert({
      where: {
        user_id_role_id: {
          user_id: user.id,
          role_id: role.id
        }
      },
      update: {},
      create: {
        id: uuid(),
        user_id: user.id,
        role_id: role.id,
        updated_at: new Date()
      }
    });
  }

  console.log('✅ Assigned roles to users');

  // 1.5 Assign permissions to roles
  console.log('🛡️ Assigning permissions to roles...');

  const allPermissions = await prisma.permissions.findMany();
  
  // Admin gets ALL permissions
  for (const perm of allPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id_scope: {
          role_id: adminRole.id,
          permission_id: perm.id,
          scope: 'GLOBAL'
        }
      },
      update: {},
      create: {
        id: uuid(),
        role_id: adminRole.id,
        permission_id: perm.id,
        scope: 'GLOBAL'
      }
    });
  }

  // Define specific permissions for each role
  const rolePermissionMap = {
    config_manager: ['PM-110', 'PM-111', 'PM-112', 'PM-113', 'PM-114', 'PM-115', 'PM-116', 'PM-117', 'PM-118', 'PM-119', 'PM-120', 'PM-121', 'PM-122', 'PM-123', 'PM-124', 'PM-125'],
    finance: ['PM-090', 'PM-091', 'PM-001', 'PM-002', 'PM-040', 'PM-043'],
    price_manager: ['PM-073', 'PM-074', 'PM-001', 'PM-002'],
    customer_support: ['PM-100', 'PM-060', 'PM-061', 'PM-001', 'PM-002'],
    depot_manager: ['PM-080', 'PM-081', 'PM-082', 'PM-083', 'PM-084', 'PM-085', 'PM-086', 'PM-001', 'PM-002'],
    inspector: ['PM-030', 'PM-031', 'PM-001', 'PM-002'],
    depot_staff: ['PM-083', 'PM-084', 'PM-001', 'PM-002'],
    seller: ['PM-001', 'PM-002', 'PM-003', 'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014', 'PM-020', 'PM-021', 'PM-022', 'PM-040', 'PM-042B', 'PM-050', 'PM-091B'],
    buyer: ['PM-001', 'PM-002', 'PM-003', 'PM-020', 'PM-022', 'PM-030', 'PM-040', 'PM-041', 'PM-042', 'PM-043', 'PM-050', 'PM-060']
  };

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
    const role = await prisma.roles.findUnique({ where: { code: roleCode } });
    if (role) {
      for (const permCode of permissionCodes) {
        const permission = await prisma.permissions.findUnique({ where: { code: permCode } });
        if (permission) {
          await prisma.role_permissions.upsert({
            where: {
              role_id_permission_id_scope: {
                role_id: role.id,
                permission_id: permission.id,
                scope: 'GLOBAL'
              }
            },
            update: {},
            create: {
              id: uuid(),
              role_id: role.id,
              permission_id: permission.id,
              scope: 'GLOBAL'
            }
          });
        }
      }
    }
  }

  console.log('✅ Assigned permissions to roles');
  console.log('✅ RBAC System seeding completed!\n');
}

// ============================================================================
// SECTION 2: MASTER DATA (54 tables)
// ============================================================================

async function seedMasterData() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║         SECTION 2: MASTER DATA SEEDING                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // List of master data tables and their seed data (ALL 48 TABLES)
  const masterDataTables = {
    // 1. md_unlocodes - UN Location Codes
    md_unlocodes: [
      { code: 'VNSGN', name: 'Ho Chi Minh City', country_code: 'VN' },
      { code: 'VNHAN', name: 'Hanoi', country_code: 'VN' },
      { code: 'VNHPH', name: 'Hai Phong', country_code: 'VN' },
      { code: 'VNDAD', name: 'Da Nang', country_code: 'VN' },
      { code: 'VNQNH', name: 'Quy Nhon', country_code: 'VN' },
      { code: 'VNVUT', name: 'Vung Tau', country_code: 'VN' },
      { code: 'VNCAN', name: 'Can Tho', country_code: 'VN' },
      { code: 'VNPHU', name: 'Phu My', country_code: 'VN' },
      { code: 'SGSIN', name: 'Singapore', country_code: 'SG' },
      { code: 'HKHKG', name: 'Hong Kong', country_code: 'HK' }
    ],

    // 2. md_adjust_reasons - Stock Adjustment Reasons
    md_adjust_reasons: [
      { code: 'STOCK_COUNT', name: 'Kiểm kê tồn kho', description: 'Điều chỉnh sau kiểm kê' },
      { code: 'DAMAGE', name: 'Hư hỏng', description: 'Container bị hư hỏng' },
      { code: 'LOST', name: 'Thất lạc', description: 'Container bị thất lạc' },
      { code: 'FOUND', name: 'Tìm thấy', description: 'Tìm thấy container thất lạc' },
      { code: 'REPAIR_COMPLETE', name: 'Hoàn thành sửa chữa', description: 'Container sửa chữa xong' },
      { code: 'SYSTEM_ERROR', name: 'Lỗi hệ thống', description: 'Điều chỉnh do lỗi hệ thống' }
    ],

    // 3. md_business_hours_policies
    md_business_hours_policies: [
      { code: 'STANDARD', name: 'Giờ hành chính', description: '8:00-17:00, Thứ 2-6' },
      { code: 'EXTENDED', name: 'Giờ mở rộng', description: '6:00-22:00, Thứ 2-7' },
      { code: 'FULL_TIME', name: '24/7', description: 'Hoạt động 24/7' },
      { code: 'HALF_DAY_SAT', name: 'Nửa ngày thứ 7', description: '8:00-12:00 thứ 7' },
      { code: 'NIGHT_SHIFT', name: 'Ca đêm', description: '18:00-6:00' }
    ],

    // 4. md_cancel_reasons
    md_cancel_reasons: [
      { code: 'CUSTOMER_REQUEST', name: 'Yêu cầu khách hàng', description: 'Khách hàng yêu cầu hủy' },
      { code: 'PAYMENT_FAILED', name: 'Thanh toán thất bại', description: 'Không thể thanh toán' },
      { code: 'OUT_OF_STOCK', name: 'Hết hàng', description: 'Container không còn' },
      { code: 'QUALITY_ISSUE', name: 'Vấn đề chất lượng', description: 'Container không đạt yêu cầu' },
      { code: 'FORCE_MAJEURE', name: 'Bất khả kháng', description: 'Thiên tai, dịch bệnh' },
      { code: 'SYSTEM_ERROR', name: 'Lỗi hệ thống', description: 'Lỗi kỹ thuật hệ thống' }
    ],

    // 5. md_cities
    md_cities: [
      { code: 'HCM', name: 'TP. Hồ Chí Minh', country_code: 'VN', province_code: 'HCM' },
      { code: 'HN', name: 'Hà Nội', country_code: 'VN', province_code: 'HN' },
      { code: 'DN', name: 'Đà Nẵng', country_code: 'VN', province_code: 'DN' },
      { code: 'HP', name: 'Hải Phòng', country_code: 'VN', province_code: 'HP' },
      { code: 'CT', name: 'Cần Thơ', country_code: 'VN', province_code: 'CT' },
      { code: 'BD', name: 'Bình Dương', country_code: 'VN', province_code: 'BD' },
      { code: 'DN2', name: 'Đồng Nai', country_code: 'VN', province_code: 'DN2' },
      { code: 'BRVT', name: 'Bà Rịa - Vũng Tàu', country_code: 'VN', province_code: 'BRVT' }
    ],

    // 6. md_commission_codes
    md_commission_codes: [
      { code: 'TRANSACTION', name: 'Hoa hồng giao dịch', description: 'Hoa hồng trên mỗi giao dịch' },
      { code: 'LISTING', name: 'Phí đăng tin', description: 'Phí cho việc đăng tin' },
      { code: 'MEMBERSHIP', name: 'Phí thành viên', description: 'Phí thành viên hàng tháng' },
      { code: 'PREMIUM', name: 'Phí premium', description: 'Phí dịch vụ cao cấp' },
      { code: 'INSPECTION', name: 'Phí giám định', description: 'Phí dịch vụ giám định' },
      { code: 'DELIVERY', name: 'Phí vận chuyển', description: 'Phí dịch vụ vận chuyển' }
    ],

    // 7. md_container_sizes
    md_container_sizes: [
      { size_ft: 20, name: '20 feet', description: '20-foot standard container' },
      { size_ft: 40, name: '40 feet', description: '40-foot standard container' },
      { size_ft: 45, name: '45 feet', description: '45-foot standard container' }
    ],

    // 8. md_container_types
    md_container_types: [
      { code: 'DRY', name: 'Dry Container', description: 'Standard dry cargo container' },
      { code: 'HC', name: 'High Cube', description: 'High cube container' },
      { code: 'RF', name: 'Reefer', description: 'Refrigerated container' },
      { code: 'OT', name: 'Open Top', description: 'Open top container' },
      { code: 'TANK', name: 'Tank', description: 'Tank container' },
      { code: 'FLAT', name: 'Flat Rack', description: 'Flat rack container' }
    ],

    // 9. md_countries
    md_countries: [
      { code: 'VN', name: 'Vietnam', name_en: 'Vietnam' },
      { code: 'US', name: 'United States', name_en: 'United States' },
      { code: 'CN', name: 'China', name_en: 'China' },
      { code: 'JP', name: 'Japan', name_en: 'Japan' },
      { code: 'KR', name: 'South Korea', name_en: 'South Korea' },
      { code: 'SG', name: 'Singapore', name_en: 'Singapore' },
      { code: 'TH', name: 'Thailand', name_en: 'Thailand' },
      { code: 'MY', name: 'Malaysia', name_en: 'Malaysia' },
      { code: 'ID', name: 'Indonesia', name_en: 'Indonesia' },
      { code: 'PH', name: 'Philippines', name_en: 'Philippines' }
    ],

    // 10. md_currencies
    md_currencies: [
      { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimal_places: 0 },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal_places: 0 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimal_places: 2 },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimal_places: 2 }
    ],

    // 11. md_deal_types
    md_deal_types: [
      { code: 'SALE', name: 'Sale', description: 'Container for sale' },
      { code: 'RENTAL', name: 'Rental', description: 'Container for rent' }
    ],

    // 12. md_delivery_event_types
    md_delivery_event_types: [
      { code: 'CREATED', name: 'Tạo đơn giao hàng', description: 'Đơn giao hàng được tạo' },
      { code: 'SCHEDULED', name: 'Lên lịch giao hàng', description: 'Đã lên lịch giao hàng' },
      { code: 'PICKED_UP', name: 'Nhận hàng', description: 'Đã nhận hàng từ kho' },
      { code: 'IN_TRANSIT', name: 'Đang vận chuyển', description: 'Đang trên đường giao' },
      { code: 'DELIVERED', name: 'Đã giao', description: 'Đã giao hàng thành công' },
      { code: 'FAILED', name: 'Giao thất bại', description: 'Giao hàng thất bại' },
      { code: 'RETURNED', name: 'Hoàn trả', description: 'Hàng được hoàn trả' },
      { code: 'CANCELLED', name: 'Hủy giao hàng', description: 'Đơn giao hàng bị hủy' }
    ],

    // 13. md_delivery_statuses
    md_delivery_statuses: [
      { code: 'PENDING', name: 'Pending', description: 'Delivery pending' },
      { code: 'SCHEDULED', name: 'Scheduled', description: 'Delivery scheduled' },
      { code: 'IN_TRANSIT', name: 'In Transit', description: 'In transit' },
      { code: 'DELIVERED', name: 'Delivered', description: 'Delivered' },
      { code: 'FAILED', name: 'Failed', description: 'Delivery failed' }
    ],

    // 14. md_dispute_reasons
    md_dispute_reasons: [
      { code: 'QUALITY_ISSUE', name: 'Vấn đề chất lượng', description: 'Container không đúng chất lượng mô tả' },
      { code: 'DELIVERY_DELAY', name: 'Giao hàng trễ', description: 'Giao hàng không đúng thời gian' },
      { code: 'DAMAGE_IN_TRANSIT', name: 'Hư hỏng khi vận chuyển', description: 'Container bị hư hỏng trong quá trình vận chuyển' },
      { code: 'WRONG_ITEM', name: 'Sai hàng hóa', description: 'Nhận sai container so với đơn hàng' },
      { code: 'PAYMENT_ISSUE', name: 'Vấn đề thanh toán', description: 'Tranh chấp về thanh toán' },
      { code: 'CONTRACT_BREACH', name: 'Vi phạm hợp đồng', description: 'Một bên vi phạm điều khoản hợp đồng' },
      { code: 'DOCUMENTATION', name: 'Vấn đề giấy tờ', description: 'Thiếu hoặc sai giấy tờ' },
      { code: 'COMMUNICATION', name: 'Vấn đề giao tiếp', description: 'Hiểu lầm trong giao tiếp' }
    ],

    // 15. md_dispute_statuses
    md_dispute_statuses: [
      { code: 'OPEN', name: 'Open', description: 'Dispute opened' },
      { code: 'INVESTIGATING', name: 'Investigating', description: 'Under investigation' },
      { code: 'RESOLVED', name: 'Resolved', description: 'Dispute resolved' },
      { code: 'CLOSED', name: 'Closed', description: 'Dispute closed' }
    ],

    // 16. md_document_types
    md_document_types: [
      { code: 'EDO', name: 'Equipment Delivery Order', description: 'Container delivery order' },
      { code: 'EIR', name: 'Equipment Interchange Receipt', description: 'Container interchange receipt' },
      { code: 'INVOICE', name: 'Invoice', description: 'Commercial invoice' },
      { code: 'RECEIPT', name: 'Receipt', description: 'Payment receipt' },
      { code: 'CONTRACT', name: 'Contract', description: 'Business contract' },
      { code: 'CERTIFICATE', name: 'Certificate', description: 'Inspection certificate' }
    ],

    // 17. md_feature_flag_codes
    md_feature_flag_codes: [
      { code: 'ADVANCED_SEARCH', name: 'Tìm kiếm nâng cao', description: 'Tính năng tìm kiếm nâng cao' },
      { code: 'REAL_TIME_CHAT', name: 'Chat thời gian thực', description: 'Tính năng chat trực tiếp' },
      { code: 'MOBILE_APP', name: 'Ứng dụng di động', description: 'Hỗ trợ ứng dụng mobile' },
      { code: 'API_ACCESS', name: 'Truy cập API', description: 'Cho phép truy cập API' },
      { code: 'BULK_UPLOAD', name: 'Tải lên hàng loạt', description: 'Tải lên nhiều container cùng lúc' },
      { code: 'AUTO_MATCHING', name: 'Tự động ghép đôi', description: 'Tự động ghép buyer-seller' }
    ],

    // 18. md_fee_codes
    md_fee_codes: [
      { code: 'TRANSACTION_FEE', name: 'Phí giao dịch', description: 'Phí cho mỗi giao dịch thành công' },
      { code: 'LISTING_FEE', name: 'Phí đăng tin', description: 'Phí đăng tin premium' },
      { code: 'INSPECTION_FEE', name: 'Phí giám định', description: 'Phí dịch vụ giám định container' },
      { code: 'DELIVERY_FEE', name: 'Phí giao hàng', description: 'Phí vận chuyển container' },
      { code: 'ESCROW_FEE', name: 'Phí ký quỹ', description: 'Phí dịch vụ ký quỹ' },
      { code: 'PAYMENT_PROCESSING', name: 'Phí xử lý thanh toán', description: 'Phí xử lý thanh toán online' }
    ],

    // 19. md_form_schema_codes
    md_form_schema_codes: [
      { code: 'LISTING_FORM', name: 'Form đăng tin', description: 'Schema cho form đăng tin container' },
      { code: 'RFQ_FORM', name: 'Form RFQ', description: 'Schema cho form yêu cầu báo giá' },
      { code: 'INSPECTION_FORM', name: 'Form giám định', description: 'Schema cho form yêu cầu giám định' },
      { code: 'USER_PROFILE_FORM', name: 'Form hồ sơ người dùng', description: 'Schema cho form cập nhật hồ sơ' },
      { code: 'COMPANY_REGISTRATION', name: 'Form đăng ký doanh nghiệp', description: 'Schema cho form đăng ký công ty' },
      { code: 'DISPUTE_FORM', name: 'Form khiếu nại', description: 'Schema cho form khiếu nại tranh chấp' }
    ],

    // 20. md_i18n_namespaces
    md_i18n_namespaces: [
      { code: 'COMMON', name: 'Chung', description: 'Từ khóa chung dùng toàn hệ thống' },
      { code: 'AUTH', name: 'Xác thực', description: 'Từ khóa liên quan đến đăng nhập, đăng ký' },
      { code: 'LISTINGS', name: 'Tin đăng', description: 'Từ khóa liên quan đến tin đăng container' },
      { code: 'RFQ', name: 'Yêu cầu báo giá', description: 'Từ khóa liên quan đến RFQ' },
      { code: 'ORDERS', name: 'Đơn hàng', description: 'Từ khóa liên quan đến đơn hàng' },
      { code: 'ADMIN', name: 'Quản trị', description: 'Từ khóa dành cho admin panel' },
      { code: 'ERRORS', name: 'Lỗi', description: 'Thông báo lỗi hệ thống' },
      { code: 'SUCCESS', name: 'Thành công', description: 'Thông báo thành công' }
    ],

    // 21. md_inspection_item_codes
    md_inspection_item_codes: [
      { code: 'EXTERIOR_WALLS', name: 'Tường ngoài', description: 'Kiểm tra tường bên ngoài container' },
      { code: 'INTERIOR_WALLS', name: 'Tường trong', description: 'Kiểm tra tường bên trong container' },
      { code: 'FLOOR', name: 'Sàn container', description: 'Kiểm tra sàn container' },
      { code: 'ROOF', name: 'Mái container', description: 'Kiểm tra mái container' },
      { code: 'DOORS', name: 'Cửa container', description: 'Kiểm tra cửa và khóa container' },
      { code: 'CORNERS', name: 'Góc container', description: 'Kiểm tra 4 góc container' },
      { code: 'SEALS', name: 'Gioăng cửa', description: 'Kiểm tra gioăng chống thấm' },
      { code: 'MARKINGS', name: 'Ký hiệu', description: 'Kiểm tra ký hiệu và số container' },
      { code: 'VENTILATION', name: 'Thông gió', description: 'Kiểm tra hệ thống thông gió' },
      { code: 'ELECTRICAL', name: 'Điện', description: 'Kiểm tra hệ thống điện (với reefer)' }
    ],

    // 22. md_insurance_coverages
    md_insurance_coverages: [
      { code: 'BASIC', name: 'Bảo hiểm cơ bản', description: 'Bảo hiểm thiệt hại cơ bản' },
      { code: 'COMPREHENSIVE', name: 'Bảo hiểm toàn diện', description: 'Bảo hiểm toàn diện mọi rủi ro' },
      { code: 'THEFT_ONLY', name: 'Chỉ bảo hiểm trộm cắp', description: 'Chỉ bảo hiểm mất trộm' },
      { code: 'FIRE_FLOOD', name: 'Hỏa hoạn và lũ lụt', description: 'Bảo hiểm hỏa hoạn và thiên tai' },
      { code: 'TRANSIT', name: 'Bảo hiểm vận chuyển', description: 'Bảo hiểm trong quá trình vận chuyển' }
    ],

    // 23. md_integration_vendor_codes
    md_integration_vendor_codes: [
      { code: 'VNPAY', name: 'VNPay', description: 'Cổng thanh toán VNPay' },
      { code: 'MOMO', name: 'MoMo', description: 'Ví điện tử MoMo' },
      { code: 'ZALOPAY', name: 'ZaloPay', description: 'Ví điện tử ZaloPay' },
      { code: 'VIETTEL_POST', name: 'Viettel Post', description: 'Dịch vụ chuyển phát Viettel' },
      { code: 'VIETNAM_POST', name: 'Vietnam Post', description: 'Bưu điện Việt Nam' },
      { code: 'GHN', name: 'Giao Hàng Nhanh', description: 'Dịch vụ giao hàng nhanh' }
    ],

    // 24. md_listing_statuses
    md_listing_statuses: [
      { code: 'DRAFT', name: 'Draft', description: 'Draft listing' },
      { code: 'PENDING_REVIEW', name: 'Pending Review', description: 'Awaiting admin review' },
      { code: 'ACTIVE', name: 'Active', description: 'Active listing' },
      { code: 'PAUSED', name: 'Paused', description: 'Temporarily paused' },
      { code: 'SOLD', name: 'Sold', description: 'Container sold' },
      { code: 'RENTED', name: 'Rented', description: 'Container rented' },
      { code: 'ARCHIVED', name: 'Archived', description: 'Archived listing' },
      { code: 'REJECTED', name: 'Rejected', description: 'Rejected by admin' }
    ],

    // 25. md_movement_types
    md_movement_types: [
      { code: 'IN', name: 'Inbound', description: 'Container moving in' },
      { code: 'OUT', name: 'Outbound', description: 'Container moving out' },
      { code: 'TRANSFER', name: 'Transfer', description: 'Transfer between depots' },
      { code: 'ADJUSTMENT', name: 'Adjustment', description: 'Stock adjustment' }
    ],

    // 26. md_notification_channels
    md_notification_channels: [
      { code: 'EMAIL', name: 'Email', description: 'Thông báo qua email' },
      { code: 'SMS', name: 'SMS', description: 'Thông báo qua tin nhắn' },
      { code: 'IN_APP', name: 'Trong ứng dụng', description: 'Thông báo trong ứng dụng' },
      { code: 'PUSH', name: 'Push notification', description: 'Thông báo đẩy trên mobile' },
      { code: 'WEBHOOK', name: 'Webhook', description: 'Thông báo qua webhook API' }
    ],

    // 27. md_notification_event_types
    md_notification_event_types: [
      { code: 'NEW_MESSAGE', name: 'Tin nhắn mới', description: 'Có tin nhắn mới' },
      { code: 'NEW_RFQ', name: 'RFQ mới', description: 'Có yêu cầu báo giá mới' },
      { code: 'NEW_QUOTE', name: 'Báo giá mới', description: 'Có báo giá mới' },
      { code: 'ORDER_STATUS_CHANGE', name: 'Thay đổi trạng thái đơn hàng', description: 'Đơn hàng thay đổi trạng thái' },
      { code: 'PAYMENT_RECEIVED', name: 'Nhận thanh toán', description: 'Đã nhận được thanh toán' },
      { code: 'LISTING_APPROVED', name: 'Tin đăng được duyệt', description: 'Tin đăng đã được phê duyệt' },
      { code: 'LISTING_REJECTED', name: 'Tin đăng bị từ chối', description: 'Tin đăng bị từ chối' },
      { code: 'INSPECTION_SCHEDULED', name: 'Lên lịch giám định', description: 'Đã lên lịch giám định container' }
    ],

    // 28. md_order_statuses
    md_order_statuses: [
      { code: 'CREATED', name: 'Created', description: 'Order created' },
      { code: 'PENDING_PAYMENT', name: 'Pending Payment', description: 'Awaiting payment' },
      { code: 'PAID', name: 'Paid', description: 'Payment received' },
      { code: 'PROCESSING', name: 'Processing', description: 'Order being processed' },
      { code: 'SHIPPED', name: 'Shipped', description: 'Order shipped' },
      { code: 'DELIVERED', name: 'Delivered', description: 'Order delivered' },
      { code: 'COMPLETED', name: 'Completed', description: 'Order completed' },
      { code: 'CANCELLED', name: 'Cancelled', description: 'Order cancelled' }
    ],

    // 29. md_payment_failure_reasons
    md_payment_failure_reasons: [
      { code: 'INSUFFICIENT_FUNDS', name: 'Không đủ tiền', description: 'Tài khoản không đủ số dư' },
      { code: 'CARD_EXPIRED', name: 'Thẻ hết hạn', description: 'Thẻ tín dụng đã hết hạn' },
      { code: 'CARD_DECLINED', name: 'Thẻ bị từ chối', description: 'Ngân hàng từ chối giao dịch' },
      { code: 'NETWORK_ERROR', name: 'Lỗi mạng', description: 'Lỗi kết nối mạng' },
      { code: 'INVALID_CARD', name: 'Thẻ không hợp lệ', description: 'Thông tin thẻ không đúng' },
      { code: 'FRAUD_DETECTED', name: 'Phát hiện gian lận', description: 'Hệ thống phát hiện giao dịch gian lận' }
    ],

    // 30. md_payment_statuses
    md_payment_statuses: [
      { code: 'PENDING', name: 'Pending', description: 'Payment pending' },
      { code: 'COMPLETED', name: 'Completed', description: 'Payment completed' },
      { code: 'FAILED', name: 'Failed', description: 'Payment failed' },
      { code: 'REFUNDED', name: 'Refunded', description: 'Payment refunded' }
    ],

    // 31. md_pricing_regions
    md_pricing_regions: [
      { code: 'NORTH', name: 'Miền Bắc', description: 'Khu vực miền Bắc Việt Nam' },
      { code: 'CENTRAL', name: 'Miền Trung', description: 'Khu vực miền Trung Việt Nam' },
      { code: 'SOUTH', name: 'Miền Nam', description: 'Khu vực miền Nam Việt Nam' },
      { code: 'INTERNATIONAL', name: 'Quốc tế', description: 'Khu vực quốc tế' }
    ],

    // 32. md_quality_standards
    md_quality_standards: [
      { code: 'CW', name: 'Cargo Worthy', description: 'Suitable for cargo transport' },
      { code: 'WWT', name: 'Wind and Water Tight', description: 'Sealed against wind and water' },
      { code: 'IICL', name: 'IICL Standard', description: 'Meets IICL standards' }
    ],

    // 33. md_rating_scales
    md_rating_scales: [
      { code: 'FIVE_STAR', name: 'Thang điểm 5 sao', description: 'Đánh giá từ 1 đến 5 sao' },
      { code: 'TEN_POINT', name: 'Thang điểm 10', description: 'Đánh giá từ 1 đến 10 điểm' },
      { code: 'HUNDRED_POINT', name: 'Thang điểm 100', description: 'Đánh giá từ 0 đến 100 điểm' },
      { code: 'PASS_FAIL', name: 'Đạt/Không đạt', description: 'Chỉ có 2 mức đạt hoặc không đạt' }
    ],

    // 34. md_redaction_channels
    md_redaction_channels: [
      { code: 'CHAT', name: 'Tin nhắn chat', description: 'Che thông tin trong chat' },
      { code: 'LISTING', name: 'Tin đăng', description: 'Che thông tin trong tin đăng' },
      { code: 'REVIEW', name: 'Đánh giá', description: 'Che thông tin trong đánh giá' },
      { code: 'PROFILE', name: 'Hồ sơ', description: 'Che thông tin trong hồ sơ' },
      { code: 'COMMENT', name: 'Bình luận', description: 'Che thông tin trong bình luận' }
    ],

    // 35. md_ref_doc_types
    md_ref_doc_types: [
      { code: 'ORDER', name: 'Đơn hàng', description: 'Tài liệu tham chiếu đơn hàng' },
      { code: 'INSPECTION', name: 'Giám định', description: 'Tài liệu tham chiếu giám định' },
      { code: 'REPAIR', name: 'Sửa chữa', description: 'Tài liệu tham chiếu sửa chữa' },
      { code: 'TRANSFER', name: 'Chuyển kho', description: 'Tài liệu tham chiếu chuyển kho' },
      { code: 'ADJUSTMENT', name: 'Điều chỉnh', description: 'Tài liệu tham chiếu điều chỉnh tồn kho' },
      { code: 'INVOICE', name: 'Hóa đơn', description: 'Tài liệu tham chiếu hóa đơn' }
    ],

    // 36. md_rental_units
    md_rental_units: [
      { code: 'DAY', name: 'Ngày', description: 'Thuê theo ngày' },
      { code: 'WEEK', name: 'Tuần', description: 'Thuê theo tuần' },
      { code: 'MONTH', name: 'Tháng', description: 'Thuê theo tháng' },
      { code: 'QUARTER', name: 'Quý', description: 'Thuê theo quý' },
      { code: 'YEAR', name: 'Năm', description: 'Thuê theo năm' },
      { code: 'TRIP', name: 'Chuyến', description: 'Thuê theo chuyến đi' }
    ],

    // 37. md_repair_item_codes
    md_repair_item_codes: [
      { code: 'WELDING', name: 'Hàn', description: 'Hàn vá các vị trí hư hỏng' },
      { code: 'PAINTING', name: 'Sơn', description: 'Sơn lại container' },
      { code: 'DOOR_REPAIR', name: 'Sửa cửa', description: 'Sửa chữa cửa container' },
      { code: 'FLOOR_REPAIR', name: 'Sửa sàn', description: 'Sửa chữa sàn container' },
      { code: 'ROOF_REPAIR', name: 'Sửa mái', description: 'Sửa chữa mái container' },
      { code: 'SEAL_REPLACEMENT', name: 'Thay gioăng', description: 'Thay gioăng chống thấm' },
      { code: 'CLEANING', name: 'Vệ sinh', description: 'Vệ sinh container' },
      { code: 'FUMIGATION', name: 'Xông khói', description: 'Xông khói diệt khuẩn' }
    ],

    // 38. md_sla_codes
    md_sla_codes: [
      { code: 'RESPONSE_TIME', name: 'Thời gian phản hồi', description: 'SLA cho thời gian phản hồi' },
      { code: 'DELIVERY_TIME', name: 'Thời gian giao hàng', description: 'SLA cho thời gian giao hàng' },
      { code: 'INSPECTION_TIME', name: 'Thời gian giám định', description: 'SLA cho thời gian hoàn thành giám định' },
      { code: 'REPAIR_TIME', name: 'Thời gian sửa chữa', description: 'SLA cho thời gian hoàn thành sửa chữa' },
      { code: 'QUOTE_TIME', name: 'Thời gian báo giá', description: 'SLA cho thời gian gửi báo giá' },
      { code: 'PAYMENT_TIME', name: 'Thời gian thanh toán', description: 'SLA cho thời gian xử lý thanh toán' }
    ],

    // 39. md_tax_codes
    md_tax_codes: [
      { code: 'VAT_10', name: 'VAT 10%', description: 'Thuế giá trị gia tăng 10%' },
      { code: 'VAT_8', name: 'VAT 8%', description: 'Thuế giá trị gia tăng 8%' },
      { code: 'VAT_5', name: 'VAT 5%', description: 'Thuế giá trị gia tăng 5%' },
      { code: 'VAT_0', name: 'VAT 0%', description: 'Miễn thuế VAT' },
      { code: 'EXPORT_TAX', name: 'Thuế xuất khẩu', description: 'Thuế áp dụng cho xuất khẩu' },
      { code: 'IMPORT_TAX', name: 'Thuế nhập khẩu', description: 'Thuế áp dụng cho nhập khẩu' }
    ],

    // 40. md_template_codes
    md_template_codes: [
      { code: 'EMAIL_WELCOME', name: 'Email chào mừng', description: 'Template email chào mừng user mới' },
      { code: 'EMAIL_RESET_PASSWORD', name: 'Email reset mật khẩu', description: 'Template email reset mật khẩu' },
      { code: 'EMAIL_ORDER_CONFIRM', name: 'Email xác nhận đơn hàng', description: 'Template email xác nhận đơn hàng' },
      { code: 'SMS_OTP', name: 'SMS OTP', description: 'Template SMS gửi mã OTP' },
      { code: 'NOTIFICATION_NEW_MESSAGE', name: 'Thông báo tin nhắn mới', description: 'Template thông báo tin nhắn mới' },
      { code: 'NOTIFICATION_PAYMENT', name: 'Thông báo thanh toán', description: 'Template thông báo thanh toán thành công' }
    ],

    // 41. md_units
    md_units: [
      { code: 'TEU', name: 'Twenty-foot Equivalent Unit', description: 'Đơn vị container 20 feet' },
      { code: 'FEU', name: 'Forty-foot Equivalent Unit', description: 'Đơn vị container 40 feet' },
      { code: 'KG', name: 'Kilogram', description: 'Kilogram' },
      { code: 'TON', name: 'Tấn', description: 'Tấn (1000kg)' },
      { code: 'CBM', name: 'Cubic Meter', description: 'Mét khối' },
      { code: 'DAY', name: 'Ngày', description: 'Đơn vị thời gian - ngày' },
      { code: 'MONTH', name: 'Tháng', description: 'Đơn vị thời gian - tháng' },
      { code: 'YEAR', name: 'Năm', description: 'Đơn vị thời gian - năm' },
      { code: 'TRIP', name: 'Chuyến', description: 'Đơn vị chuyến đi' },
      { code: 'HOUR', name: 'Giờ', description: 'Đơn vị thời gian - giờ' }
    ],

    // 42. md_violation_codes
    md_violation_codes: [
      { code: 'SPAM', name: 'Spam', description: 'Đăng tin spam, lặp lại' },
      { code: 'FAKE_INFO', name: 'Thông tin giả', description: 'Cung cấp thông tin không chính xác' },
      { code: 'INAPPROPRIATE_CONTENT', name: 'Nội dung không phù hợp', description: 'Nội dung không phù hợp với chính sách' },
      { code: 'PRICE_MANIPULATION', name: 'Thao túng giá', description: 'Thao túng giá cả bất hợp lý' },
      { code: 'CONTACT_INFO_SHARING', name: 'Chia sẻ thông tin liên hệ', description: 'Chia sẻ thông tin liên hệ trái phép' },
      { code: 'HARASSMENT', name: 'Quấy rối', description: 'Quấy rối người dùng khác' },
      { code: 'COPYRIGHT', name: 'Vi phạm bản quyền', description: 'Sử dụng hình ảnh, nội dung không có bản quyền' }
    ],

    // Additional tables from md_* that have relationships

    // 43. md_provinces (Required for cities)
    md_provinces: [
      { code: 'HCM', name: 'TP. Hồ Chí Minh', country_code: 'VN' },
      { code: 'HN', name: 'Hà Nội', country_code: 'VN' },
      { code: 'DN', name: 'Đà Nẵng', country_code: 'VN' },
      { code: 'HP', name: 'Hải Phòng', country_code: 'VN' },
      { code: 'CT', name: 'Cần Thơ', country_code: 'VN' },
      { code: 'BD', name: 'Bình Dương', country_code: 'VN' },
      { code: 'DN2', name: 'Đồng Nai', country_code: 'VN' },
      { code: 'BRVT', name: 'Bà Rịa - Vũng Tàu', country_code: 'VN' }
    ],

    // 44. md_rfq_statuses
    md_rfq_statuses: [
      { code: 'DRAFT', name: 'Draft', description: 'RFQ draft' },
      { code: 'PUBLISHED', name: 'Published', description: 'RFQ published' },
      { code: 'QUOTED', name: 'Quoted', description: 'Received quotes' },
      { code: 'ACCEPTED', name: 'Accepted', description: 'Quote accepted' },
      { code: 'CANCELLED', name: 'Cancelled', description: 'RFQ cancelled' },
      { code: 'EXPIRED', name: 'Expired', description: 'RFQ expired' }
    ],

    // 45. md_quote_statuses
    md_quote_statuses: [
      { code: 'DRAFT', name: 'Draft', description: 'Quote draft' },
      { code: 'SUBMITTED', name: 'Submitted', description: 'Quote submitted' },
      { code: 'ACCEPTED', name: 'Accepted', description: 'Quote accepted' },
      { code: 'REJECTED', name: 'Rejected', description: 'Quote rejected' },
      { code: 'EXPIRED', name: 'Expired', description: 'Quote expired' }
    ],

    // 46. md_payment_methods
    md_payment_methods: [
      { code: 'CASH', name: 'Tiền mặt', description: 'Thanh toán bằng tiền mặt' },
      { code: 'BANK_TRANSFER', name: 'Chuyển khoản', description: 'Chuyển khoản ngân hàng' },
      { code: 'CREDIT_CARD', name: 'Thẻ tín dụng', description: 'Thanh toán thẻ tín dụng' },
      { code: 'E_WALLET', name: 'Ví điện tử', description: 'Ví điện tử (MoMo, ZaloPay, VNPay)' },
      { code: 'COD', name: 'COD', description: 'Thanh toán khi nhận hàng' }
    ],

    // 47. md_inspection_statuses
    md_inspection_statuses: [
      { code: 'SCHEDULED', name: 'Scheduled', description: 'Inspection scheduled' },
      { code: 'IN_PROGRESS', name: 'In Progress', description: 'Inspection in progress' },
      { code: 'COMPLETED', name: 'Completed', description: 'Inspection completed' },
      { code: 'CANCELLED', name: 'Cancelled', description: 'Inspection cancelled' }
    ],

    // 48. md_container_statuses
    md_container_statuses: [
      { code: 'AVAILABLE', name: 'Available', description: 'Container available for use' },
      { code: 'IN_USE', name: 'In Use', description: 'Container currently in use' },
      { code: 'UNDER_REPAIR', name: 'Under Repair', description: 'Container being repaired' },
      { code: 'RETIRED', name: 'Retired', description: 'Container retired from service' },
      { code: 'LOST', name: 'Lost', description: 'Container lost or missing' }
    ]
  };

  let totalSeeded = 0;
  
  for (const [tableName, records] of Object.entries(masterDataTables)) {
    try {
      console.log(`📋 Seeding ${tableName}...`);
      const count = await prisma[tableName].count();
      
      if (count === 0) {
        const dataWithIds = records.map(record => ({
          id: uuid(),
          ...record,
          updated_at: new Date()
        }));
        
        await prisma[tableName].createMany({
          data: dataWithIds,
          skipDuplicates: true
        });
        
        console.log(`✅ ${tableName}: seeded ${records.length} records`);
        totalSeeded += records.length;
      } else {
        console.log(`✅ ${tableName}: already has ${count} records - skipping`);
      }
    } catch (error) {
      console.log(`❌ ${tableName}: failed - ${error.message}`);
    }
  }

  console.log(`\n✅ Master Data seeding completed! (${totalSeeded} records)\n`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║    🌱 i-ContExchange Complete Database Seeding 🌱     ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const startTime = Date.now();

  try {
    await seedRBAC();
    await seedMasterData();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║               🎉 SEEDING COMPLETED! 🎉                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`⏱️  Total time: ${duration}s\n`);
    
    console.log('📊 Summary:');
    console.log('  ✓ Roles: 10');
    console.log('  ✓ Permissions: 53');
    console.log('  ✓ Demo Users: 10');
    console.log('  ✓ Master Data Tables: 48 (ALL md_* tables)');
    console.log('');
    console.log('🔑 Demo Login Credentials:');
    console.log('  👑 Admin:       admin@i-contexchange.vn / admin123');
    console.log('  💼 Seller:      seller@example.com / seller123');
    console.log('  🛒 Buyer:       buyer@example.com / buyer123');
    console.log('  🏭 Depot Mgr:   manager@example.com / manager123');
    console.log('  🔍 Inspector:   inspector@example.com / inspector123');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
