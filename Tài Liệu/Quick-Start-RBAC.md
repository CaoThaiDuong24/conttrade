# 🚀 Quick Start - i-ContExchange RBAC System

## ⚡ Khởi chạy nhanh trong 5 phút

### 1. Database Setup (1 phút)
```powershell
# Mở terminal ở thư mục backend
cd "d:\DiskE\sự kiện lta\LTA PROJECT NEW\Web\backend"

# Generate Prisma client
npx prisma generate

# Chạy migration (tạo tables)
npx prisma migrate dev --name "init-rbac"

# Seed demo data
npx tsx prisma/seed-rbac.ts
```

### 2. Backend Start (1 phút)
```powershell
# Khởi động backend server
npm run dev
```
✅ Backend sẽ chạy tại: http://localhost:3005

### 3. Frontend Start (1 phút)  
```powershell
# Mở terminal mới ở thư mục root
cd "d:\DiskE\sự kiện lta\LTA PROJECT NEW\Web"

# Khởi động frontend
npm run dev
```
✅ Frontend sẽ chạy tại: http://localhost:3000

### 4. Test Login (2 phút)

Truy cập: http://localhost:3000/vi/auth/login

**Tài khoản Admin:**
- Email: `admin@i-contexchange.vn`
- Password: `admin123`

**Tài khoản Buyer:**
- Email: `buyer@example.com`  
- Password: `buyer123`

**Tài khoản Seller:**
- Email: `seller@example.com`
- Password: `seller123`

### 5. Verify Features
- ✅ Đăng nhập thành công
- ✅ Navigation menu khác nhau theo role
- ✅ Dashboard hiển thị đúng permissions
- ✅ Logout/login các account khác nhau

---

## 🎯 Demo Account Quick Access

Tại trang login, click vào các nút demo để đăng nhập nhanh:

| Button | Role | Access Level |
|--------|------|--------------|
| 👑 **Admin** | Super Admin | Toàn quyền hệ thống |
| 🛒 **Buyer** | Container Buyer | Marketplace, Orders |
| 💰 **Seller** | Container Seller | Listings, Sales |  
| 🏭 **Depot** | Depot Staff | Inventory, Operations |
| 🔍 **Inspector** | Quality Inspector | Inspection Reports |
| ⚙️ **Operator** | System Operator | System Operations |

---

## 🔍 Kiểm tra nhanh

### Health Check API
```bash
curl http://localhost:3005/api/v1/health
```

### Database Check
```sql
-- Kiểm tra users được tạo
SELECT email, status FROM users;

-- Kiểm tra roles
SELECT code, name FROM roles;

-- Kiểm tra permissions
SELECT code, module, action FROM permissions LIMIT 10;
```

### Frontend Check
- Navigation menu thay đổi theo role
- Permission guards hoạt động
- Auth context lưu trữ user info

---

## ⚠️ Troubleshooting Nhanh

**Lỗi Prisma generate:**
```powershell
Remove-Item -Recurse -Force node_modules\.prisma\client -ErrorAction SilentlyContinue
npx prisma generate
```

**Lỗi Database connection:**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong environment.env

**Lỗi Port bị chiếm:**
- Backend: Thay đổi PORT trong environment.env
- Frontend: Chạy `npm run dev -- -p 3001`

---

## 🎉 Success!

Nếu tất cả hoạt động, bạn đã có:
- ✅ Hệ thống authentication hoàn chỉnh
- ✅ Role-based access control
- ✅ Dynamic navigation
- ✅ 6 demo accounts với quyền khác nhau
- ✅ Permission guards hoạt động
- ✅ Database với đầy đủ RBAC tables

**Tiếp theo:** Đọc [Hướng Dẫn Triển Khai RBAC Hoàn Chỉnh](./Huong-Dan-Trien-Khai-RBAC-Hoan-Chinh.md) để hiểu chi tiết hệ thống.