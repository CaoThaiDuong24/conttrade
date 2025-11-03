# 🚀 HƯỚNG DẪN DEPLOY TOÀN BỘ BACKEND VÀ SỬA LỖI MÀN HÌNH

> **Giải quyết vấn đề: Một số màn hình hiển thị, một số màn hình không hiển thị dữ liệu**

---

## 🎯 VẤN ĐỀ

Hiện tại có một số màn hình **không hiển thị dữ liệu** do:

1. ❌ Backend routes chưa được build hoặc deploy đầy đủ
2. ❌ Database thiếu dữ liệu hoặc migrations chưa chạy
3. ❌ Permissions của user chưa đúng
4. ❌ Frontend gọi sai API URL hoặc có lỗi
5. ❌ Backend crash hoặc không start đầy đủ routes

---

## ✅ GIẢI PHÁP - 3 SCRIPTS ĐÃ CHUẨN BỊ

### 🔥 Script 1: One-Click Deploy (Khuyến nghị)

Deploy toàn bộ với menu tương tác:

```bash
cd /home/lta/pj/conttrade
bash scripts/deployment/one-click-deploy.sh
```

**Menu sẽ hiện:**
```
1) 🔥 Full Deploy     - Deploy toàn bộ backend + frontend
2) 🔧 Backend Only    - Deploy và fix backend
3) 🎨 Frontend Only   - Deploy frontend
4) 🩹 Fix Issues      - Sửa lỗi màn hình không hiển thị
5) 🔍 Check Routes    - Kiểm tra tất cả routes
6) 📊 Full Diagnosis  - Chẩn đoán toàn diện
```

**Chọn option phù hợp với tình huống của bạn.**

---

### 🔧 Script 2: Full Backend Deploy

Deploy toàn bộ backend, đảm bảo TẤT CẢ routes được build:

```bash
cd /home/lta/pj/conttrade
bash scripts/deployment/full-backend-deploy.sh
```

**Script này sẽ:**
- ✅ Liệt kê tất cả route files trong source
- ✅ Xóa build cũ và node_modules
- ✅ Cài đặt dependencies mới
- ✅ Generate Prisma Client
- ✅ Build TypeScript → JavaScript
- ✅ Kiểm tra tất cả routes đã build
- ✅ Stop và start lại PM2
- ✅ Test tất cả API endpoints

**Thời gian:** ~5-10 phút

---

### 🩹 Script 3: Fix Display Issues

Chuyên sửa lỗi màn hình không hiển thị:

```bash
cd /home/lta/pj/conttrade
bash scripts/deployment/fix-display-issues.sh
```

**Script này sẽ:**
- ✅ Kiểm tra backend đang chạy
- ✅ Kiểm tra database connection
- ✅ Run migrations
- ✅ Kiểm tra dữ liệu trong database
- ✅ Kiểm tra permissions của users
- ✅ Test API responses
- ✅ Option để seed dữ liệu mẫu
- ✅ Rebuild và restart backend
- ✅ Kiểm tra frontend configuration
- ✅ Test end-to-end

**Thời gian:** ~3-5 phút

---

### 🔍 Script 4: Check All Routes

Kiểm tra chi tiết tất cả routes:

```bash
cd /home/lta/pj/conttrade
bash scripts/deployment/check-all-routes.sh
```

**Script này sẽ:**
- ✅ Liệt kê routes trong source code
- ✅ Liệt kê routes đã build
- ✅ Liệt kê routes đã register
- ✅ Test tất cả API endpoints
- ✅ Cho điểm tình trạng tổng quan (%)
- ✅ Khuyến nghị hành động

**Thời gian:** ~1-2 phút

---

## 📋 HƯỚNG DẪN SỬ DỤNG

### 🎯 Tình huống 1: Triển khai mới hoàn toàn

```bash
# Bước 1: One-Click Deploy với option 1 (Full Deploy)
bash scripts/deployment/one-click-deploy.sh
# Chọn: 1

# Bước 2: Kiểm tra kết quả
pm2 list
pm2 logs

# Bước 3: Truy cập
# Frontend: http://localhost:3000
# Backend: http://localhost:3006
```

---

### 🎯 Tình huống 2: Có màn hình không hiển thị dữ liệu

