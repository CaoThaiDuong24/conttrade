# 🚀 HƯỚNG DẪN CÀI ĐẶT GITHUB ACTIONS AUTO-DEPLOY

> **Tự động deploy lên Ubuntu Server mỗi khi push code lên GitHub**

---

## 📋 MỤC LỤC

1. [Tổng Quan](#tổng-quan)
2. [Yêu Cầu Trước Khi Bắt Đầu](#yêu-cầu-trước-khi-bắt-đầu)
3. [Bước 1: Chuẩn Bị Server](#bước-1-chuẩn-bị-server)
4. [Bước 2: Tạo SSH Key](#bước-2-tạo-ssh-key)
5. [Bước 3: Cấu Hình GitHub Secrets](#bước-3-cấu-hình-github-secrets)
6. [Bước 4: Test Auto-Deploy](#bước-4-test-auto-deploy)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 TỔNG QUAN

Sau khi setup xong, workflow sẽ như sau:

```
1. Bạn push code lên GitHub (branch master/main)
   ↓
2. GitHub Actions tự động chạy
   ↓
3. SSH vào server của bạn
   ↓
4. Pull code mới + Build + Deploy
   ↓
5. Restart services với PM2
   ↓
6. ✅ Website đã update!
```

**Thời gian:** ~3-5 phút mỗi lần deploy

---

## ✅ YÊU CẦU TRƯỚC KHI BẮT ĐẦU

### Trên Ubuntu Server:
- ✅ Ubuntu 20.04+ đã cài đặt
- ✅ Node.js 20+ đã cài
- ✅ PostgreSQL đã cài
- ✅ PM2 đã cài (`npm install -g pm2`)
- ✅ Git đã cài
- ✅ Đã có SSH access
- ✅ Port 22 (SSH) mở

### Trên GitHub:
- ✅ Code đã push lên repository
- ✅ Có quyền admin để thêm Secrets

---

## 🖥️ BƯỚC 1: CHUẨN BỊ SERVER

### 1.1. SSH vào Server

```bash
ssh your-username@your-server-ip
```

### 1.2. Cài Đặt Dependencies (nếu chưa có)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cài PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Cài PM2
sudo npm install -g pm2

# Cài Git
sudo apt install -y git
```

### 1.3. Clone Repository Lần Đầu

```bash
# Tạo thư mục deploy
sudo mkdir -p /var/www/lta
sudo chown -R $USER:$USER /var/www/lta

# Clone code
cd /var/www
git clone https://github.com/CaoThaiDuong24/conttrade.git lta
cd lta
```

### 1.4. Setup Database

```bash
# Vào PostgreSQL
sudo -u postgres psql

# Trong PostgreSQL console:
CREATE DATABASE i_contexchange;
CREATE USER postgres WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE i_contexchange TO postgres;
\q
```

### 1.5. Tạo Environment Files

**Backend (.env):**

```bash
nano /var/www/lta/backend/.env
```

Nội dung:

```env
NODE_ENV=production
PORT=3006
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/i_contexchange?schema=public

# Security - ĐỔI NGAY!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this

# CORS
CORS_ORIGIN=http://your-server-ip:3000

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

**Frontend (.env):**

```bash
nano /var/www/lta/frontend/.env
```

Nội dung:

```env
NODE_ENV=production

# API URL
NEXT_PUBLIC_API_URL=http://your-server-ip:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://your-server-ip:3000

# Database
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/i_contexchange?schema=public

# Upload
NEXT_PUBLIC_UPLOAD_URL=http://your-server-ip:3006/uploads

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

### 1.6. Build và Deploy Lần Đầu

```bash
cd /var/www/lta

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# Start với PM2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Chạy lệnh mà PM2 suggest
```

✅ **Kiểm tra:** Truy cập `http://your-server-ip:3000` để đảm bảo app chạy

---

## 🔑 BƯỚC 2: TẠO SSH KEY

### 2.1. Tạo SSH Key Pair (Trên Server)

```bash
# Tạo SSH key mới (không dùng password)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Kết quả: 
# - Private key: ~/.ssh/github_actions
# - Public key:  ~/.ssh/github_actions.pub
```

### 2.2. Add Public Key vào Authorized Keys

```bash
# Thêm public key vào authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Set permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 2.3. Lấy Private Key

```bash
# Copy private key để thêm vào GitHub Secrets
cat ~/.ssh/github_actions
```

**Quan trọng:** 
- Copy TOÀN BỘ nội dung từ `-----BEGIN` đến `-----END`
- Bao gồm cả dòng đầu và dòng cuối
- Giữ nguyên format có xuống dòng

**Ví dụ output:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...many lines...
-----END OPENSSH PRIVATE KEY-----
```

### 2.4. Test SSH Key

```bash
# Test từ server (nên pass)
ssh -i ~/.ssh/github_actions $USER@localhost "echo 'SSH test successful'"
```

---

## 🔐 BƯỚC 3: CẤU HÌNH GITHUB SECRETS

### 3.1. Vào GitHub Repository

1. Mở browser, vào: `https://github.com/CaoThaiDuong24/conttrade`
2. Click **Settings** (tab trên cùng)
3. Trong sidebar trái, click **Secrets and variables** → **Actions**
4. Click nút **New repository secret**

### 3.2. Thêm Các Secrets

Thêm từng secret sau (chính xác tên và giá trị):

#### Secret 1: `SSH_PRIVATE_KEY`
- **Name:** `SSH_PRIVATE_KEY`
- **Value:** Paste toàn bộ private key từ bước 2.3
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAA...
  -----END OPENSSH PRIVATE KEY-----
  ```
- Click **Add secret**

#### Secret 2: `SSH_HOST`
- **Name:** `SSH_HOST`
- **Value:** IP address của server
  ```
  123.45.67.89
  ```
- Click **Add secret**

#### Secret 3: `SSH_USER`
- **Name:** `SSH_USER`
- **Value:** Username SSH của bạn
  ```
  ubuntu
  ```
  (hoặc `root`, `admin`, tùy server)
- Click **Add secret**

#### Secret 4: `SSH_PORT`
- **Name:** `SSH_PORT`
- **Value:** SSH port (thường là 22)
  ```
  22
  ```
- Click **Add secret**

#### Secret 5: `DEPLOY_PATH`
- **Name:** `DEPLOY_PATH`
- **Value:** Đường dẫn deploy trên server
  ```
  /var/www/lta
  ```
- Click **Add secret**

#### Secret 6: `DB_PASSWORD`
- **Name:** `DB_PASSWORD`
- **Value:** Password PostgreSQL
  ```
  your-database-password
  ```
- Click **Add secret**

#### Secret 7: `JWT_SECRET`
- **Name:** `JWT_SECRET`
- **Value:** JWT secret key
  ```
  your-super-secret-jwt-key
  ```
- Click **Add secret**

### 3.3. Kiểm Tra Secrets

Sau khi thêm xong, bạn nên thấy 7 secrets:

```
SSH_PRIVATE_KEY  •••••••••••••
SSH_HOST         •••••••••••••
SSH_USER         •••••••••••••
SSH_PORT         •••••••••••••
DEPLOY_PATH      •••••••••••••
DB_PASSWORD      •••••••••••••
JWT_SECRET       •••••••••••••
```

✅ **Xong bước cấu hình GitHub Secrets!**

---

## 🧪 BƯỚC 4: TEST AUTO-DEPLOY

### 4.1. Trigger Deploy Thủ Công (Test)

1. Vào repository GitHub
2. Click tab **Actions**
3. Click workflow **Deploy to Ubuntu Server** (bên trái)
4. Click nút **Run workflow** (bên phải)
5. Chọn branch `master`
6. Click **Run workflow**

### 4.2. Theo Dõi Deployment

- Workflow sẽ chạy (~3-5 phút)
- Xem logs real-time để check progress
- Các bước sẽ có icon:
  - 🔄 Đang chạy (vàng)
  - ✅ Thành công (xanh)
  - ❌ Thất bại (đỏ)

### 4.3. Kiểm Tra Kết Quả

**Nếu thành công:**
- Tất cả steps có dấu ✅ xanh
- Logs hiển thị "Deployment completed successfully!"
- Truy cập `http://your-server-ip:3000` để kiểm tra

**Nếu thất bại:**
- Xem logs chi tiết ở step bị lỗi
- Xem phần [Troubleshooting](#troubleshooting) bên dưới

### 4.4. Test Auto-Deploy Thật

**Trên máy local (Windows):**

```powershell
cd "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"

# Tạo một thay đổi nhỏ để test
Add-Content -Path README.md -Value "`n`n<!-- Test auto-deploy -->"

# Commit và push
git add .
git commit -m "test: trigger auto-deploy"
git push origin master
```

**Kiểm tra trên GitHub:**
- Vào tab **Actions**
- Sẽ thấy workflow tự động chạy
- Đợi hoàn thành
- Kiểm tra website đã update

🎉 **XONG! Auto-deploy đã hoạt động!**

---

## 🔄 QUY TRÌNH SỬ DỤNG HÀNG NGÀY

Từ giờ, mỗi khi bạn làm việc:

```powershell
# 1. Code trên máy local
# ... viết code ...

# 2. Commit và push
git add .
git commit -m "feat: add new feature"
git push origin master

# 3. Chờ 3-5 phút
# GitHub Actions tự động deploy

# 4. Kiểm tra website
# Website đã update với code mới!
```

**Không cần:**
- ❌ SSH vào server
- ❌ Pull code thủ công
- ❌ Build thủ công
- ❌ Restart services thủ công

**Tất cả đã tự động! 🚀**

---

## 🛠️ TROUBLESHOOTING

### Lỗi: "Permission denied (publickey)"

**Nguyên nhân:** SSH key không đúng hoặc chưa add vào authorized_keys

**Giải pháp:**
```bash
# Trên server, kiểm tra lại:
cat ~/.ssh/authorized_keys | grep github-actions

# Nếu không có, add lại:
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Lỗi: "Host key verification failed"

**Nguyên nhân:** Server fingerprint chưa được lưu

**Giải pháp:** Workflow đã tự động handle, nhưng nếu vẫn lỗi:
```bash
# Trên server:
ssh-keyscan -H localhost >> ~/.ssh/known_hosts
```

### Lỗi: "pm2: command not found"

**Nguyên nhân:** PM2 chưa cài hoặc không trong PATH

**Giải pháp:**
```bash
# Cài PM2
sudo npm install -g pm2

# Hoặc check PATH
echo $PATH
which pm2
```

### Lỗi: "Database connection failed"

**Nguyên nhân:** DATABASE_URL trong .env sai hoặc database chưa tạo

**Giải pháp:**
```bash
# Kiểm tra PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -U postgres -d i_contexchange -h localhost

# Nếu không connect được, check password trong .env
```

### Lỗi: "Port already in use"

**Nguyên nhân:** Process cũ chưa dừng

**Giải pháp:**
```bash
# Kill process cũ
sudo lsof -i :3000
sudo lsof -i :3006
sudo kill -9 <PID>

# Hoặc restart PM2
pm2 restart all
```

### Workflow Chạy Nhưng Không Update

**Kiểm tra:**
```bash
# SSH vào server
ssh user@server-ip

# Xem logs PM2
pm2 logs

# Check git status
cd /var/www/lta
git log -1  # Xem commit mới nhất
```

---

## 📊 MONITORING VÀ LOGS

### Xem Logs Trên GitHub

1. Vào tab **Actions**
2. Click vào workflow run
3. Click vào job "Deploy Application"
4. Xem từng step

### Xem Logs Trên Server

```bash
# SSH vào server
ssh user@server-ip

# PM2 logs
pm2 logs

# Logs backend
pm2 logs lta-backend --lines 100

# Logs frontend
pm2 logs lta-frontend --lines 100

# Deployment logs (nếu có)
tail -f /var/www/lta/deploy.log
```

### Monitor Real-time

```bash
# PM2 monitor
pm2 monit

# System resources
htop
```

---

## 🎯 TIPS VÀ BEST PRACTICES

### 1. **Test Trước Khi Push**

```powershell
# Test local trước
cd backend
npm run build
npm test

cd ../frontend
npm run build
```

### 2. **Sử Dụng Branches**

```bash
# Develop trên branch riêng
git checkout -b feature/new-feature

# Test xong mới merge vào master
git checkout master
git merge feature/new-feature
git push
```

### 3. **Rollback Nếu Cần**

```bash
# SSH vào server
cd /var/www/lta

# Quay lại commit trước đó
git log --oneline -5
git reset --hard <commit-hash>

# Rebuild và restart
npm run build
pm2 restart all
```

### 4. **Backup Trước Update Lớn**

```bash
# Backup database
pg_dump -U postgres i_contexchange > backup_$(date +%Y%m%d).sql

# Backup code
tar -czf /tmp/lta_backup_$(date +%Y%m%d).tar.gz /var/www/lta
```

### 5. **Setup Notifications (Optional)**

Thêm vào workflow để nhận thông báo qua Telegram/Slack/Discord khi deploy thành công/thất bại.

---

## 🔒 BẢO MẬT

### Điều Cần Làm:

1. ✅ **Đổi tất cả passwords/secrets mặc định**
2. ✅ **Không commit .env files**
3. ✅ **Giữ SSH private key bí mật**
4. ✅ **Chỉ cấp quyền cần thiết cho SSH user**
5. ✅ **Enable firewall trên server**

```bash
# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Điều Không Nên Làm:

1. ❌ **Không share GitHub Secrets**
2. ❌ **Không commit SSH keys**
3. ❌ **Không dùng password SSH (dùng key)**
4. ❌ **Không để root user deploy**

---

## 📞 HỖ TRỢ

### Câu Hỏi Thường Gặp

**Q: Có tốn tiền không?**
A: Không! GitHub Actions miễn phí cho public repos (2000 phút/tháng)

**Q: Deploy mất bao lâu?**
A: 3-5 phút mỗi lần (tùy kích thước project)

**Q: Có thể rollback không?**
A: Có, xem phần Tips ở trên

**Q: Có thể deploy nhiều servers không?**
A: Có, tạo thêm workflow files hoặc dùng matrix strategy

**Q: Có thể deploy branches khác không?**
A: Có, sửa `branches` trong workflow file

---

## 🎉 HOÀN THÀNH!

Chúc mừng! Bạn đã setup thành công GitHub Actions Auto-Deploy!

**Từ giờ:**
- ✅ Push code → Tự động deploy
- ✅ Không cần SSH vào server
- ✅ Tiết kiệm thời gian
- ✅ Ít lỗi hơn
- ✅ Deploy nhanh hơn

**Next Steps:**
1. Setup SSL/HTTPS với Let's Encrypt
2. Setup database backup tự động
3. Setup monitoring với PM2 Plus
4. Setup domain name

---

> **Tác giả:** GitHub Copilot  
> **Ngày tạo:** 31/10/2025  
> **Repository:** https://github.com/CaoThaiDuong24/conttrade

**Happy Deploying! 🚀**
