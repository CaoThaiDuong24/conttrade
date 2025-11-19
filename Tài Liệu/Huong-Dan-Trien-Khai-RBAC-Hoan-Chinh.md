# Hướng Dẫn Triển Khai Hệ Thống RBAC - i-ContExchange

## 🎯 Tổng Quan

Tài liệu này cung cấp hướng dẫn chi tiết để triển khai hoàn chỉnh hệ thống Role-Based Access Control (RBAC) cho dự án i-ContExchange.

### 📋 Tình trạng hiện tại
- ✅ **Database Schema**: Hoàn chỉnh với 8 tables RBAC
- ✅ **Backend Services**: RBAC Service, Auth Routes hoàn chỉnh
- ✅ **Frontend Components**: Auth Context, Dynamic Navigation, Permission Guards
- ✅ **Demo Accounts**: 6 tài khoản demo với các quyền khác nhau
- ✅ **Documentation**: Báo cáo màn hình và hướng dẫn đầy đủ

---

## 🔧 Cài Đặt và Triển Khai

### 1. Database Setup

#### Bước 1: Kiểm tra kết nối database
```bash
# Kiểm tra PostgreSQL đang chạy
pg_ctl status -D "C:\Program Files\PostgreSQL\15\data"

# Hoặc kiểm tra service trên Windows
Get-Service postgresql*
```

#### Bước 2: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

#### Bước 3: Chạy migration
```bash
npx prisma migrate dev --name "init-rbac-system"
```

#### Bước 4: Seed database với demo data
```bash
npx tsx prisma/seed-rbac.ts
```

### 2. Backend Setup

#### Bước 1: Cập nhật server.ts
```typescript
// backend/src/server.ts
import authRbacRoutes from './routes/auth-rbac.js'

// Thay thế route auth cũ
app.register(authRbacRoutes, { prefix: '/api/v1/auth' })
```

#### Bước 2: Kiểm tra environment variables
```bash
# backend/environment.env
DATABASE_URL="postgresql://postgres:240499@localhost:5432/i_contexchange?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-in-production"
```

#### Bước 3: Khởi động backend
```bash
cd backend
npm run dev
```

### 3. Frontend Setup

#### Bước 1: Cập nhật root layout
```typescript
// app/layout.tsx
import { Providers } from '@/components/providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

#### Bước 2: Cập nhật environment variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3005
```

#### Bước 3: Khởi động frontend
```bash
npm run dev
```

---

## 🧪 Testing và Validation

### 1. Test Demo Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@i-contexchange.vn | admin123 | Toàn quyền hệ thống |
| **Buyer** | buyer@example.com | buyer123 | Xem/tạo đơn hàng, marketplace |
| **Seller** | seller@example.com | seller123 | Quản lý listings, orders |
| **Depot Staff** | depot@example.com | depot123 | Quản lý kho bãi, inventory |
| **Inspector** | inspector@example.com | inspector123 | Tạo báo cáo kiểm định |
| **Operator** | operator@example.com | operator123 | Vận hành hệ thống |

### 2. Test Navigation Menu

Kiểm tra mỗi tài khoản có menu khác nhau:

**Admin Menu:**
- Dashboard
- Admin (Users, Roles, Permissions, Organizations, System)
- Marketplace 
- Orders
- Depot
- Inspection
- Financial
- Disputes
- Account

**Buyer Menu:**
- Dashboard
- Marketplace (Browse Listings)
- Orders (My Orders)
- Account

**Seller Menu:**
- Dashboard
- Marketplace (Browse, My Listings, Create)
- Orders (My Orders)
- Account

### 3. Test Permission Guards

```typescript
// Sử dụng Permission Guard
<PermissionGuard permission="admin.users.read">
  <UserManagementComponent />
</PermissionGuard>

// Sử dụng Role Guard
<RoleGuard role="admin">
  <AdminDashboard />
</RoleGuard>
```

---

## 🔐 Security Implementation

### 1. Route Protection

```typescript
// middleware.ts đã được cập nhật để check permissions
export async function middleware(request: NextRequest) {
  // Check authentication
  // Check route permissions
  // Redirect if unauthorized
}
```

### 2. API Protection

```typescript
// Backend routes với permission checking
app.register(async function (fastify) {
  fastify.addHook('preHandler', async (request, reply) => {
    await request.jwtVerify()
    const hasPermission = await RBACService.hasPermission(
      request.user.id, 
      'required.permission'
    )
    if (!hasPermission) {
      return reply.forbidden()
    }
  })
})
```

### 3. Component Level Protection

