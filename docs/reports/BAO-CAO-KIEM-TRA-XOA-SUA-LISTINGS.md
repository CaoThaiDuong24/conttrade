# Báo cáo Kiểm tra Chức năng Xóa/Sửa Listings

**Ngày:** 20/10/2025  
**Người thực hiện:** GitHub Copilot  
**Yêu cầu:** Kiểm tra tất cả các trang có tin listings và xem chức năng xóa, sửa đã hoạt động đúng chưa

---

## 1. TÓM TẮT

Hệ thống có **3 trang chính** quản lý listings:
1. ✅ **Admin Listings** (`/admin/listings`) - Có chức năng duyệt/từ chối, KHÔNG có xóa/sửa (đúng theo quyền hạn)
2. ⚠️ **Seller Listings** (`/seller/listings`) - Có đầy đủ chức năng xóa/sửa NHƯNG CÒN LỖI
3. ⚠️ **My Listings** (`/sell/my-listings`) - Có nút xóa/sửa NHƯNG CHƯA HOẠT ĐỘNG (duplicate page)

---

## 2. CHI TIẾT TỪNG TRANG

### 2.1. Admin Listings (`/app/[locale]/admin/listings/page.tsx`)

**Trạng thái:** ✅ HOẠT ĐỘNG ĐÚNG

**Chức năng có:**
- ✅ Xem chi tiết listings
- ✅ Duyệt tin đăng (Approve) → ACTIVE
- ✅ Từ chối tin đăng (Reject) với lý do
- ✅ Backend API đã được implement đầy đủ

**Chức năng KHÔNG có:**
- ❌ Không có xóa listings (đúng - admin chỉ duyệt/từ chối)
- ❌ Không có sửa listings (đúng - admin không sửa nội dung)

**Backend API:**
```typescript
// ✅ /api/v1/admin/listings - GET all listings
// ✅ /api/v1/admin/listings/:id - GET detail
// ✅ /api/v1/admin/listings/:id/status - PUT (approve/reject)
```

**Đánh giá:** ⭐⭐⭐⭐⭐ Hoạt động hoàn hảo, phù hợp với quyền hạn admin

---

### 2.2. Seller Listings (`/app/[locale]/seller/listings/page.tsx`)

**Trạng thái:** ⚠️ CÓ LỖI CẦN SỬA

**Chức năng có:**
- ✅ Xem danh sách listings của seller
- ✅ Tab filters (all, draft, pending, active, sold, rejected)
- ✅ Search và pagination
- ⚠️ **XÓA LISTINGS** - Backend OK, Frontend OK, NHƯNG CẦN TEST
- ⚠️ **SỬA LISTINGS** - Có nút Edit NHƯNG ROUTE CHƯA TỒN TẠI
- ✅ Pause/Resume listings (toggle ACTIVE ↔ PAUSED)

**LỖI NGHIÊM TRỌNG:**

#### Lỗi 1: Route Edit không tồn tại
```tsx
// File: /app/[locale]/seller/listings/page.tsx:499
<DropdownMenuItem onClick={() => router.push(`/seller/listings/${listing.id}/edit`)}>
  <Edit className="h-4 w-4 mr-2" />
  Chỉnh sửa
</DropdownMenuItem>
```
❌ **Route `/seller/listings/[id]/edit` CHƯA TỒN TẠI!**

#### Lỗi 2: API endpoint sai cho toggle status
```tsx
// Line 221-233: handleToggleStatus
const response = await fetch(`${API_URL}/api/v1/listings/${id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ status: newStatus }),
});
```
❌ **Nên dùng `/api/v1/listings/${id}/status` (chuyên dụng cho update status)**

#### Lỗi 3: Backend DELETE có lỗi authentication
```typescript
// Backend: /backend/src/routes/listings.ts:568-614
fastify.delete('/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send({ success: false, message: 'Token không hợp lệ' }); // ❌ THIẾU return!
    }
  }
