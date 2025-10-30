# 🚨 HƯỚNG DẪN FIX ADMIN KHÔNG VÀO ĐƯỢC RBAC

## Vấn Đề

Bạn đang dùng admin account nhưng bị yêu cầu đăng nhập lại khi truy cập trang cập nhật quyền.

**Nguyên nhân:**
- Token cũ đã hết hạn (JWT expires sau 7 ngày)
- Hoặc token được tạo trước khi chúng ta fix `permissions_updated_at` logic

## ✅ Giải Pháp Nhanh (3 Cách)

### Cách 1: Đăng Nhập Lại Trên Website ⭐ (KHUYẾN NGHỊ)

1. **Logout** (nếu có nút logout) hoặc xóa cookie:
   ```javascript
   // Mở DevTools Console (F12) và chạy:
   document.cookie = "accessToken=; path=/; max-age=0";
   location.reload();
   ```

2. **Mở trang login:**
   ```
   http://localhost:3000/vi/login
   ```

3. **Đăng nhập:**
   - Email: `admin@i-contexchange.vn`
   - Password: [password admin đã biết]

4. **Token mới tự động lưu vào cookie** ✅

---

### Cách 2: Refresh Token Qua API

Nếu bạn vẫn có token cũ (chưa hết hạn hoàn toàn), thử endpoint refresh:

```bash
# PowerShell
$token = "YOUR_OLD_TOKEN_HERE"
$response = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/refresh-permissions' -Method POST -Headers @{ 'Authorization' = "Bearer $token" } -UseBasicParsing
$newData = $response.Content | ConvertFrom-Json
$newToken = $newData.token

# Copy token mới
Write-Host $newToken
```

Sau đó paste token mới vào cookie (xem Cách 3).

---

### Cách 3: Manual Token Update (DevTools)

Nếu bạn có token mới từ script `generate-admin-token.mjs`:

1. **Mở DevTools** (F12)

2. **Vào tab Application** > **Cookies** > **localhost:3000**

3. **Tìm cookie `accessToken`**

4. **Double-click vào Value** và paste token mới

5. **Refresh trang** (F5)

---

## 🔧 Tự Động Generate Token Mới

Chạy script này để lấy token mới:

```bash
cd "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
node generate-admin-token.mjs
```

Script sẽ:
- ✅ Thử login với các passwords phổ biến
- ✅ In ra token mới nếu thành công
- ✅ Cho hướng dẫn cách sử dụng

---

## 🔍 Debug: Kiểm Tra Token Hiện Tại

Nếu muốn xem token hiện tại có vấn đề gì:

```javascript
// Chạy trong DevTools Console
const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token info:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Issued:', new Date(payload.iat * 1000));
  console.log('Permissions:', payload.permissions?.length);
} else {
  console.log('No token found');
}
```

---

## ⚠️ Lưu Ý Quan Trọng

### Sau Khi Fix Code

Khi chúng ta fix `permissions_updated_at` logic, **TẤT CẢ TOKENS CŨ** (issued trước khi fix) có thể bị invalidate.

**Giải pháp:** Đăng nhập lại để lấy token mới.

### Token Expiry

- **Access Token:** Expires sau 7 ngày
- **Refresh Token:** Expires sau 30 ngày

Nếu cả 2 đều hết hạn → Phải đăng nhập lại.

---

## 📝 Checklist

- [ ] Đã logout (xóa cookie)
- [ ] Mở trang login: http://localhost:3000/vi/login
- [ ] Đăng nhập với `admin@i-contexchange.vn`
- [ ] Token mới được lưu tự động
- [ ] Có thể vào trang RBAC: http://localhost:3000/vi/admin/rbac/matrix

---

## 🆘 Nếu Vẫn Không Được

1. **Clear all cookies:**
   ```javascript
   document.cookie.split(";").forEach(c => {
     document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
   });
   location.reload();
   ```

2. **Hard refresh:** Ctrl + Shift + R

3. **Check backend logs** để xem lỗi gì khi access RBAC endpoints

4. **Chạy script check:**
   ```bash
   cd backend
   node check-admin-status.mjs
   ```

---

**Tóm lại: CHỈ CẦN ĐĂNG NHẬP LẠI LÀ XONG! 🎉**