```typescript
// Sử dụng useAuth hook
const { hasPermission, hasRole } = useAuth()

if (!hasPermission('users.read')) {
  return <div>Không có quyền truy cập</div>
}
```

---

## 📊 Database Schema Overview

### Core RBAC Tables

1. **users** - User information và trạng thái
2. **roles** - Role definitions với hierarchy
3. **permissions** - Granular permission definitions
4. **user_roles** - Many-to-many user-role mapping
5. **role_permissions** - Many-to-many role-permission mapping
6. **user_permissions** - Direct user permissions
7. **user_sessions** - JWT session management
8. **login_logs** - Audit trail cho logins

### Permission Matrix

```
admin.*                 - Toàn quyền admin
listings.read          - Xem listings
listings.write         - Tạo/sửa listings
orders.read            - Xem orders
orders.write           - Tạo orders
orders.approve         - Duyệt orders
depot.inventory.read   - Xem inventory
depot.receiving.write  - Xử lý hàng nhập
inspection.read        - Xem báo cáo kiểm định
inspection.write       - Tạo báo cáo kiểm định
billing.read           - Xem billing info
disputes.read          - Xem disputes
```

---

## 🚀 Production Deployment

### 1. Environment Variables

```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/db
JWT_SECRET=super-secure-secret-256-bit
JWT_REFRESH_SECRET=another-secure-secret-256-bit
CORS_ORIGIN=https://yourdomain.com
```

### 2. Database Migration

```bash
# Run migrations on production
npx prisma migrate deploy

# Seed initial data
npx tsx prisma/seed-rbac.ts
```

### 3. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (256-bit)
- [ ] Enable HTTPS only
- [ ] Configure proper CORS
- [ ] Set up database SSL
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set session timeouts

---

## 📈 Monitoring và Maintenance

### 1. Health Checks

```bash
# API Health
curl http://localhost:3005/api/v1/health

# Database Health
npx prisma db pull
```

### 2. User Management

```typescript
// Assign role to user
await RBACService.assignRole(userId, 'buyer', adminId)

// Grant specific permission
await RBACService.grantPermission(userId, 'special.permission', adminId)

// Check user permissions
const permissions = await RBACService.getUserWithPermissions(userId)
```

### 3. Audit và Logs

```sql
-- Check recent logins
SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 100;

-- Check active sessions
SELECT * FROM user_sessions WHERE is_active = true;

-- User role assignments
SELECT u.email, r.name FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE ur.is_active = true;
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Prisma generate fails**
   ```bash
   # Clear cache và regenerate
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

2. **JWT Token issues**
   ```bash
   # Check JWT secrets are set
   echo $JWT_SECRET
   ```

3. **Permission denied errors**
   ```sql
   -- Check user permissions
   SELECT p.code FROM users u
   JOIN user_roles ur ON u.id = ur.user_id
   JOIN role_permissions rp ON ur.role_id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE u.email = 'user@example.com';
   ```

4. **Database connection issues**
   ```bash
   # Test connection
   npx prisma db pull
   ```

---

## 📚 API Documentation

### Auth Endpoints

```bash
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
GET  /api/v1/auth/navigation
```

### Admin Endpoints

```bash
GET    /api/v1/admin/users
POST   /api/v1/admin/users
PUT    /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
GET    /api/v1/admin/roles
POST   /api/v1/admin/roles
```

---

## ✅ Completion Checklist

### Backend
- [x] Database schema design
- [x] Prisma models và migrations
- [x] RBAC service implementation
- [x] Auth routes với JWT
- [x] Permission middleware
- [x] Seed data với demo accounts

### Frontend
- [x] Auth context provider
- [x] Dynamic navigation component
- [x] Permission guards
- [x] Role guards
- [x] Enhanced login page
- [x] Demo account integration

### Documentation
- [x] API documentation
- [x] Database schema docs
- [x] Deployment guide
- [x] User manual
- [x] Security guide
- [x] Troubleshooting guide

### Testing
- [x] Demo accounts functional
- [x] Navigation menu dynamic
- [x] Permission checking works
- [x] JWT authentication
- [x] Route protection

---

## 🎉 Next Steps

1. **Phase 2 Features:**
   - Multi-organization support
   - Advanced audit logging
   - 2FA implementation
   - IP-based restrictions

2. **Performance Optimization:**
   - Permission caching
   - Session optimization
   - Database indexing

3. **UI/UX Enhancements:**
   - Role-based dashboards
   - Advanced user management
   - Real-time notifications

---

*Tài liệu này được cập nhật lần cuối: $(Get-Date -Format "dd/MM/yyyy HH:mm")*