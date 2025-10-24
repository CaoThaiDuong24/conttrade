# 🔧 CHẠY THỦ CÔNG - TỪNG BƯỚC

## ❗ NẾU SCRIPT BỊ LỖI, CHẠY TỪNG LỆNH NÀY

### Bước 1: Dọn dẹp
```powershell
# Kill node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Chờ 2 giây
Start-Sleep -Seconds 2
```

### Bước 2: Vào thư mục backend
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
```

### Bước 3: Xóa cache
```powershell
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
```

### Bước 4: Format schema
```powershell
npx prisma format
```

**Kết quả mong đợi:**
```
Formatted prisma\schema.prisma in XXms 🚀
```

---

### Bước 5: Generate Prisma Client
```powershell
npx prisma generate
```

**Kết quả mong đợi:**
```
✔ Generated Prisma Client
```

**⚠️ NẾU LỖI "EPERM":**
1. Đóng tất cả terminals
2. Thoát VSCode (File > Exit)
3. Mở lại VSCode
4. Chạy lại lệnh

---

### Bước 6: Push schema lên database
```powershell
npx prisma db push
```

**Kết quả mong đợi:**
```
🚀  Your database is now in sync with your Prisma schema.
```

---

### Bước 7: Seed database
```powershell
npx tsx prisma/seed-rbac-complete.ts
```

**Kết quả mong đợi:**
```
🌱 Starting complete RBAC seed data...
📋 Creating 53 permissions...
✅ Created 53 permissions
👥 Creating 12 roles with permissions...
✅ Created 12 roles
🏢 Creating organizations...
✅ Created 3 organizations
👤 Creating demo users...
✅ Created 8 demo users

═══════════════════════════════════════════════════════
✅ RBAC SEED DATA COMPLETED SUCCESSFULLY!
═══════════════════════════════════════════════════════
📋 Permissions: 73 (PM-001 to PM-125)
👥 Roles: 12
🏢 Organizations: 3
👤 Demo Users: 8
```

---

### Bước 8: Verify bằng Prisma Studio
```powershell
npx prisma studio
```

Kiểm tra trong browser:
- ✅ permissions: 73 records
- ✅ roles: 12 records  
- ✅ users: 8 records
- ✅ organizations: 3 records
- ✅ role_permissions: có data
- ✅ user_roles: có data

---

### Bước 9: Start Backend
```powershell
npm run dev
```

**Kết quả:**
```
Server running on http://localhost:3005
```

---

### Bước 10: Start Frontend (Terminal mới)
```powershell
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"
npm run dev
```

**Kết quả:**
```
ready - started server on 0.0.0.0:3000
```

---

### Bước 11: Test Login
Truy cập: http://localhost:3000/vi/auth/login

**Test với:**
- Email: `admin@i-contexchange.vn`
- Password: `123456`

---

## ✅ HOÀN TẤT!

Nếu tất cả các bước trên thành công:
- ✅ Database đã có đầy đủ RBAC data
- ✅ 53 Permissions đã được tạo
- ✅ 12 Roles đã được tạo
- ✅ 8 Demo users đã sẵn sàng
- ✅ Hệ thống đã sẵn sàng để test!

---

## 📝 COPY/PASTE - ALL COMMANDS

```powershell
# === RUN ALL AT ONCE ===
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
npx prisma format
npx prisma generate
npx prisma db push
npx tsx prisma/seed-rbac-complete.ts
npm run dev
```

Copy toàn bộ block trên và paste vào PowerShell!
