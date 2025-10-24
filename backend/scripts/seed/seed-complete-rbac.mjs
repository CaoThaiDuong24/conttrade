import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding i-ContExchange database with complete RBAC system...');

  // 1. Create all 10 Roles (11 including Guest)
  console.log('🎭 Creating 10 roles...');
  
  const adminRole = await prisma.roles.upsert({
    where: { code: 'admin' },
    update: {},
    create: { id: 'admin-role-id', code: 'admin', name: 'Quản trị viên', level: 100 }
  });

  const configManagerRole = await prisma.roles.upsert({
    where: { code: 'config_manager' },
    update: {},
    create: { id: 'config-role-id', code: 'config_manager', name: 'Quản lý cấu hình', level: 80 }
  });

  const financeRole = await prisma.roles.upsert({
    where: { code: 'finance' },
    update: {},
    create: { id: 'finance-role-id', code: 'finance', name: 'Kế toán', level: 70 }
  });

  const priceManagerRole = await prisma.roles.upsert({
    where: { code: 'price_manager' },
    update: {},
    create: { id: 'price-role-id', code: 'price_manager', name: 'Quản lý giá', level: 60 }
  });

  const customerSupportRole = await prisma.roles.upsert({
    where: { code: 'customer_support' },
    update: {},
    create: { id: 'support-role-id', code: 'customer_support', name: 'Hỗ trợ khách hàng', level: 50 }
  });

  const depotManagerRole = await prisma.roles.upsert({
    where: { code: 'depot_manager' },
    update: {},
    create: { id: 'depot-manager-role-id', code: 'depot_manager', name: 'Quản lý kho bãi', level: 30 }
  });

  const inspectorRole = await prisma.roles.upsert({
    where: { code: 'inspector' },
    update: {},
    create: { id: 'inspector-role-id', code: 'inspector', name: 'Giám định viên', level: 25 }
  });

  const depotStaffRole = await prisma.roles.upsert({
    where: { code: 'depot_staff' },
    update: {},
    create: { id: 'depot-staff-role-id', code: 'depot_staff', name: 'Nhân viên kho', level: 20 }
  });

  const sellerRole = await prisma.roles.upsert({
    where: { code: 'seller' },
    update: {},
    create: { id: 'seller-role-id', code: 'seller', name: 'Người bán', level: 10 }
  });

  const buyerRole = await prisma.roles.upsert({
    where: { code: 'buyer' },
    update: {},
    create: { id: 'buyer-role-id', code: 'buyer', name: 'Người mua', level: 10 }
  });

  console.log('✅ Created 10 roles');

  // 2. Create all 53 Permissions
  console.log('🔐 Creating 53 permissions...');
  
  const permissions = [
    // Public & Viewing Permissions (PM-001 to PM-003)
    { code: 'PM-001', name: 'VIEW_PUBLIC_LISTINGS', description: 'Xem tin công khai', module: 'listings', action: 'view' },
    { code: 'PM-002', name: 'SEARCH_LISTINGS', description: 'Tìm kiếm, lọc tin', module: 'listings', action: 'search' },
    { code: 'PM-003', name: 'VIEW_SELLER_PROFILE', description: 'Xem hồ sơ người bán', module: 'users', action: 'view' },
    
    // Listing Management Permissions (PM-010 to PM-014)
    { code: 'PM-010', name: 'CREATE_LISTING', description: 'Tạo tin đăng', module: 'listings', action: 'create' },
    { code: 'PM-011', name: 'EDIT_LISTING', description: 'Sửa tin đăng', module: 'listings', action: 'edit' },
    { code: 'PM-012', name: 'PUBLISH_LISTING', description: 'Gửi duyệt/Xuất bản tin', module: 'listings', action: 'publish' },
    { code: 'PM-013', name: 'ARCHIVE_LISTING', description: 'Ẩn/Lưu trữ tin', module: 'listings', action: 'archive' },
    { code: 'PM-014', name: 'DELETE_LISTING', description: 'Xóa tin đăng', module: 'listings', action: 'delete' },
    
    // RFQ & Quote Permissions (PM-020 to PM-024)
    { code: 'PM-020', name: 'CREATE_RFQ', description: 'Tạo RFQ (yêu cầu báo giá)', module: 'rfq', action: 'create' },
    { code: 'PM-021', name: 'ISSUE_QUOTE', description: 'Phát hành báo giá', module: 'quotes', action: 'issue' },
    { code: 'PM-022', name: 'VIEW_QUOTES', description: 'Xem/so sánh báo giá', module: 'quotes', action: 'view' },
    { code: 'PM-023', name: 'MANAGE_QA', description: 'Quản lý Q&A có kiểm duyệt', module: 'qa', action: 'manage' },
    { code: 'PM-024', name: 'REDACTION_ENFORCE', description: 'Thực thi che thông tin liên hệ', module: 'moderation', action: 'redact' },
    
    // Inspection Permissions (PM-030 to PM-031)
    { code: 'PM-030', name: 'REQUEST_INSPECTION', description: 'Yêu cầu giám định', module: 'inspection', action: 'request' },
    { code: 'PM-031', name: 'VIEW_INSPECTION_REPORT', description: 'Xem báo cáo giám định', module: 'inspection', action: 'view' },
    
    // Order Permissions (PM-040 to PM-043)
    { code: 'PM-040', name: 'CREATE_ORDER', description: 'Tạo đơn hàng', module: 'orders', action: 'create' },
    { code: 'PM-041', name: 'PAY_ESCROW', description: 'Thanh toán ký quỹ', module: 'payments', action: 'escrow' },
    { code: 'PM-042', name: 'REQUEST_DELIVERY', description: 'Yêu cầu vận chuyển', module: 'delivery', action: 'request' },
    { code: 'PM-043', name: 'CONFIRM_RECEIPT', description: 'Xác nhận nhận hàng', module: 'orders', action: 'confirm' },
    
    // Review & Dispute Permissions (PM-050, PM-060, PM-061)
    { code: 'PM-050', name: 'RATE_AND_REVIEW', description: 'Đánh giá sau giao dịch', module: 'reviews', action: 'write' },
    { code: 'PM-060', name: 'FILE_DISPUTE', description: 'Khiếu nại', module: 'disputes', action: 'file' },
    { code: 'PM-061', name: 'RESOLVE_DISPUTE', description: 'Xử lý tranh chấp', module: 'disputes', action: 'resolve' },
    
    // Admin Permissions (PM-070 to PM-074)
    { code: 'PM-070', name: 'ADMIN_REVIEW_LISTING', description: 'Duyệt tin đăng', module: 'admin', action: 'review' },
    { code: 'PM-071', name: 'ADMIN_MANAGE_USERS', description: 'Quản lý người dùng/vai trò', module: 'admin', action: 'users' },
    { code: 'PM-072', name: 'ADMIN_VIEW_DASHBOARD', description: 'Xem KPI dashboard', module: 'admin', action: 'dashboard' },
    { code: 'PM-073', name: 'ADMIN_CONFIG_PRICING', description: 'Cấu hình phí, gói', module: 'admin', action: 'pricing' },
    { code: 'PM-074', name: 'MANAGE_PRICE_RULES', description: 'Quản lý Pricing Rules/price band', module: 'pricing', action: 'manage' },
    
    // Depot Inventory Permissions (PM-080 to PM-086)
    { code: 'PM-080', name: 'DEPOT_CREATE_JOB', description: 'Tạo lệnh việc depot', module: 'depot', action: 'create_job' },
    { code: 'PM-081', name: 'DEPOT_UPDATE_JOB', description: 'Cập nhật công việc depot', module: 'depot', action: 'update_job' },
    { code: 'PM-082', name: 'DEPOT_ISSUE_EIR', description: 'Lập EIR', module: 'depot', action: 'issue_eir' },
    { code: 'PM-083', name: 'DEPOT_VIEW_STOCK', description: 'Xem tồn kho depot', module: 'depot', action: 'view_stock' },
    { code: 'PM-084', name: 'DEPOT_VIEW_MOVEMENTS', description: 'Xem nhật ký nhập-xuất-chuyển', module: 'depot', action: 'view_movements' },
    { code: 'PM-085', name: 'DEPOT_ADJUST_STOCK', description: 'Điều chỉnh tồn (manual IN/OUT)', module: 'depot', action: 'adjust_stock' },
    { code: 'PM-086', name: 'DEPOT_TRANSFER_STOCK', description: 'Chuyển giữa các Depot', module: 'depot', action: 'transfer_stock' },
    
    // Finance Permissions (PM-090 to PM-091)
    { code: 'PM-090', name: 'FINANCE_RECONCILE', description: 'Đối soát/giải ngân', module: 'finance', action: 'reconcile' },
    { code: 'PM-091', name: 'FINANCE_INVOICE', description: 'Xuất hóa đơn', module: 'finance', action: 'invoice' },
    
    // Customer Support Permission (PM-100)
    { code: 'PM-100', name: 'CS_MANAGE_TICKETS', description: 'Xử lý yêu cầu hỗ trợ', module: 'support', action: 'manage' },
    
    // Configuration Management Permissions (PM-110 to PM-125)
    { code: 'PM-110', name: 'CONFIG_NAMESPACE_RW', description: 'Tạo/sửa namespace cấu hình', module: 'config', action: 'namespace' },
    { code: 'PM-111', name: 'CONFIG_ENTRY_RW', description: 'Tạo/sửa entry cấu hình', module: 'config', action: 'entry' },
    { code: 'PM-112', name: 'CONFIG_PUBLISH', description: 'Phát hành cấu hình, rollback phiên bản', module: 'config', action: 'publish' },
    { code: 'PM-113', name: 'FEATURE_FLAG_RW', description: 'Quản lý feature flags/rollout', module: 'config', action: 'feature_flag' },
    { code: 'PM-114', name: 'TAX_RATE_RW', description: 'Quản lý thuế', module: 'config', action: 'tax' },
    { code: 'PM-115', name: 'FEE_SCHEDULE_RW', description: 'Quản lý biểu phí', module: 'config', action: 'fee' },
    { code: 'PM-116', name: 'COMMISSION_RULE_RW', description: 'Quản lý hoa hồng', module: 'config', action: 'commission' },
    { code: 'PM-117', name: 'TEMPLATE_RW', description: 'Quản lý template thông báo', module: 'config', action: 'template' },
    { code: 'PM-118', name: 'I18N_RW', description: 'Quản lý từ điển i18n', module: 'config', action: 'i18n' },
    { code: 'PM-119', name: 'FORM_SCHEMA_RW', description: 'Quản lý biểu mẫu (JSON Schema)', module: 'config', action: 'form_schema' },
    { code: 'PM-120', name: 'SLA_RW', description: 'Quản lý SLA', module: 'config', action: 'sla' },
    { code: 'PM-121', name: 'BUSINESS_HOURS_RW', description: 'Quản lý lịch làm việc', module: 'config', action: 'business_hours' },
    { code: 'PM-122', name: 'DEPOT_CALENDAR_RW', description: 'Quản lý lịch đóng Depot', module: 'config', action: 'depot_calendar' },
    { code: 'PM-123', name: 'INTEGRATION_CONFIG_RW', description: 'Quản lý cấu hình tích hợp (vendor)', module: 'config', action: 'integration' },
    { code: 'PM-124', name: 'PAYMENT_METHOD_RW', description: 'Quản lý phương thức thanh toán', module: 'config', action: 'payment_method' },
    { code: 'PM-125', name: 'PARTNER_RW', description: 'Quản lý đối tác (carrier/insurer/PSP/DMS)', module: 'config', action: 'partner' },
  ];

  for (const perm of permissions) {
    await prisma.permissions.upsert({
      where: { code: perm.code },
      update: { name: perm.name },
      create: { 
        id: `perm-${perm.code.toLowerCase()}`,
        ...perm 
      }
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // 3. Create 11 Demo Users (1 for each role type + additional)
  console.log('👥 Creating 11 demo users...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Hash specific passwords for different roles
  const adminPassword = await bcrypt.hash('admin123', 10);
  const configPassword = await bcrypt.hash('config123', 10);
  const financePassword = await bcrypt.hash('finance123', 10);
  const pricePassword = await bcrypt.hash('price123', 10);
  const supportPassword = await bcrypt.hash('support123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const inspectorPassword = await bcrypt.hash('inspector123', 10);
  const depotPassword = await bcrypt.hash('depot123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const buyerPassword = await bcrypt.hash('buyer123', 10);

  // 1. Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@i-contexchange.vn' },
    update: {},
    create: {
      email: 'admin@i-contexchange.vn',
      password: adminPassword,
      displayName: 'Quản trị viên hệ thống',
      phone: '+84901234567',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED'
    }
  });

  // 2. Config Manager
  const configUser = await prisma.user.upsert({
    where: { email: 'config@example.com' },
    update: {},
    create: {
      email: 'config@example.com',
      password: configPassword,
      displayName: 'Quản lý cấu hình',
      phone: '+84901234568',
      status: 'ACTIVE'
    }
  });

  // 3. Finance
  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@example.com' },
    update: {},
    create: {
      email: 'finance@example.com',
      password: financePassword,
      displayName: 'Kế toán',
      phone: '+84901234569',
      status: 'ACTIVE'
    }
  });

  // 4. Price Manager
  const priceUser = await prisma.user.upsert({
    where: { email: 'price@example.com' },
    update: {},
    create: {
      email: 'price@example.com',
      password: pricePassword,
      displayName: 'Quản lý giá',
      phone: '+84901234570',
      status: 'ACTIVE'
    }
  });

  // 5. Customer Support
  const supportUser = await prisma.user.upsert({
    where: { email: 'support@example.com' },
    update: {},
    create: {
      email: 'support@example.com',
      password: supportPassword,
      displayName: 'Hỗ trợ khách hàng',
      phone: '+84901234571',
      status: 'ACTIVE'
    }
  });

  // 6. Depot Manager
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      displayName: 'Quản lý kho bãi',
      phone: '+84901234572',
      status: 'ACTIVE'
    }
  });

  // 7. Inspector
  const inspectorUser = await prisma.user.upsert({
    where: { email: 'inspector@example.com' },
    update: {},
    create: {
      email: 'inspector@example.com',
      password: inspectorPassword,
      displayName: 'Giám định viên',
      phone: '+84901234573',
      status: 'ACTIVE'
    }
  });

  // 8. Depot Staff
  const depotUser = await prisma.user.upsert({
    where: { email: 'depot@example.com' },
    update: {},
    create: {
      email: 'depot@example.com',
      password: depotPassword,
      displayName: 'Nhân viên kho',
      phone: '+84901234574',
      status: 'ACTIVE'
    }
  });

  // 9. Seller
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      password: sellerPassword,
      displayName: 'Người bán container',
      phone: '+84901234575',
      status: 'ACTIVE'
    }
  });

  // 10. Buyer
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      password: buyerPassword,
      displayName: 'Người mua container',
      phone: '+84901234576',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Created 10 demo users');

  // 4. Assign roles to users
  console.log('🔗 Assigning roles to users...');
  
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: configUser.id, roleId: configManagerRole.id } },
    update: {},
    create: { userId: configUser.id, roleId: configManagerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: financeUser.id, roleId: financeRole.id } },
    update: {},
    create: { userId: financeUser.id, roleId: financeRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: priceUser.id, roleId: priceManagerRole.id } },
    update: {},
    create: { userId: priceUser.id, roleId: priceManagerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: supportUser.id, roleId: customerSupportRole.id } },
    update: {},
    create: { userId: supportUser.id, roleId: customerSupportRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: managerUser.id, roleId: depotManagerRole.id } },
    update: {},
    create: { userId: managerUser.id, roleId: depotManagerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: inspectorUser.id, roleId: inspectorRole.id } },
    update: {},
    create: { userId: inspectorUser.id, roleId: inspectorRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: depotUser.id, roleId: depotStaffRole.id } },
    update: {},
    create: { userId: depotUser.id, roleId: depotStaffRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: sellerUser.id, roleId: sellerRole.id } },
    update: {},
    create: { userId: sellerUser.id, roleId: sellerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: buyerUser.id, roleId: buyerRole.id } },
    update: {},
    create: { userId: buyerUser.id, roleId: buyerRole.id }
  });

  console.log('✅ Assigned roles to users');

  // 5. Assign permissions to roles
  console.log('🛡️ Assigning permissions to roles...');

  // Get all permissions for admin
  const allPermissions = await prisma.permission.findMany();
  
  // Admin gets ALL 53 permissions
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id
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
    seller: ['PM-001', 'PM-002', 'PM-003', 'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014', 'PM-021', 'PM-022', 'PM-040', 'PM-050'],
    buyer: ['PM-001', 'PM-002', 'PM-003', 'PM-020', 'PM-022', 'PM-030', 'PM-040', 'PM-041', 'PM-042', 'PM-043', 'PM-050', 'PM-060']
  };

  // Assign permissions to each role
  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (role) {
      for (const permCode of permissionCodes) {
        const permission = await prisma.permission.findUnique({ where: { code: permCode } });
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id
            }
          });
        }
      }
    }
  }

  console.log('✅ Assigned permissions to roles');

  console.log('🎉 Complete RBAC seeding finished successfully!');
  console.log('');
  console.log('📊 RBAC Summary:');
  console.log('- Roles: 10 (+ Guest = 11 total)');
  console.log('- Permissions: 53');
  console.log('- Users: 10 demo accounts');
  console.log('');
  console.log('🔑 Demo accounts:');
  console.log('👑 Admin:           admin@i-contexchange.vn / admin123 (53 permissions)');
  console.log('⚙️ Config Manager:   config@example.com / config123 (16 permissions)');
  console.log('💰 Finance:         finance@example.com / finance123 (6 permissions)');
  console.log('💲 Price Manager:   price@example.com / price123 (4 permissions)');
  console.log('🎧 Customer Support: support@example.com / support123 (5 permissions)');
  console.log('🏭 Depot Manager:   manager@example.com / manager123 (9 permissions)');
  console.log('🔍 Inspector:       inspector@example.com / inspector123 (4 permissions)');
  console.log('👷 Depot Staff:     depot@example.com / depot123 (4 permissions)');
  console.log('🏪 Seller:          seller@example.com / seller123 (12 permissions)');
  console.log('🛒 Buyer:           buyer@example.com / buyer123 (12 permissions)');
  console.log('');
  console.log('📋 Role Hierarchy (level):');
  console.log('100: Admin (Full access)');
  console.log(' 80: Config Manager');
  console.log(' 70: Finance');
  console.log(' 60: Price Manager');
  console.log(' 50: Customer Support');
  console.log(' 30: Depot Manager');
  console.log(' 25: Inspector');
  console.log(' 20: Depot Staff');
  console.log(' 10: Seller & Buyer');
  console.log('  0: Guest (no login required)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });