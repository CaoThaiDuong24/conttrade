# 🚀 HƯỚNG DẪN SETUP HỆ THỐNG RBAC - i-ContExchange

**Ngày tạo**: 30/09/2025  
**Phiên bản**: v1.0  
**Mục đích**: Hệ thống phân quyền chi tiết cho từng chức năng và màn hình  

---

## 📋 **TỔNG QUAN HỆ THỐNG RBAC**

### **🎯 Mục tiêu**
- Phân quyền chi tiết cho 104 màn hình
- Navigation menu động theo vai trò
- Bảo mật route-level và component-level
- Database-driven permissions
- Session management và token refresh

### **👥 Vai trò người dùng**
1. **Guest**: Khách chưa đăng nhập
2. **Buyer**: Người mua container
3. **Seller**: Người bán container  
4. **Depot Staff**: Nhân viên kho bãi
5. **Depot Manager**: Quản lý kho bãi
6. **Inspector**: Giám định viên
7. **Admin**: Quản trị viên hệ thống

---

## 🛠️ **SETUP INSTRUCTIONS**

### **Bước 1: Database Setup**

#### **1.1 Cập nhật Prisma Schema**
```bash
# Copy schema mới
cp backend/prisma/schema-rbac.prisma backend/prisma/schema.prisma

# Tạo migration
cd backend
npx prisma migrate dev --name "add-rbac-system"
npx prisma generate
```

#### **1.2 Seed Database với dữ liệu mẫu**
```bash
# Chạy seed script
cd backend
npx tsx prisma/seed-rbac.ts
```

### **Bước 2: Backend Setup**

#### **2.1 Install Dependencies**
```bash
cd backend
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

#### **2.2 Environment Variables**
```env
# Add to .env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

#### **2.3 Update Auth Routes**
```bash
# Copy new auth routes
cp src/routes/auth-rbac.ts src/routes/auth.ts
```

### **Bước 3: Frontend Setup**

#### **3.1 Install Dependencies**
```bash
cd ../
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

#### **3.2 Update Layout với AuthProvider**
```tsx
// app/layout.tsx
import { AuthProvider } from '@/lib/auth/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### **3.3 Update Dashboard Layout**
```tsx
// components/layout/dashboard-layout.tsx
import { RBACDashboardSidebar } from './rbac-dashboard-sidebar';
import { useAuth } from '@/lib/auth/auth-context';

export function DashboardLayout({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <SidebarProvider>
      <RBACDashboardSidebar 
        isAuthenticated={isAuthenticated}
        userInfo={user}
      />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### **Bước 4: Update Login Page**
```tsx
// app/[locale]/auth/login/page.tsx
import EnhancedLoginPage from './enhanced-page';
export default EnhancedLoginPage;
```

---

## 🔐 **TÀI KHOẢN DEMO**

### **Demo Accounts (Password: 123456)**

| Vai trò | Email | Mô tả | Permissions |
|---------|-------|--------|-------------|
| **👑 Admin** | `admin@i-contexchange.vn` | Quản trị viên hệ thống | Tất cả quyền |
| **🛒 Buyer** | `buyer@example.com` | Người mua container | Dashboard, RFQ, Orders, Payments |
| **🏪 Seller** | `seller@example.com` | Người bán container | Listings, Quotes, Orders, Delivery |
| **🏭 Depot Staff** | `depot@example.com` | Nhân viên kho bãi | Inventory, Inspections, Repairs |
| **👔 Manager** | `manager@example.com` | Quản lý kho bãi | Full depot + billing |
| **🔍 Inspector** | `inspector@example.com` | Giám định viên | Inspections, Reports, Quality |

### **Test Accounts (Các trạng thái khác)**

| Email | Status | KYC Status | Mô tả |
|-------|--------|------------|--------|
| `buyer2@example.com` | Active | Pending | Buyer chờ KYC |
| `seller2@example.com` | Pending | Unverified | Seller chưa verify |

---

## 🎛️ **NAVIGATION MENU THEO VAI TRÒ**

### **👑 Admin Navigation (19 items)**
```
📊 Dashboard
⚙️ Quản trị
  ├── 📊 Tổng quan (/admin)
  ├── 👥 Người dùng (/admin/users)  
  ├── 📦 Tin đăng (/admin/listings)
  ├── ⚠️ Tranh chấp (/admin/disputes)
  ├── ⚙️ Cấu hình (/admin/config)
  ├── 📄 Mẫu thông báo (/admin/templates)
  ├── 🛡️ Nhật ký (/admin/audit)
  └── 📈 Thống kê (/admin/analytics)
📦 Container (/listings)
🛒 Đơn hàng (/orders)
👤 Tài khoản (/account/profile)
```

### **🛒 Buyer Navigation (28 items)**
```
📊 Dashboard
📦 Container (/listings)
📄 RFQ
  ├── ➕ Tạo RFQ (/rfq/create)
  ├── 📤 RFQ đã gửi (/rfq/sent)
  └── 📥 Báo giá nhận (/rfq/received)
🛒 Đơn hàng
  ├── 📋 Tất cả đơn hàng (/orders)
  ├── 💳 Thanh toán (/orders/checkout)
  └── 🚚 Theo dõi (/orders/tracking)
💰 Thanh toán
  ├── 🛡️ Ví escrow (/payments/escrow)
  ├── 📜 Lịch sử (/payments/history)
  └── 💳 Phương thức (/payments/methods)
🔍 Giám định (/inspection/new)
🚚 Vận chuyển (/delivery)
⭐ Đánh giá (/reviews)
⚠️ Khiếu nại (/disputes)
👤 Tài khoản (/account/profile)
```

### **🏪 Seller Navigation (22 items)**
```
📊 Dashboard  
📦 Container (/listings)
🏪 Bán hàng
  ├── ➕ Đăng tin mới (/sell/new)
  ├── 📋 Tin đăng của tôi (/sell/my-listings)
  ├── ✏️ Nháp (/sell/draft)
  └── 📈 Thống kê (/sell/analytics)
📄 RFQ & Báo giá
  ├── 📥 RFQ nhận được (/rfq)
  ├── ➕ Tạo báo giá (/quotes/create)
  └── 📋 Quản lý báo giá (/quotes/management)
🛒 Đơn hàng (/orders)
🚚 Vận chuyển (/delivery)
⭐ Đánh giá (/reviews)
👤 Tài khoản (/account/profile)
🧾 Hóa đơn (/billing)
```

### **🏭 Depot Staff Navigation (15 items)**
```
📊 Dashboard
🏭 Kho bãi
  ├── 📦 Tồn kho (/depot/stock)
  ├── ↔️ Di chuyển (/depot/movements)  
  ├── 🚚 Chuyển kho (/depot/transfers)
  └── ✏️ Điều chỉnh (/depot/adjustments)
🔍 Giám định
  ├── 📅 Lịch giám định (/depot/inspections)
  ├── 📄 Báo cáo (/inspection/reports)
  └── ✅ Tiêu chuẩn (/inspection/quality)
🔧 Sửa chữa (/depot/repairs)
🚚 Vận chuyển (/delivery)
👤 Tài khoản (/account/profile)
```

---

## 🔒 **PERMISSION MATRIX**

### **Modules & Actions**
| Module | Actions | Admin | Buyer | Seller | Depot Staff | Inspector |
|--------|---------|-------|-------|--------|------------|-----------|
| **Dashboard** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Listings** | read | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Listings** | write | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Listings** | approve | ✅ | ❌ | ❌ | ❌ | ❌ |
| **RFQ** | read | ✅ | ✅ | ✅ | ❌ | ❌ |
| **RFQ** | write | ✅ | ✅ | ❌ | ❌ | ❌ |
| **RFQ** | respond | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Orders** | read | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Orders** | write | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Orders** | process | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Depot** | inventory | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Depot** | inspect | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Inspection** | write | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Admin** | access | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🧪 **TESTING GUIDE**

### **1. Login Testing**
```bash
# Test với từng tài khoản
1. Đăng nhập admin@i-contexchange.vn / 123456
   ✅ Kiểm tra navigation có đầy đủ admin menu
   ✅ Truy cập được /admin/*
   
2. Đăng nhập buyer@example.com / 123456
   ✅ Navigation chỉ có buyer menu
   ❌ Không truy cập được /admin
   ✅ Truy cập được /rfq, /orders
   
3. Đăng nhập seller@example.com / 123456
   ✅ Navigation có seller menu
   ✅ Truy cập được /sell/*, /quotes/*
   ❌ Không truy cập được /admin
```

### **2. Permission Testing**
```javascript
// Test permission trong component
import { useAuth } from '@/lib/auth/auth-context';

function MyComponent() {
  const { hasPermission, hasRole } = useAuth();
  
  return (
    <div>
      {hasPermission('admin.access') && (
        <Button>Admin Only</Button>
      )}
      
      {hasRole('seller') && (
        <Button>Seller Only</Button>
      )}
    </div>
  );
}
```

### **3. Route Protection Testing**
```bash
# Test route protection
1. Đăng xuất → Truy cập /dashboard
   ✅ Redirect to /auth/login
   
2. Login buyer → Truy cập /admin
   ✅ Redirect to /dashboard hoặc 403
   
3. Login seller → Truy cập /sell/new
   ✅ Access granted
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Production Setup**
- [ ] Update JWT secrets in production env
- [ ] Setup database with proper indexes
- [ ] Configure session timeout
- [ ] Setup rate limiting for auth endpoints
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Setup monitoring for auth failures
- [ ] Test all permission combinations

### **Security Checklist**
- [ ] JWT secrets are strong (32+ chars)
- [ ] Passwords are hashed with bcrypt
- [ ] Session tokens expire properly
- [ ] Refresh tokens are secure
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts
- [ ] Audit logging enabled
- [ ] Permission validation on every request

---

## 📚 **API ENDPOINTS**

### **Authentication**
```
POST /api/v1/auth/login
POST /api/v1/auth/logout  
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
POST /api/v1/auth/check-permission
```

### **Admin**
```
GET  /api/v1/admin/users
PUT  /api/v1/admin/users/:id/roles
GET  /api/v1/admin/permissions
POST /api/v1/admin/assign-permission
```

---

## 🎯 **NEXT STEPS**

### **Phase 1: Core RBAC (Done)**
- ✅ Database schema
- ✅ Authentication system
- ✅ Permission-based navigation
- ✅ Route protection
- ✅ Demo accounts

### **Phase 2: Advanced Features**
- [ ] Dynamic permission assignment
- [ ] Organization-level permissions
- [ ] IP-based restrictions
- [ ] Multi-factor authentication
- [ ] Session management dashboard
- [ ] Audit trail with search

### **Phase 3: Enterprise Features**
- [ ] SSO integration
- [ ] LDAP/Active Directory
- [ ] Custom permission sets
- [ ] Temporary access grants
- [ ] Approval workflows
- [ ] Compliance reporting

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

**1. JWT Token Errors**
```bash
Error: jwt malformed
Solution: Check JWT_SECRET in .env file
```

**2. Permission Denied**
```bash
Error: User lacks required permission
Solution: Check user roles in database
```

**3. Navigation Not Updating**
```bash
Issue: Old menu still showing
Solution: Clear localStorage and re-login
```

**4. Database Connection**
```bash
Error: Can't connect to database
Solution: Check DATABASE_URL and run migrations
```

### **Debug Commands**
```bash
# Check user permissions
npx prisma studio

# View JWT token content
# Go to jwt.io and paste token

# Reset database
npx prisma migrate reset
npx tsx prisma/seed-rbac.ts
```

---

## 📞 **SUPPORT**

### **Team Contacts**
- **Tech Lead**: dev-team@i-contexchange.vn
- **DevOps**: devops@i-contexchange.vn  
- **Security**: security@i-contexchange.vn

### **Documentation**
- **API Docs**: `/docs/api`
- **Permission Matrix**: `/docs/permissions`
- **Architecture**: `/docs/architecture`

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**