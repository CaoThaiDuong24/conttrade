# 🚀 HƯỚNG DẪN BUILD VÀ DEPLOY LÊN UBUNTU SERVER

> **Hướng dẫn chi tiết để build dự án từ Windows và deploy lên Ubuntu Server**

---

## 📋 YÊU CẦU TRƯỚC KHI BẮT ĐẦU

### Trên Ubuntu Server:
- ✅ Ubuntu 20.04 LTS trở lên
- ✅ RAM: Tối thiểu 2GB (khuyến nghị 4GB+)
- ✅ Disk: Tối thiểu 20GB
- ✅ Đã có SSH access
- ✅ Có quyền sudo

### Trên Máy Windows (local):
- ✅ Git đã cài đặt
- ✅ Node.js 20+ (nếu build local)
- ✅ Có kết nối SSH tới server

---

## 🎯 PHƯƠNG ÁN DEPLOY (CHỌN 1 TRONG 3)

### **Phương Án 1: Deploy Từ Git (Khuyến nghị ⭐)**
Server tự động pull code từ GitHub và build

### **Phương Án 2: Docker Compose**
Dùng Docker để đóng gói toàn bộ ứng dụng

### **Phương Án 3: Build Local rồi Upload**
Build trên Windows, upload file build lên server

---

## 🔥 PHƯƠNG ÁN 1: DEPLOY TỪ GIT (NHANH NHẤT)

### Bước 1: Push Code Lên GitHub

**Trên máy Windows:**

```powershell
# Đảm bảo code đã được commit
git add .
git commit -m "Ready for production deployment"
git push origin master
```

### Bước 2: SSH vào Ubuntu Server

```powershell
ssh user@your-server-ip
```

### Bước 3: Chạy Script Deploy Tự Động

**Trên Ubuntu Server:**

```bash
# Tải script deploy
wget https://raw.githubusercontent.com/CaoThaiDuong24/conttrade/master/scripts/deployment/ubuntu-deploy.sh

# Cấp quyền thực thi
chmod +x ubuntu-deploy.sh

# Chạy script (sẽ tự động cài đặt mọi thứ)
sudo ./ubuntu-deploy.sh
```

Script sẽ tự động:
- ✅ Cài Node.js, PostgreSQL, Nginx, PM2
- ✅ Clone code từ GitHub
- ✅ Tạo database
- ✅ Build backend & frontend
- ✅ Cấu hình Nginx
- ✅ Start ứng dụng với PM2

**Thời gian**: ~15-20 phút

### Bước 4: Cấu Hình Environment Variables

```bash
cd /var/www/lta

# Tạo .env cho backend
nano backend/.env.production
```

**Nội dung file `backend/.env.production`:**

```bash
NODE_ENV=production
PORT=3006
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://lta_user:your_password@localhost:5432/i_contexchange?schema=public

# Security (QUAN TRỌNG: Đổi secret keys!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this
SESSION_SECRET=your-super-secret-session-key-here-change-this

# CORS
CORS_ORIGIN=http://your-server-ip

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

**Tạo .env cho frontend:**

```bash
nano frontend/.env.production
```

**Nội dung file `frontend/.env.production`:**

```bash
NODE_ENV=production

# API URL
NEXT_PUBLIC_API_URL=http://your-server-ip:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://your-server-ip:3000

# Database
DATABASE_URL=postgresql://lta_user:your_password@localhost:5432/i_contexchange?schema=public

# Upload
NEXT_PUBLIC_UPLOAD_URL=http://your-server-ip:3006/uploads

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

### Bước 5: Build và Start

```bash
# Build Backend
cd /var/www/lta/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Build Frontend
cd /var/www/lta/frontend
npm install
npm run build

# Start với PM2
cd /var/www/lta
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Kiểm tra
pm2 list
pm2 logs
```

### Bước 6: Truy Cập Ứng Dụng

```
http://your-server-ip
```

