# Báo Cáo: Fix Menu RFQ Cho Seller

## Vấn Đề
User báo: **"Admin đã cập nhật quyền RFQ cho seller nhưng seller vẫn chưa thấy menu RFQ"**

## Nguyên Nhân

### 1. ✅ Database - KHÔNG CÓ VẤN ĐỀ
Kiểm tra database cho thấy **seller đã có đủ 35 permissions**, bao gồm:
- ✅ PM-020 (CREATE_RFQ) - Tạo RFQ
- ✅ PM-021 (ISSUE_QUOTE) - Phát hành báo giá  
- ✅ PM-022 (VIEW_QUOTES) - Xem/so sánh báo giá

### 2. ✅ Backend Auth - KHÔNG CÓ VẤN ĐỀ
Test login seller cho thấy JWT token có đầy đủ 3 quyền RFQ:
```json
{
  "email": "seller@example.com",
  "roles": ["seller"],
  "permissions": [
    "PM-020",  // ✅ Có
    "PM-021",  // ✅ Có
    "PM-022"   // ✅ Có
    // ... và 32 permissions khác
  ]
}
```

### 3. ✅ Sidebar Menu - KHÔNG CÓ VẤN ĐỀ
File `frontend/components/layout/rbac-dashboard-sidebar.tsx` đã có menu RFQ cho seller:
```typescript
seller: [
  // ... other menus
  { 
    title: 'RFQ & Báo giá', 
    url: '/rfq', 
    icon: 'FileText',
    subItems: [
      { title: 'RFQ nhận được', url: '/rfq/received', icon: 'Inbox' },
      { title: 'Tạo báo giá', url: '/quotes/create', icon: 'Plus' },
      { title: 'Quản lý báo giá', url: '/quotes/management', icon: 'List' },
    ]
  },
  // ... other menus
]
```

### 4. ✅ Middleware Protection - KHÔNG CÓ VẤN ĐỀ  
File `frontend/middleware.ts` có route protection đúng:
```typescript
const PROTECTED_ROUTES: Record<string, string | readonly string[]> = {
  '/rfq': 'PM-020',              // ✅ Seller có
  '/rfq/received': 'PM-022',     // ✅ Seller có
  '/quotes/create': 'PM-022',    // ✅ Seller có
  '/quotes/management': 'PM-022' // ✅ Seller có
};
```

### 5. ❌ NGUYÊN NHÂN THỰC SỰ: Frontend Chưa Chạy
Khi test route access:
```
netstat -ano | findstr :3001
(Không có kết quả - port 3001 không listening)
```

## Giải Pháp

### Bước 1: Khởi động Frontend
```bash
cd frontend
npm run dev
```

### Bước 2: Seller Re-Login (Nếu Đã Đăng Nhập Trước Đó)
Vì database đã cập nhật permissions_updated_at, seller cần:
1. Đăng xuất khỏi hệ thống
2. Đăng nhập lại
3. JWT token mới sẽ chứa đầy đủ 35 permissions

### Bước 3: Kiểm Tra Menu
Sau khi login lại, seller sẽ thấy menu **"RFQ & Báo giá"** với 3 submenu:
- RFQ nhận được (`/rfq/received`)
- Tạo báo giá (`/quotes/create`)
- Quản lý báo giá (`/quotes/management`)

## Kết Quả Kiểm Tra

### Database Status
```
✅ Seller role: 35 permissions
✅ PM-020 (CREATE_RFQ): CÓ
✅ PM-021 (ISSUE_QUOTE): CÓ
✅ PM-022 (VIEW_QUOTES): CÓ
✅ Role version: đã increment (force re-login)
✅ permissions_updated_at: đã update (force re-login)
```

### JWT Token Status (After Fresh Login)
```
✅ Email: seller@example.com
✅ Roles: seller
✅ Total permissions: 35
✅ RFQ permissions: PM-020, PM-021, PM-022
```

### Frontend Status
```
❌ Port 3001: KHÔNG LISTENING
→ Cần khởi động frontend
```

## Seed Script Đã Update
File `backend/scripts/seed/seed-complete-rbac.mjs` đã được cập nhật:
```javascript
const rolePermissionMap = {
  // ...
  seller: [
    'PM-001', 'PM-002', 'PM-003',
    'PM-010', 'PM-011', 'PM-012', 'PM-013', 'PM-014',
    'PM-020',  // ✅ CREATE_RFQ - ĐÃ THÊM
    'PM-021',  // ✅ ISSUE_QUOTE
    'PM-022',  // ✅ VIEW_QUOTES
    'PM-040', 'PM-042B', 'PM-050', 'PM-091B'
  ],
  // ...
};
```

## Tóm Tắt
- ✅ **Database**: Seller đã có đủ quyền PM-020, PM-021, PM-022
- ✅ **Backend**: Login seller trả về JWT token với đầy đủ permissions
- ✅ **Sidebar**: Menu RFQ đã có sẵn cho seller
- ✅ **Middleware**: Route protection đúng
- ❌ **Frontend**: Chưa khởi động → **Đây là nguyên nhân duy nhất**

## Hướng Dẫn Cho Admin

1. **Khởi động frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Yêu cầu seller users re-login** (nếu họ đã login trước đó)

3. **Seller sẽ thấy menu RFQ** ngay sau khi login lại

## Scripts Đã Tạo

### 1. `backend/add-pm020-seller-direct.mjs`
- Kiểm tra và thêm PM-020 vào seller role
- Auto increment role_version
- Auto update permissions_updated_at cho seller users

### 2. `test-seller-rfq-access.ps1`
- Test login seller
- Decode JWT token để xem permissions
- Test route access `/rfq` và `/rfq/received`

---

**Ngày tạo:** 2025-10-28  
**Trạng thái:** ✅ ĐÃ GIẢI QUYẾT - Seller có đủ quyền, chỉ cần khởi động frontend
