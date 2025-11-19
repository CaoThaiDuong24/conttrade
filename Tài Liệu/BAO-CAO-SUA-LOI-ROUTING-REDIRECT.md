# 🔧 BÁO CÁO SỬA LỖI ROUTING - Tất cả menu redirect về Dashboard

**Ngày sửa:** 2 tháng 10, 2025  
**Phiên bản:** v1.0 - CRITICAL FIX  
**Tác giả:** AI Assistant  
**Mức độ:** 🔴 CRITICAL

---

## ⚠️ **VẤN ĐỀ**

### **Hiện tượng:**
- ❌ **Tất cả menu đều redirect về `/vi/dashboard`**
- ❌ Admin không thể truy cập `/admin/*` routes
- ❌ Các menu khác cũng không hoạt động
- ❌ Chỉ có dashboard hoạt động

### **Nguyên nhân:**

#### **1. Logic phân quyền sai trong Middleware:**

**File:** `middleware.ts`

**Vấn đề:**
```typescript
// ❌ TRƯỚC KHI SỬA (Dòng 228-250)
async function getUserRoles(userId: string): Promise<string[]> {
  // Chỉ kiểm tra userId string
  if (userId.includes('admin')) {
    return ['admin'];
  }
  // ...
  return ['buyer']; // ❌ Luôn trả về buyer vì userId không chứa 'admin'
}

// ❌ Kết quả:
// Admin login → userId = "67890abcd" 
// → Không chứa 'admin' 
// → Return ['buyer']
// → Không có permission 'admin.access'
// → REDIRECT về /dashboard (dòng 186)
```

**Middleware redirect logic:**
```typescript
// Dòng 182-187
if (requiredPermission && !hasPermission(userPermissions, userRoles, requiredPermission)) {
  console.log('❌ PERMISSION DENIED:', requiredPermission);
  
  // ❌ Redirect to dashboard instead of login for authenticated users
  const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
  return NextResponse.redirect(dashboardUrl);
}
```

---

## ✅ **GIẢI PHÁP ĐÃ THỰC HIỆN**

### **1. Sửa getUserRoles function:**

```typescript
// ✅ SAU KHI SỬA
async function getUserRoles(userId: string, jwtRole?: string, jwtRoles?: string[]): Promise<string[]> {
  // Priority 1: Use roles from JWT payload (array)
  if (jwtRoles && Array.isArray(jwtRoles) && jwtRoles.length > 0) {
    console.log('📋 Using roles from JWT array:', jwtRoles);
    return jwtRoles;
  }
  
  // Priority 2: Use single role from JWT payload
  if (jwtRole) {
    console.log('📋 Using role from JWT:', jwtRole);
    return [jwtRole];
  }
  
  // Priority 3: Check userId patterns (fallback for old tokens)
  if (userId.includes('admin')) {
    console.log('📋 Detected admin from userId');
    return ['admin'];
  }
  // ... other checks
  
  console.log('📋 Defaulting to buyer role');
  return ['buyer'];
}
```

**Cải tiến:**
- ✅ Priority 1: Lấy roles từ JWT payload (array)
- ✅ Priority 2: Lấy single role từ JWT payload
- ✅ Priority 3: Fallback check userId pattern
- ✅ Logging rõ ràng để debug

### **2. Sửa getUserPermissions function:**

```typescript
// ✅ TRƯỚC
async function getUserPermissions(userId: string): Promise<string[]> {
  const roles = await getUserRoles(userId); // ❌ Gọi lại getUserRoles
  // ...
}

// ✅ SAU
async function getUserPermissions(roles: string[]): Promise<string[]> {
  console.log('🔑 Getting permissions for roles:', roles);
  // Truyền roles trực tiếp, không gọi lại getUserRoles
  // ...
}
```

**Cải tiến:**
- ✅ Nhận roles trực tiếp thay vì userId
- ✅ Tránh duplicate function call
- ✅ Performance tốt hơn

### **3. Cập nhật JWT verification:**