**✅ XONG!** Ứng dụng đã chạy.

---

## 🐳 PHƯƠNG ÁN 2: DOCKER COMPOSE

### Bước 1: Cài Docker trên Ubuntu

```bash
# Update system
sudo apt update

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài Docker Compose
sudo apt install docker-compose

# Kiểm tra
docker --version
docker-compose --version
```

### Bước 2: Clone Code

```bash
cd /var/www
sudo git clone https://github.com/CaoThaiDuong24/conttrade.git lta
cd lta
```

### Bước 3: Tạo File .env

```bash
nano .env
```

**Nội dung:**

```bash
# PostgreSQL
POSTGRES_USER=lta_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=i_contexchange

# JWT
JWT_SECRET=your-jwt-secret-key-here

# URLs
FRONTEND_URL=http://your-server-ip:3000
NEXT_PUBLIC_API_URL=http://your-server-ip:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://your-server-ip:3000
```

### Bước 4: Build và Start Docker

```bash
# Build images
sudo docker-compose build

# Start containers
sudo docker-compose up -d

# Kiểm tra
sudo docker-compose ps
sudo docker-compose logs -f
```

### Bước 5: Run Database Migrations

```bash
# Vào container backend
sudo docker-compose exec backend sh

# Chạy migrations
npx prisma migrate deploy

# Thoát
exit
```

Truy cập: `http://your-server-ip`

---

## 💻 PHƯƠNG ÁN 3: BUILD LOCAL RỒI UPLOAD

### Bước 1: Build Trên Windows

**Mở PowerShell:**

```powershell
cd "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web"

# Build Backend
cd backend
npm install
npm run build

# Build Frontend
cd ..\frontend
npm install
npm run build

cd ..
```

### Bước 2: Tạo Package Để Upload

```powershell
# Tạo thư mục build
New-Item -ItemType Directory -Force -Path ".\build-output"

# Copy backend build
Copy-Item -Path ".\backend\dist" -Destination ".\build-output\backend\dist" -Recurse
Copy-Item -Path ".\backend\node_modules" -Destination ".\build-output\backend\node_modules" -Recurse
Copy-Item -Path ".\backend\package.json" -Destination ".\build-output\backend\"
Copy-Item -Path ".\backend\prisma" -Destination ".\build-output\backend\prisma" -Recurse

# Copy frontend build
Copy-Item -Path ".\frontend\.next" -Destination ".\build-output\frontend\.next" -Recurse
Copy-Item -Path ".\frontend\node_modules" -Destination ".\build-output\frontend\node_modules" -Recurse
Copy-Item -Path ".\frontend\package.json" -Destination ".\build-output\frontend\"
Copy-Item -Path ".\frontend\public" -Destination ".\build-output\frontend\public" -Recurse

# Copy ecosystem config
Copy-Item -Path ".\ecosystem.config.js" -Destination ".\build-output\"
```

### Bước 3: Nén File

```powershell
# Nén thư mục build-output
Compress-Archive -Path ".\build-output\*" -DestinationPath ".\lta-production.zip" -Force
```

### Bước 4: Upload Lên Server

```powershell
# Dùng SCP upload
scp .\lta-production.zip user@your-server-ip:/tmp/
```

### Bước 5: Extract và Setup Trên Server

**SSH vào server:**

```bash
ssh user@your-server-ip
```

**Trên Ubuntu:**

```bash
# Cài Node.js, PostgreSQL, PM2 (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx
sudo npm install -g pm2

# Tạo thư mục
sudo mkdir -p /var/www/lta
cd /var/www/lta

# Extract file
sudo unzip /tmp/lta-production.zip -d .

# Cấu hình PostgreSQL
sudo -u postgres psql <<EOF
CREATE USER lta_user WITH PASSWORD 'your_password';
CREATE DATABASE i_contexchange OWNER lta_user;
GRANT ALL PRIVILEGES ON DATABASE i_contexchange TO lta_user;
EOF

# Tạo .env files (giống Phương án 1)
sudo nano backend/.env.production
sudo nano frontend/.env.production

# Run migrations
cd backend
npx prisma migrate deploy

# Start PM2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔍 KIỂM TRA VÀ DEBUG

### Kiểm Tra Services

```bash
# PM2 status
pm2 list
pm2 logs