```
❌ **THIẾU `return` khi authentication fail → code vẫn chạy tiếp!**

**Backend API:**
```typescript
// ✅ /api/v1/listings/my - GET own listings
// ⚠️ /api/v1/listings/:id - DELETE (có lỗi auth)
// ⚠️ /api/v1/listings/:id - PUT (general update)
// ✅ /api/v1/listings/:id/status - PUT (status update)
```

---

### 2.3. My Listings (`/app/[locale]/sell/my-listings/page.tsx`)

**Trạng thái:** ❌ DUPLICATE & CHƯA HOẠT ĐỘNG

**Vấn đề:**
1. ❌ Trang này là **DUPLICATE** của Seller Listings
2. ❌ Có nút Xóa/Sửa/Tạm dừng NHƯNG **KHÔNG CÓ HANDLER**
3. ❌ Tất cả các nút chỉ là UI, không làm gì cả

```tsx
// Line 332-349: Các nút chỉ có UI, không có onClick handler
<Button size="sm" variant="outline">
  <Edit className="mr-2 h-4 w-4" />
  Sửa
</Button>
<Button size="sm" variant="outline">
  <Archive className="mr-2 h-4 w-4" />
  {listing.status === 'paused' ? 'Kích hoạt' : 'Tạm dừng'}
</Button>
<Button size="sm" variant="destructive">
  <Trash2 className="mr-2 h-4 w-4" />
  Xóa
</Button>
```

**Đánh giá:** ❌ NÊN XÓA TRANG NÀY hoặc redirect sang `/seller/listings`

---

## 3. BACKEND API STATUS

### 3.1. API Routes Đã Implement

| Endpoint | Method | Chức năng | Status |
|----------|--------|-----------|--------|
| `/api/v1/listings` | POST | Tạo listing mới | ✅ OK |
| `/api/v1/listings` | GET | Lấy danh sách (public) | ✅ OK |
| `/api/v1/listings/my` | GET | Lấy listings của user | ✅ OK |
| `/api/v1/listings/:id` | GET | Xem chi tiết | ✅ OK |
| `/api/v1/listings/:id` | PUT | Cập nhật listing | ✅ OK |
| `/api/v1/listings/:id` | DELETE | Xóa listing | ⚠️ LỖI AUTH |
| `/api/v1/listings/:id/status` | PUT | Cập nhật status | ✅ OK |
| `/api/v1/listings/:id/media` | POST | Thêm ảnh | ✅ OK |
| `/api/v1/listings/:id/media/:mediaId` | DELETE | Xóa ảnh | ✅ OK |
| `/api/v1/admin/listings` | GET | Admin lấy tất cả | ✅ OK |
| `/api/v1/admin/listings/:id/status` | PUT | Admin duyệt/từ chối | ✅ OK |

### 3.2. Quyền hạn (Authorization)

| Chức năng | Seller | Admin | Public |
|-----------|--------|-------|--------|
| Xem listings ACTIVE | ✅ | ✅ | ✅ |
| Xem listings khác | ✅ (của mình) | ✅ (tất cả) | ❌ |
| Tạo listing | ✅ | ❌ | ❌ |
| Sửa listing | ✅ (của mình) | ❌ | ❌ |
| Xóa listing | ✅ (của mình) | ❌ | ❌ |
| Duyệt/từ chối | ❌ | ✅ | ❌ |

---

## 4. CÁC LỖI CẦN SỬA NGAY

### 🔴 Lỗi Nghiêm Trọng (Critical)

#### 1. Backend DELETE thiếu return trong error handler
```typescript
// File: backend/src/routes/listings.ts:568-574
fastify.delete('/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send({ success: false, message: 'Token không hợp lệ' }); // ❌ THIẾU return
    }
  }
```
**Sửa:**
```typescript
fastify.delete('/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.send({ success: false, message: 'Token không hợp lệ' }); // ✅ THÊM return
    }
  }
```

#### 2. Backend PUT /:id/status cũng thiếu return
```typescript
// File: backend/src/routes/listings.ts:619-625
fastify.put('/:id/status', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send({ success: false, message: 'Token không hợp lệ' }); // ❌ THIẾU return
    }
  }
```
**Sửa:** Thêm `return` tương tự

#### 3. Tạo route Edit listings
**Cần tạo file:** `/app/[locale]/seller/listings/[id]/edit/page.tsx`

Hoặc sửa để redirect về trang create với pre-filled data:
```tsx
<DropdownMenuItem onClick={() => router.push(`/sell/new?edit=${listing.id}`)}>
  <Edit className="h-4 w-4 mr-2" />
  Chỉnh sửa