```bash
# Bước 1: Chạy Fix Issues
bash scripts/deployment/one-click-deploy.sh
# Chọn: 4

# Bước 2: Nếu vẫn chưa fix được, deploy lại backend
bash scripts/deployment/one-click-deploy.sh
# Chọn: 2

# Bước 3: Kiểm tra routes
bash scripts/deployment/one-click-deploy.sh
# Chọn: 5
```

---

### 🎯 Tình huống 3: Cần cập nhật code mới

```bash
# Bước 1: Pull code mới
cd /home/lta/pj/conttrade
git pull origin master

# Bước 2: Deploy backend
bash scripts/deployment/full-backend-deploy.sh

# Bước 3: Deploy frontend (nếu có thay đổi)
cd frontend
npm install
npm run build
pm2 restart lta-frontend

# Bước 4: Kiểm tra
bash scripts/deployment/check-all-routes.sh
```

---

### 🎯 Tình huống 4: Chỉ muốn kiểm tra không deploy

```bash
bash scripts/deployment/check-all-routes.sh
```

---

## 🔍 CÁCH KIỂM TRA CỤ THỂ

### 1. Kiểm tra Backend đang chạy

```bash
pm2 list
# Hoặc
pm2 status lta-backend
```

### 2. Kiểm tra Logs

```bash
# Backend logs
pm2 logs lta-backend

# Frontend logs  
pm2 logs lta-frontend

# Hoặc xem cả hai
pm2 logs
```

### 3. Test API trực tiếp

```bash
# Health check
curl http://localhost:3006/health

# Test một endpoint cụ thể
curl http://localhost:3006/api/v1/depots
curl http://localhost:3006/api/v1/master-data/ports
```

### 4. Kiểm tra Database

```bash
cd /home/lta/pj/conttrade/backend

# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Xem dữ liệu
npx prisma studio
# Mở browser: http://localhost:5555
```

---

## 🛠️ XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: Backend không start

```bash
# Kiểm tra logs
pm2 logs lta-backend --lines 100

# Xóa và start lại
pm2 delete lta-backend
pm2 start ecosystem.config.js --only lta-backend

# Hoặc chạy trực tiếp để debug
cd /home/lta/pj/conttrade/backend
node dist/server.js
```

### ❌ Lỗi: Database connection failed

```bash
# Kiểm tra PostgreSQL
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Kiểm tra .env file
cat /home/lta/pj/conttrade/backend/.env | grep DATABASE_URL
```

### ❌ Lỗi: Port already in use

```bash
# Tìm process đang dùng port 3006
sudo lsof -i :3006

# Kill process
sudo kill -9 <PID>

# Hoặc dùng PM2
pm2 delete lta-backend
pm2 start ecosystem.config.js --only lta-backend
```

### ❌ Lỗi: Routes not found (404)

```bash
# Kiểm tra routes đã được build
bash scripts/deployment/check-all-routes.sh

# Rebuild backend
bash scripts/deployment/full-backend-deploy.sh
```

### ❌ Lỗi: Empty response hoặc empty array

**Nguyên nhân:**
- Database chưa có dữ liệu
- User không có permissions

**Giải pháp:**

```bash
cd /home/lta/pj/conttrade/backend

# Seed dữ liệu mẫu
npx prisma db seed

# Hoặc chạy fix script
bash ../scripts/deployment/fix-display-issues.sh
```

---

## 📊 CÁCH ĐỌC KẾT QUẢ

### Khi chạy `check-all-routes.sh`

**Output ví dụ:**

```
📊 THỐNG KÊ ROUTES:
  • Routes trong source:     27
  • Routes đã build:         27
  • Routes đã register:      20

📊 THỐNG KÊ ENDPOINTS:
  • Tổng số endpoints test:  22
  • ✅ Hoạt động OK:           18
  • 🔐 Cần authentication:     3
  • ❌ Có lỗi:                 1

🎯 TÌNH TRẠNG TỔNG QUAN:
  ✅ EXCELLENT: 95% endpoints hoạt động tốt
```

**Giải thích:**
- ✅ **EXCELLENT (>90%)**: Mọi thứ OK
- ⚠️ **GOOD (70-90%)**: Còn một vài lỗi nhỏ
- ❌ **POOR (<70%)**: Cần rebuild hoặc fix nghiêm trọng

---

## 🎯 CHECKLIST DEPLOY

### Trước khi deploy:

- [ ] Code đã được commit và push (nếu từ remote)
- [ ] Đã backup database (nếu production)
- [ ] Đã kiểm tra .env files
- [ ] PM2 đã được cài đặt
- [ ] PostgreSQL đang chạy

