# 🐛 Debug: Lỗi 404 Khi Truy Cập Trang Chi Tiết Vận Chuyển

## ❌ Vấn Đề Phát Hiện

URL trong trình duyệt: `localhost:3001/vi/vi/delivery/track/48c03ab2-8695-4195-8ae1-2a618024fbcc`

### Lỗi 1: **Duplicate Locale `/vi/vi/`**
- URL có 2 lần locale `/vi/vi/` thay vì 1 lần `/vi/`
- Nguyên nhân: Router next-intl tự động thêm locale

### Lỗi 2: **Port không đúng**
- Trình duyệt đang mở port 3001 cũ
- Frontend hiện tại đang chạy ở port 3002 (vì 3000, 3001 đã bị chiếm)

## ✅ Giải Pháp

### Bước 1: Kill tất cả process Node.js cũ
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Bước 2: Khởi động lại backend
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
npm run dev
```

### Bước 3: Khởi động lại frontend
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"
npm run dev
```

### Bước 4: Truy cập đúng URL
Mở trình duyệt với URL đúng:
- `http://localhost:3000` (nếu frontend chạy ở port 3000)
- hoặc check terminal để xem port đang chạy

## 🔍 Chi Tiết Vấn Đề

### File đã fix: `app/[locale]/orders/[id]/page.tsx`

**Trước khi sửa (sai):**
```tsx
onClick={() => router.push(`/delivery/track/${orderId}`)}  // ❌ Dùng sai orderId
```

**Sau khi sửa (đúng):**
```tsx
onClick={() => router.push(`/delivery/track/${order.deliveries?.[0]?.id}`)}  // ✅ Dùng deliveryId
```

### Router Next-intl hoạt động như thế nào?

Router từ `@/i18n/routing` tự động:
1. Lấy locale hiện tại từ URL (`vi` hoặc `en`)
2. Thêm locale vào path khi navigate
3. VD: `router.push('/delivery/track/xxx')` → `/vi/delivery/track/xxx`

### Tại sao có `/vi/vi/`?

Có thể do:
1. Trình duyệt cache URL cũ
2. Redirect loop trong middleware
3. Frontend đang chạy ở instance cũ (port 3001)

## 📝 Kiểm Tra Lại

### 1. Check ports đang chạy:
```powershell
netstat -ano | findstr ":3000 :3001 :3006"
```

### 2. Check frontend đang chạy:
- Xem terminal output
- Tìm dòng: `- Local: http://localhost:XXXX`

### 3. Test API backend:
```powershell
curl http://localhost:3006/api/v1/deliveries
```

### 4. Test delivery tracking API:
```powershell
# Thay YOUR_TOKEN và DELIVERY_ID bằng giá trị thực
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3006/api/v1/deliveries/DELIVERY_ID/track
```

## 🎯 Test Case

1. **Login** với tài khoản buyer
2. **Navigate** đến trang Orders: `/vi/orders`
3. **Click** vào order có status `IN_TRANSIT`
4. **Click** button "🚚 Theo dõi vận chuyển (Bước 6.3)"
5. **Verify** URL là: `/vi/delivery/track/{deliveryId}` (không có duplicate `/vi/vi/`)
6. **Verify** trang load thành công, hiển thị tracking info

## 🔧 Debug Commands

```powershell
# 1. Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clear Next.js cache
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Start backend
cd backend
npm run dev

# 4. Start frontend (in new terminal)
cd ..
npm run dev

# 5. Check what's running
netstat -ano | findstr ":3000 :3001 :3006"
```

## ✅ Kết Quả Mong Đợi

- ✅ Backend chạy ở: `http://localhost:3006`
- ✅ Frontend chạy ở: `http://localhost:3000`
- ✅ URL tracking: `http://localhost:3000/vi/delivery/track/{deliveryId}`
- ✅ Trang load thành công, không có 404
- ✅ Hiển thị thông tin tracking từ API

## 📞 Backend API Đã Fix

- ✅ Tạo `package.json` cho backend với `"type": "module"`
- ✅ Cài đặt dependencies: `node-cron`, `uuid`
- ✅ Generate Prisma client
- ✅ Backend đang chạy thành công ở port 3006

## 🎉 Status

- ✅ Backend: Running
- ⚠️ Frontend: Cần khởi động lại ở port đúng
- ✅ Code: Đã fix sử dụng deliveryId thay vì orderId
- ⚠️ Browser: Cần clear cache và mở lại với port đúng