# PostgreSQL
sudo systemctl status postgresql

# Nginx (nếu đã cấu hình)
sudo systemctl status nginx

# Kiểm tra ports
sudo netstat -tulpn | grep -E ':(3000|3006|5432)'
```

### Kiểm Tra Logs

```bash
# Backend logs
pm2 logs lta-backend

# Frontend logs
pm2 logs lta-frontend

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Test API

```bash
# Backend health check
curl http://localhost:3006/health

# Frontend
curl http://localhost:3000
```

---

## 🔄 CẬP NHẬT ỨNG DỤNG

### Cập Nhật Nhanh

```bash
cd /var/www/lta
sudo ./scripts/deployment/update-app.sh
```

### Hoặc Thủ Công

```bash
cd /var/www/lta

# Pull code mới
git pull origin master

# Update backend
cd backend
npm install
npx prisma migrate deploy
npm run build

# Update frontend
cd ../frontend
npm install
npm run build

# Reload PM2
cd ..
pm2 reload ecosystem.config.js
pm2 logs
```

---

## 🛡️ BẢO MẬT VÀ TỐI ƯU

### Setup Firewall

```bash
# Cài UFW
sudo apt install ufw

# Mở ports cần thiết
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable
sudo ufw status
```

### Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/lta
```

**Nội dung:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3006/uploads;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL (HTTPS)

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx

# Xin SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 GIÁM SÁT

### Script Monitor

```bash
cd /var/www/lta/scripts/deployment
sudo ./monitor.sh --full
```

### Setup Auto Backup Database

```bash
# Thêm vào crontab
sudo crontab -e

# Backup lúc 2h sáng mỗi ngày
0 2 * * * /var/www/lta/scripts/deployment/database.sh backup
```

---

## ❓ XỬ LÝ SỰ CỐ THƯỜNG GẶP

### Port đã được sử dụng

```bash
# Tìm process đang dùng port
sudo lsof -i :3000
sudo lsof -i :3006

# Kill process
sudo kill -9 <PID>
```

### Database connection error

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Kiểm tra password
sudo -u postgres psql -d i_contexchange -U lta_user -W
```

### Hết RAM/Disk

```bash
# Xem dung lượng
df -h
free -h

# Xóa logs cũ
pm2 flush
sudo journalctl --vacuum-time=7d
```

---

## 🎯 CHECKLIST DEPLOY

### Trước Deploy
- [ ] Đã push code lên GitHub
- [ ] Đã backup database cũ (nếu có)
- [ ] Đã chuẩn bị server Ubuntu
- [ ] Có SSH access vào server
- [ ] Đã đổi JWT_SECRET và SESSION_SECRET

### Trong Deploy
- [ ] Clone/Pull code thành công
- [ ] Cài đặt dependencies
- [ ] Chạy migrations
- [ ] Build backend thành công
- [ ] Build frontend thành công
- [ ] PM2 start thành công

### Sau Deploy
- [ ] Kiểm tra pm2 list
- [ ] Xem pm2 logs không có lỗi
- [ ] Test truy cập http://server-ip
- [ ] Test login
- [ ] Setup firewall
- [ ] Setup Nginx (optional)
- [ ] Setup SSL (optional)
- [ ] Setup auto backup

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. **Kiểm tra logs**: `pm2 logs`
2. **Chạy monitor**: `sudo ./scripts/deployment/monitor.sh --full`
3. **Xem guide**: Đọc lại `DEPLOYMENT-GUIDE.md`

---

**Chúc bạn deploy thành công! 🎉**

> Cập nhật: 30/10/2025