</DropdownMenuItem>
```

### 🟡 Lỗi Trung Bình (Medium)

#### 4. Seller Listings: Sử dụng sai API endpoint cho toggle status
```tsx
// Hiện tại (SAI):
const response = await fetch(`${API_URL}/api/v1/listings/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ status: newStatus }),
});

// Nên đổi thành:
const response = await fetch(`${API_URL}/api/v1/listings/${id}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status: newStatus }),
});
```

#### 5. My Listings page là duplicate và không hoạt động
**Giải pháp:**
- **Option 1:** Xóa file `/app/[locale]/sell/my-listings/page.tsx`
- **Option 2:** Redirect sang `/seller/listings`
```tsx
// /app/[locale]/sell/my-listings/page.tsx
export default function MyListingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/seller/listings');
  }, []);
  return null;
}
```

### 🟢 Cải tiến (Improvement)

#### 6. Thêm confirmation dialog cho xóa ở My Listings
Nếu giữ lại trang này, cần thêm handler và dialog tương tự Seller Listings

#### 7. Thêm loading state cho các action buttons
Tránh user click nhiều lần khi đang xử lý

---

## 5. CHECKLIST KIỂM TRA THỦ CÔNG

### Backend (cần test với Postman/curl)
- [ ] DELETE `/api/v1/listings/:id` với token hợp lệ → 200 OK
- [ ] DELETE `/api/v1/listings/:id` với token không hợp lệ → 401 Unauthorized
- [ ] DELETE `/api/v1/listings/:id` với listing của user khác → 403 Forbidden
- [ ] PUT `/api/v1/listings/:id/status` với token hợp lệ → 200 OK
- [ ] PUT `/api/v1/listings/:id` với data hợp lệ → 200 OK

### Frontend
- [ ] Admin Listings: Duyệt tin → Status chuyển sang ACTIVE
- [ ] Admin Listings: Từ chối tin → Status chuyển sang REJECTED, có lý do
- [ ] Seller Listings: Click Xóa → Hiện dialog → Xác nhận → Tin bị xóa
- [ ] Seller Listings: Click Sửa → Chuyển đến form edit (sau khi fix route)
- [ ] Seller Listings: Click Pause → Status chuyển PAUSED
- [ ] Seller Listings: Click Resume → Status chuyển ACTIVE

---

## 6. KẾ HOẠCH SỬA CHỮA

### Giai đoạn 1: Sửa lỗi nghiêm trọng (30 phút)
1. ✅ Thêm `return` vào error handler của DELETE và PUT status
2. ✅ Tạo route edit hoặc redirect về create form
3. ✅ Sửa API endpoint toggle status

### Giai đoạn 2: Xử lý duplicate page (15 phút)
4. ✅ Xóa hoặc redirect My Listings page

### Giai đoạn 3: Testing (30 phút)
5. ✅ Test backend API với Postman
6. ✅ Test frontend trên browser
7. ✅ Test edge cases (403, 404, 500 errors)

### Giai đoạn 4: Polish (15 phút)
8. ✅ Thêm loading states
9. ✅ Thêm error handling tốt hơn
10. ✅ Cập nhật documentation

---

## 7. KẾT LUẬN

**Đánh giá tổng thể:** ⭐⭐⭐ (3/5 sao)

**Ưu điểm:**
- ✅ Backend API đã được implement đầy đủ chức năng
- ✅ Admin page hoạt động tốt, đúng quyền hạn
- ✅ Seller page có UI đẹp, UX tốt

**Nhược điểm:**
- ❌ Backend có lỗi authentication (thiếu return)
- ❌ Frontend thiếu route edit
- ❌ Có trang duplicate không hoạt động
- ❌ API endpoint không consistent (mix giữa PUT /:id và PUT /:id/status)

**Khuyến nghị:**
1. **SỬA NGAY** các lỗi backend authentication
2. **TẠO ROUTE EDIT** hoặc tái sử dụng form create
3. **XÓA** trang My Listings duplicate
4. **TEST KỸ** trước khi deploy production

---

**Người kiểm tra:** GitHub Copilot  
**Thời gian:** 20/10/2025  
**Status:** ⚠️ CẦN SỬA CHỮA TRƯỚC KHI SỬ DỤNG