```typescript
// ✅ SAU KHI SỬA (Dòng 175-179)
console.log('✅ JWT VALID for user:', payload.userId, 'Role:', payload.role || payload.roles);

// Get roles from JWT payload first, fallback to userId-based detection
const userRoles = await getUserRoles(
  payload.userId as string, 
  payload.role as string | undefined, 
  payload.roles as string[] | undefined
);
const userPermissions = await getUserPermissions(userRoles);
```

**Cải tiến:**
- ✅ Log ra role từ JWT
- ✅ Pass cả 3 parameters: userId, jwtRole, jwtRoles
- ✅ getUserPermissions nhận roles đã resolve

### **4. Sửa Admin Layout:**

**File:** `app/[locale]/admin/layout.tsx`

```typescript
// ✅ TRƯỚC
userInfo={{
  name: user.displayName || user.email,
  email: user.email,
  role: 'admin' // ❌ Hard-coded string
}}

// ✅ SAU
userInfo={{
  name: user.displayName || user.email,
  email: user.email,
  role: user.role || 'admin',
  roles: user.roles || ['admin'], // ✅ Array
  permissions: user.permissions || []
}}
```

**Cải tiến:**
- ✅ Sử dụng role từ user object
- ✅ Pass roles array thay vì string
- ✅ Thêm permissions

---

## 🔍 **KIỂM TRA VÀ DEBUG**

### **1. Kiểm tra JWT payload:**

Bạn cần đảm bảo JWT token có chứa role/roles:

```typescript
// JWT payload nên có:
{
  userId: "67890abcd",
  email: "admin@i-contexchange.vn",
  role: "admin",              // Single role
  roles: ["admin"],           // Or roles array
  iat: 1234567890,
  exp: 1234567890
}
```

**Nếu JWT không có role:**
→ Cần sửa backend để include role khi tạo JWT

### **2. Test middleware:**

Mở browser console và xem logs:

```bash
# Kỳ vọng thấy:
🚪 MIDDLEWARE: /vi/admin
🔐 TOKEN CHECK: { path: '/admin', permission: 'admin.access', hasToken: true }
🔐 VERIFYING JWT...
✅ JWT VALID for user: 67890abcd Role: admin
📋 Using role from JWT: admin
🔑 Getting permissions for roles: ['admin']
✅ ACCESS GRANTED: /vi/admin
```

**Nếu thấy:**
```bash
❌ PERMISSION DENIED: admin.access
```
→ Role không được detect đúng

### **3. Kiểm tra backend API:**