### Trong quá trình deploy:

- [ ] Build không có lỗi
- [ ] PM2 start thành công
- [ ] `pm2 list` hiển thị status "online"
- [ ] Logs không có error nghiêm trọng

### Sau khi deploy:

- [ ] Test API health: `curl http://localhost:3006/health`
- [ ] Run check routes: `bash scripts/deployment/check-all-routes.sh`
- [ ] Test login
- [ ] Kiểm tra các màn hình chính
- [ ] Xóa cache browser (Ctrl + Shift + R)

---

## 🔄 WORKFLOW KHUYẾN NGHỊ

### Deploy hàng ngày (Development)

```bash
# 1. Pull code mới
git pull origin master

# 2. One-click deploy
bash scripts/deployment/one-click-deploy.sh
# Chọn: 1 (Full Deploy)

# 3. Done!
```

### Deploy production

```bash
# 1. Backup database trước
cd /home/lta/pj/conttrade/backend
pg_dump i_contexchange > backup_$(date +%Y%m%d).sql

# 2. Full deploy với kiểm tra
bash scripts/deployment/one-click-deploy.sh
# Chọn: 1 (Full Deploy)

# 3. Full diagnosis
bash scripts/deployment/one-click-deploy.sh
# Chọn: 6 (Full Diagnosis)

# 4. Monitor 5-10 phút
pm2 monit
```

### Sửa lỗi nhanh

```bash
# Option 1: Chạy fix script
bash scripts/deployment/fix-display-issues.sh

# Option 2: Rebuild backend
bash scripts/deployment/full-backend-deploy.sh

# Option 3: Check routes để biết vấn đề
bash scripts/deployment/check-all-routes.sh
```

---

## 💡 TIPS & BEST PRACTICES

### 1. Luôn check logs trước

```bash
pm2 logs lta-backend --lines 100
```

Logs sẽ cho bạn biết:
- Routes nào đã register
- Có lỗi gì không
- Database connection OK không

### 2. Test API bằng curl

```bash
# Test endpoint cụ thể
curl -v http://localhost:3006/api/v1/depots

# Với authentication
curl -v -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3006/api/v1/orders
```

### 3. Dùng PM2 monit để theo dõi real-time

```bash
pm2 monit
```

Hiển thị:
- CPU usage
- Memory usage
- Logs real-time

### 4. Restart khi cần thiết

```bash
# Restart một service
pm2 restart lta-backend

# Restart tất cả
pm2 restart all

# Reload (zero-downtime)
pm2 reload lta-backend
```

### 5. Kiểm tra network từ browser

Mở DevTools (F12) → Network tab:
- Xem request nào failed
- Xem response code
- Xem error message

---

## 📞 TRỢ GIÚP

### Nếu gặp vấn đề không giải quyết được:

1. **Chạy full diagnosis:**
   ```bash
   bash scripts/deployment/one-click-deploy.sh
   # Chọn: 6
   ```

2. **Gửi thông tin sau:**
   - Output của diagnosis
   - PM2 logs: `pm2 logs --lines 200`
   - Database status: `sudo systemctl status postgresql`
   - Browser console errors (F12 → Console)

---

## 📚 TÀI LIỆU LIÊN QUAN

- `BUILD-AND-DEPLOY.md` - Hướng dẫn deploy đầy đủ
- `DEPLOYMENT.md` - Deployment với PM2 và Docker
- `READY-TO-DEPLOY.md` - Quick deploy guide
- `ecosystem.config.js` - PM2 configuration

---

## 🎉 KẾT LUẬN

Với 4 scripts được chuẩn bị:

1. ✅ `one-click-deploy.sh` - Menu tổng hợp tất cả
2. ✅ `full-backend-deploy.sh` - Deploy backend đầy đủ
3. ✅ `fix-display-issues.sh` - Sửa lỗi hiển thị
4. ✅ `check-all-routes.sh` - Kiểm tra routes

**Bạn có thể:**
- Deploy toàn bộ trong 1 lệnh
- Kiểm tra và fix lỗi tự động
- Theo dõi tình trạng chi tiết
- Chẩn đoán vấn đề nhanh chóng

**Không còn lo về màn hình không hiển thị dữ liệu!** 🚀

---

> **Cập nhật:** 3/11/2025  
> **Tác giả:** LTA Development Team  
> **Version:** 1.0.0
