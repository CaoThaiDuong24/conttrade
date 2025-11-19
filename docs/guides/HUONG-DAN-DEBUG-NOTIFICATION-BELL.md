# 🔍 HƯỚNG DẪN DEBUG NOTIFICATION BELL

## ❌ VẤN ĐỀ: Bấm vào icon notification vẫn không hiển thị

### 📋 CHECKLIST DEBUG

#### ✅ Backend đã OK:
- [x] Backend chạy: http://localhost:3006
- [x] Notifications table tồn tại
- [x] Test notification đã tạo thành công
- [x] API `/api/v1/notifications` trả về 200 OK
- [x] JSONB cast đã fix

#### ❓ CẦN KIỂM TRA Frontend:

1. **Browser Console Logs**
2. **API Response**  
3. **LocalStorage Token**
4. **Component Rendering**

---

## 🧪 CÁCH TEST - 3 BƯỚC

### BƯỚC 1: Mở Test File HTML

```bash
# Mở file này trong browser:
test-notification-bell.html
```

**Hoặc drag file vào browser Chrome/Edge**

URL sẽ là: `file:///D:/DiskE/SUKIENLTA/LTA PROJECT NEW/Web/test-notification-bell.html`

### BƯỚC 2: Login và Test API

1. **Nhập thông tin:**
   - Email: `seller@example.com`
   - Password: `password123`

2. **Click "Login"**
   - Xem kết quả
   - Kiểm tra token được lưu

3. **Click "Fetch Notifications"**
   - Xem response
   - Kiểm tra data.data có notifications không

### BƯỚC 3: Xem Console

Mở **DevTools** (F12) → Tab **Console**

Tìm logs:
```javascript
Notifications response: { success: true, data: [...] }
```

---

## 🔍 PHÂN TÍCH VẤN ĐỀ

### Trường Hợp 1: API Trả Về Rỗng

```json
{
  "success": true,
  "data": []  // ← RỖNG!
}
```

**Nguyên nhân:** User ID không khớp hoặc chưa có notifications

**Giải pháp:**
```bash
# Tạo notification cho user đang login
cd backend
node test-notification-now.js
```

### Trường Hợp 2: API Lỗi 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Nguyên nhân:** Token không hợp lệ

**Giải pháp:**
1. Logout
2. Login lại
3. Kiểm tra localStorage có `accessToken` không

### Trường Hợp 3: Component Không Render

**Kiểm tra:**

1. **Dropdown có mở không?**
   - Click vào icon 🔔
   - Xem có dropdown xuất hiện không

2. **Console có lỗi không?**
   - React errors
   - TypeScript errors
   - Network errors

3. **Data có đúng format không?**
   ```typescript
   interface Notification {
     id: string;
     type: string;
     title: string;
     message: string;
     data: any;
     read: boolean;
     created_at: string;
   }
   ```

---

## 🐛 DEBUG FRONTEND COMPONENT

### Thêm Debug Logs vào NotificationBell

File: `components/notifications/notification-bell.tsx`

**Thêm logs vào `fetchNotifications()`:**

```typescript
const fetchNotifications = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    
    console.log('🔍 DEBUG: Fetching notifications...'); // ← THÊM
    console.log('🔍 Token exists:', !!token); // ← THÊM
    
    if (!token) {
      console.log('❌ No token found!'); // ← THÊM
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Response status:', response.status); // ← THÊM

    if (response.ok) {
      const data = await response.json();
      console.log('🔍 Notifications response:', data); // ← ĐÃ CÓ
      console.log('🔍 data.success:', data.success); // ← THÊM
      console.log('🔍 data.data:', data.data); // ← THÊM
      console.log('🔍 data.data is Array:', Array.isArray(data.data)); // ← THÊM
      console.log('🔍 data.data.length:', data.data?.length); // ← THÊM
      
      if (data.success && Array.isArray(data.data)) {
        console.log('✅ Setting notifications:', data.data.length, 'items'); // ← THÊM
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
      } else {
        console.log('❌ Invalid data format!'); // ← THÊM
      }
    } else {
      console.log('❌ Response not OK:', response.status, response.statusText); // ← THÊM
    }
  } catch (error) {
    console.error('❌ Error fetching notifications:', error); // ← ĐÃ CÓ
  } finally {
    setLoading(false);
  }
};
```