Test API `/api/v1/auth/me`:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3005/api/v1/auth/me
```

**Response nên có:**
```json
{
  "data": {
    "user": {
      "id": "67890abcd",
      "email": "admin@i-contexchange.vn",
      "displayName": "Admin",
      "role": "admin",         // ✅ Cần có
      "roles": ["admin"],      // ✅ Hoặc array
      "permissions": [...]
    }
  }
}
```

---

## 🚀 **CẬP NHẬT BACKEND (NẾU CẦN)**

### **Option 1: Sửa JWT payload khi tạo token:**

**File:** `backend/src/routes/auth.ts` (hoặc tương tự)

```typescript
// ✅ Khi tạo JWT token
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role,           // ✅ Thêm role
    roles: user.roles || [user.role], // ✅ Hoặc roles array
  },
  JWT_SECRET,
  { expiresIn: '1d' }
);
```

### **Option 2: Update /api/v1/auth/me endpoint:**

```typescript
// ✅ Đảm bảo response có roles
app.get('/api/v1/auth/me', authenticate, async (req, res) => {
  const user = await User.findById(req.userId).populate('roles');
  
  res.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,           // ✅ Single role
        roles: user.roles,         // ✅ Array of roles
        permissions: user.permissions
      }
    }
  });
});
```

---

## 📊 **KIỂM TRA SAU KHI SỬA**

### **Checklist:**

- [ ] **1. Restart dev server:**
  ```bash
  npm run dev
  ```

- [ ] **2. Clear browser cache & cookies**

- [ ] **3. Login lại với admin:**
  ```
  Email: admin@i-contexchange.vn
  Password: admin123
  ```

- [ ] **4. Test navigation:**
  - [ ] Click "Dashboard" → Xem dashboard ✅
  - [ ] Click "Quản trị" → Expand menu ✅
  - [ ] Click "Tổng quan" → Mở /admin ✅
  - [ ] Click "Người dùng" → Mở /admin/users ✅
  - [ ] Click "Xét duyệt KYC" → Mở /admin/users/kyc ✅
  - [ ] Click "Duyệt tin đăng" → Mở /admin/listings ✅
  - [ ] Click "Thống kê" → Mở /admin/analytics ✅
  - [ ] Click "Báo cáo" → Mở /admin/reports ✅

- [ ] **5. Test URL trực tiếp:**
  ```
  http://localhost:3000/vi/admin
  http://localhost:3000/vi/admin/users
  http://localhost:3000/vi/admin/analytics
  ```

### **Kỳ vọng:**
- ✅ Tất cả routes hoạt động
- ✅ Không redirect về dashboard
- ✅ Console logs shows correct role
- ✅ Menu navigation works perfectly

---

## ⚠️ **NẾU VẪN KHÔNG HOẠT ĐỘNG**

### **Temporary Fix (Hard-code admin):**

Nếu JWT không có role, tạm thời hard-code trong middleware:

```typescript
// File: middleware.ts
// Dòng 242-245, thêm check email:

async function getUserRoles(userId: string, jwtRole?: string, jwtRoles?: string[]): Promise<string[]> {
  // ... existing code ...
  
  // ✅ TEMPORARY: Check email for admin
  if (payload.email === 'admin@i-contexchange.vn') {
    console.log('📋 Hard-coded admin by email');
    return ['admin'];
  }
  
  // ... rest of code ...
}
```

### **Debug Steps:**

1. **Check middleware logs:**
   ```bash
   # Terminal sẽ show:
   🚪 MIDDLEWARE: /vi/admin
   🔐 TOKEN CHECK: ...
   📋 Using role from JWT: admin
   ```

2. **Check browser console:**
   ```javascript
   // In browser console:
   localStorage.getItem('accessToken')
   
   // Decode JWT: https://jwt.io/
   ```

3. **Check Network tab:**
   - Request to `/vi/admin`
   - Check if redirected to `/vi/dashboard`
   - Check response headers

---

## 📁 **FILES ĐÃ SỬA**

| File | Changes | Status |
|------|---------|--------|
| `middleware.ts` | Fixed getUserRoles & getUserPermissions | ✅ FIXED |
| `app/[locale]/admin/layout.tsx` | Updated userInfo with roles array | ✅ FIXED |

---

## 🎯 **KẾT QUẢ MỌI VỌNG**

### **Trước khi sửa:**
- ❌ Admin menu → Redirect to `/vi/dashboard`
- ❌ All routes → Redirect to `/vi/dashboard`
- ❌ Console shows: `❌ PERMISSION DENIED`

### **Sau khi sửa:**
- ✅ Admin menu → Navigate to correct route
- ✅ All routes → Work as expected
- ✅ Console shows: `✅ ACCESS GRANTED`

---

## 🔄 **NEXT STEPS**

1. ✅ **Test với tất cả roles:**
   - Admin ✅
   - Buyer ✅
   - Seller ✅
   - Depot Staff ✅
   - Depot Manager ✅

2. ✅ **Ensure backend returns role in JWT**

3. ✅ **Update documentation**

4. ✅ **Add integration tests**

---

**© 2025 i-ContExchange Vietnam. All rights reserved.**

---

**🎊 ROUTING ĐÃ ĐƯỢC SỬA VÀ SẴN SÀNG TEST!**

**⚠️ LƯU Ý:** Nếu vẫn không hoạt động, hãy check JWT payload có chứa role không. Nếu không, cần sửa backend để include role khi tạo JWT token.

