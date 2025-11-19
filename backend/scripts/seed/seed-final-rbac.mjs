/**
 * ✅ COMPLETE RBAC SEED - 11 Account Types & 53 Permissions
 * Tạo đầy đủ 11 loại tài khoản và 53 phân quyền theo đúng yêu cầu
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating complete RBAC system with 11 account types...')

  try {
    // 1. Create all 53 permissions first
    console.log('🔐 Creating 53 permissions...')
    
    const permissionsData = [
      // Public & Viewing (3)
      { code: 'PM-001', name: 'VIEW_PUBLIC_LISTINGS', description: 'Xem tin công khai', module: 'listings', action: 'view' },
      { code: 'PM-002', name: 'SEARCH_LISTINGS', description: 'Tìm kiếm, lọc tin', module: 'listings', action: 'search' },
      { code: 'PM-003', name: 'VIEW_SELLER_PROFILE', description: 'Xem hồ sơ người bán', module: 'users', action: 'view' },
      
      // Listing Management (5)
      { code: 'PM-010', name: 'CREATE_LISTING', description: 'Tạo tin đăng', module: 'listings', action: 'create' },
      { code: 'PM-011', name: 'EDIT_LISTING', description: 'Sửa tin đăng', module: 'listings', action: 'edit' },
      { code: 'PM-012', name: 'PUBLISH_LISTING', description: 'Gửi duyệt/Xuất bản tin', module: 'listings', action: 'publish' },
      { code: 'PM-013', name: 'ARCHIVE_LISTING', description: 'Ẩn/Lưu trữ tin', module: 'listings', action: 'archive' },
      { code: 'PM-014', name: 'DELETE_LISTING', description: 'Xóa tin đăng', module: 'listings', action: 'delete' },
      
      // RFQ & Quote (5)
      { code: 'PM-020', name: 'CREATE_RFQ', description: 'Tạo RFQ (yêu cầu báo giá)', module: 'rfq', action: 'create' },
      { code: 'PM-021', name: 'ISSUE_QUOTE', description: 'Phát hành báo giá', module: 'quotes', action: 'issue' },
      { code: 'PM-022', name: 'VIEW_QUOTES', description: 'Xem/so sánh báo giá', module: 'quotes', action: 'view' },
      { code: 'PM-023', name: 'MANAGE_QA', description: 'Quản lý Q&A có kiểm duyệt', module: 'qa', action: 'manage' },
      { code: 'PM-024', name: 'REDACTION_ENFORCE', description: 'Thực thi che thông tin liên hệ', module: 'moderation', action: 'redact' },
      
      // Inspection (2)
      { code: 'PM-030', name: 'REQUEST_INSPECTION', description: 'Yêu cầu giám định', module: 'inspection', action: 'request' },
      { code: 'PM-031', name: 'VIEW_INSPECTION_REPORT', description: 'Xem báo cáo giám định', module: 'inspection', action: 'view' },
      
      // Orders (4)
      { code: 'PM-040', name: 'CREATE_ORDER', description: 'Tạo đơn hàng', module: 'orders', action: 'create' },
      { code: 'PM-041', name: 'PAY_ESCROW', description: 'Thanh toán ký quỹ', module: 'payments', action: 'escrow' },
      { code: 'PM-042', name: 'REQUEST_DELIVERY', description: 'Yêu cầu vận chuyển', module: 'delivery', action: 'request' },
      { code: 'PM-043', name: 'CONFIRM_RECEIPT', description: 'Xác nhận nhận hàng', module: 'orders', action: 'confirm' },
      
      // Reviews & Disputes (3)
      { code: 'PM-050', name: 'RATE_AND_REVIEW', description: 'Đánh giá sau giao dịch', module: 'reviews', action: 'write' },
      { code: 'PM-060', name: 'FILE_DISPUTE', description: 'Khiếu nại', module: 'disputes', action: 'file' },
      { code: 'PM-061', name: 'RESOLVE_DISPUTE', description: 'Xử lý tranh chấp', module: 'disputes', action: 'resolve' },
      
      // Admin (5)
      { code: 'PM-070', name: 'ADMIN_REVIEW_LISTING', description: 'Duyệt tin đăng', module: 'admin', action: 'review' },
      { code: 'PM-071', name: 'ADMIN_MANAGE_USERS', description: 'Quản lý người dùng/vai trò', module: 'admin', action: 'users' },
      { code: 'PM-072', name: 'ADMIN_VIEW_DASHBOARD', description: 'Xem KPI dashboard', module: 'admin', action: 'dashboard' },
      { code: 'PM-073', name: 'ADMIN_CONFIG_PRICING', description: 'Cấu hình phí, gói', module: 'admin', action: 'pricing' },
      { code: 'PM-074', name: 'MANAGE_PRICE_RULES', description: 'Quản lý Pricing Rules/price band', module: 'pricing', action: 'manage' },
      
      // Depot Operations (7)
      { code: 'PM-080', name: 'DEPOT_CREATE_JOB', description: 'Tạo lệnh việc depot', module: 'depot', action: 'create_job' },
      { code: 'PM-081', name: 'DEPOT_UPDATE_JOB', description: 'Cập nhật công việc depot', module: 'depot', action: 'update_job' },
      { code: 'PM-082', name: 'DEPOT_ISSUE_EIR', description: 'Lập EIR', module: 'depot', action: 'issue_eir' },
      { code: 'PM-083', name: 'DEPOT_VIEW_STOCK', description: 'Xem tồn kho depot', module: 'depot', action: 'view_stock' },
      { code: 'PM-084', name: 'DEPOT_VIEW_MOVEMENTS', description: 'Xem nhật ký nhập-xuất-chuyển', module: 'depot', action: 'view_movements' },
      { code: 'PM-085', name: 'DEPOT_ADJUST_STOCK', description: 'Điều chỉnh tồn (manual IN/OUT)', module: 'depot', action: 'adjust_stock' },
      { code: 'PM-086', name: 'DEPOT_TRANSFER_STOCK', description: 'Chuyển giữa các Depot', module: 'depot', action: 'transfer_stock' },
      
      // Finance (2)
      { code: 'PM-090', name: 'FINANCE_RECONCILE', description: 'Đối soát/giải ngân', module: 'finance', action: 'reconcile' },
      { code: 'PM-091', name: 'FINANCE_INVOICE', description: 'Xuất hóa đơn', module: 'finance', action: 'invoice' },
      
      // Customer Support (1)
      { code: 'PM-100', name: 'CS_MANAGE_TICKETS', description: 'Xử lý yêu cầu hỗ trợ', module: 'support', action: 'manage' },
      
      // Configuration Management (16)
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
    ]

    // Create permissions
    for (const perm of permissionsData) {
      await prisma.permissions.upsert({
        where: { code: perm.code },
        update: { name: perm.name },
        create: {
          id: `perm-${perm.code.toLowerCase()}`,
          code: perm.code,
          name: perm.name,
          description: perm.description,
          category: perm.module,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    }
    console.log(`✅ Created ${permissionsData.length} permissions`)

    // 2. Create 10 roles (+ Guest = 11 total)
    console.log('🎭 Creating 10 roles...')
    
    const rolesData = [
      { code: 'admin', name: 'Quản trị viên', level: 100, description: 'Toàn quyền hệ thống' },
      { code: 'config_manager', name: 'Quản lý cấu hình', level: 80, description: 'Quản lý cấu hình hệ thống' },
      { code: 'finance', name: 'Kế toán', level: 70, description: 'Quản lý tài chính' },
      { code: 'price_manager', name: 'Quản lý giá', level: 60, description: 'Quản lý giá cả' },
      { code: 'customer_support', name: 'Hỗ trợ khách hàng', level: 50, description: 'Hỗ trợ khách hàng' },
      { code: 'depot_manager', name: 'Quản lý kho bãi', level: 30, description: 'Quản lý depot' },
      { code: 'inspector', name: 'Giám định viên', level: 25, description: 'Giám định container' },
      { code: 'depot_staff', name: 'Nhân viên kho', level: 20, description: 'Nhân viên depot' },
      { code: 'seller', name: 'Người bán', level: 10, description: 'Bán container' },
      { code: 'buyer', name: 'Người mua', level: 10, description: 'Mua container' },
    ]

    for (const role of rolesData) {
      await prisma.roles.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: {
          id: `role-${role.code}`,
          code: role.code,
          name: role.name,
          description: role.description,
          level: role.level,
          is_system_role: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    }
    console.log(`✅ Created ${rolesData.length} roles`)

    // 3. Create 10 demo users (1 for each role)
    console.log('👥 Creating 10 demo users...')
    
    const usersData = [
      { email: 'admin@i-contexchange.vn', password: 'admin123', name: 'Quản trị viên hệ thống', roleCode: 'admin' },
      { email: 'config@example.com', password: 'config123', name: 'Quản lý cấu hình', roleCode: 'config_manager' },
      { email: 'finance@example.com', password: 'finance123', name: 'Kế toán', roleCode: 'finance' },
      { email: 'price@example.com', password: 'price123', name: 'Quản lý giá', roleCode: 'price_manager' },
      { email: 'support@example.com', password: 'support123', name: 'Hỗ trợ khách hàng', roleCode: 'customer_support' },
      { email: 'manager@example.com', password: 'manager123', name: 'Quản lý kho bãi', roleCode: 'depot_manager' },
      { email: 'inspector@example.com', password: 'inspector123', name: 'Giám định viên', roleCode: 'inspector' },
      { email: 'depot@example.com', password: 'depot123', name: 'Nhân viên kho', roleCode: 'depot_staff' },
      { email: 'seller@example.com', password: 'seller123', name: 'Người bán container', roleCode: 'seller' },
      { email: 'buyer@example.com', password: 'buyer123', name: 'Người mua container', roleCode: 'buyer' },
    ]

    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      const user = await prisma.users.upsert({
        where: { email: userData.email },
        update: { display_name: userData.name },
        create: {
          id: `user-${userData.roleCode}`,
          email: userData.email,
          password_hash: hashedPassword,
          display_name: userData.name,
          phone: `+8490123456${usersData.indexOf(userData)}`,
          status: 'ACTIVE',
          kyc_status: 'VERIFIED',
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      // Assign role to user
      const role = await prisma.roles.findUnique({ where: { code: userData.roleCode } })
      if (role) {
        await prisma.user_roles.upsert({
          where: {
            user_id_role_id: {
              user_id: user.id,
              role_id: role.id
            }
          },
          update: {},
          create: {
            id: `user-role-${userData.roleCode}`,
            user_id: user.id,
            role_id: role.id,
            assigned_at: new Date(),
            created_at: new Date()
          }
        })
      }
    }
    console.log(`✅ Created ${usersData.length} demo users with roles`)

    // 4. Assign permissions to roles
    console.log('🛡️ Assigning permissions to roles...')
    
    // Get all permissions for admin
    const allPermissions = await prisma.permissions.findMany()
    const adminRole = await prisma.roles.findUnique({ where: { code: 'admin' } })
    
    // Admin gets ALL permissions
    if (adminRole) {
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
            id: `role-perm-admin-${perm.code.toLowerCase()}`,
            role_id: adminRole.id,
            permission_id: perm.id,
            scope: 'GLOBAL',
            created_at: new Date()
          }
        })
      }
    }

    // Define specific permissions for other roles
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
    }

    // Assign permissions to each role
    for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
      const role = await prisma.roles.findUnique({ where: { code: roleCode } })
      if (role) {
        for (const permCode of permissionCodes) {
          const permission = await prisma.permissions.findUnique({ where: { code: permCode } })
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
                id: `role-perm-${roleCode}-${permCode.toLowerCase()}`,
                role_id: role.id,
                permission_id: permission.id,
                scope: 'GLOBAL',
                created_at: new Date()
              }
            })
          }
        }
      }
    }
    console.log('✅ Assigned permissions to roles')

    console.log('\n🎉 COMPLETE RBAC SYSTEM CREATED SUCCESSFULLY!')
    console.log('\n📊 SUMMARY:')
    console.log('🎭 Roles: 10 (+ Guest = 11 total account types)')
    console.log('🔐 Permissions: 53 total')
    console.log('👥 Demo Users: 10 accounts')
    console.log('\n🔑 DEMO ACCOUNTS:')
    console.log('👑 Admin:           admin@i-contexchange.vn / admin123 (53 permissions)')
    console.log('⚙️  Config Manager:  config@example.com / config123 (16 permissions)')
    console.log('💰 Finance:         finance@example.com / finance123 (6 permissions)')
    console.log('💲 Price Manager:   price@example.com / price123 (4 permissions)')
    console.log('🎧 Customer Support: support@example.com / support123 (5 permissions)')
    console.log('🏭 Depot Manager:   manager@example.com / manager123 (9 permissions)')
    console.log('🔍 Inspector:       inspector@example.com / inspector123 (4 permissions)')
    console.log('👷 Depot Staff:     depot@example.com / depot123 (4 permissions)')
    console.log('🏪 Seller:          seller@example.com / seller123 (12 permissions)')
    console.log('🛒 Buyer:           buyer@example.com / buyer123 (12 permissions)')
    console.log('\n📋 ROLE HIERARCHY:')
    console.log('100: Admin (Full system access)')
    console.log(' 80: Config Manager (System configuration)')
    console.log(' 70: Finance (Financial management)')
    console.log(' 60: Price Manager (Pricing control)')
    console.log(' 50: Customer Support (User support)')
    console.log(' 30: Depot Manager (Depot operations)')
    console.log(' 25: Inspector (Quality control)')
    console.log(' 20: Depot Staff (Warehouse work)')
    console.log(' 10: Seller & Buyer (Marketplace users)')
    console.log('  0: Guest (Public access, no login)')

  } catch (error) {
    console.error('❌ RBAC Creation Error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('\n✅ Database connection closed')
  })

export default main