### Thêm Debug Logs vào Render

```typescript
return (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => {
          console.log('🔍 Bell clicked!'); // ← THÊM
          console.log('🔍 Current notifications:', notifications.length); // ← THÊM
          console.log('🔍 Unread count:', unreadCount); // ← THÊM
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      {/* ... rest of component ... */}
    </DropdownMenuContent>
  </DropdownMenu>
);
```

---

## 📊 KIỂM TRA THỰC TẾ

### 1. Xem Backend Logs

Terminal backend hiển thị:
```
prisma:query 
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2

{"level":30,"time":...,"res":{"statusCode":200},"msg":"request completed"}
```

**✅ Backend OK** - API hoạt động

### 2. Xem Frontend Logs  

Browser console hiển thị:
```javascript
🔍 DEBUG: Fetching notifications...
🔍 Token exists: true
🔍 Response status: 200
🔍 Notifications response: { success: true, data: [...] }
🔍 data.success: true
🔍 data.data: Array(1)
🔍 data.data is Array: true
🔍 data.data.length: 1
✅ Setting notifications: 1 items
```

**✅ Frontend OK** - Nhận data thành công

### 3. Xem UI

**NẾU THẤY:**
- Badge đỏ hiển thị số `1`
- Click vào bell → dropdown mở
- Notification hiển thị với title và message

**→ ✅ THÀNH CÔNG!**

**NẾU KHÔNG THẤY:**
- Không có badge
- Dropdown rỗng: "Không có thông báo nào"

**→ ❌ VẪN LỖI - Tiếp tục debug!**

---

## 🎯 GIẢI PHÁP THEO TRƯỜNG HỢP

### A. Data Rỗng (`data.data = []`)

**Nguyên nhân:** Không có notifications cho user

**Fix:**
```bash
cd backend
node test-notification-now.js
```

Sau đó refresh frontend:
```javascript
// Click "Làm mới thông báo" trong dropdown
// Hoặc F5 refresh page
```

### B. Token Lỗi (401)

**Nguyên nhân:** Token expired hoặc invalid

**Fix:**
1. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Login lại
3. Check notifications

### C. Component Không Mount

**Nguyên nhân:** NotificationBell không được render

**Fix:**

Kiểm tra `components/layout/dashboard-header.tsx`:
```typescript
// Phải có dòng này:
<NotificationBell />
```

Kiểm tra `isAuthenticated`:
```typescript
{isAuthenticated && <NotificationBell />}
```

### D. DropdownMenu Không Mở

**Nguyên nhân:** CSS hoặc z-index issue

**Fix:**

Check `DropdownMenuContent` có `align="end"` không:
```typescript
<DropdownMenuContent align="end" className="w-80">
```

---

## ✅ CHECKLIST CUỐI CÙNG

Trước khi báo lỗi, kiểm tra:

- [ ] Backend running: `http://localhost:3006`
- [ ] Frontend running: `http://localhost:3000`
- [ ] Login thành công (có token trong localStorage)
- [ ] Test notification tồn tại trong database
- [ ] API `/api/v1/notifications` trả về 200
- [ ] Browser console không có lỗi
- [ ] Component NotificationBell được render
- [ ] Dropdown có mở khi click vào bell

---

## 🚀 QUICK TEST

1. **Mở:** `test-notification-bell.html` trong browser
2. **Login:** seller@example.com / password123
3. **Click:** "Fetch Notifications"
4. **Xem:** Console logs và response data
5. **Mở:** http://localhost:3000
6. **Login:** seller@example.com
7. **Click:** Icon 🔔 trên header
8. **Kiểm tra:** Dropdown có hiển thị không?

---

**Nếu vẫn không được, gửi screenshot:**
1. Browser console logs
2. Network tab (API response)
3. UI khi click notification bell

**Người hỗ trợ:** GitHub Copilot  
**Ngày:** 20/10/2025
