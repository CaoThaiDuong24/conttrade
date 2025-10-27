# 🚀 Hướng Dẫn Deploy LTA Project trên Ubuntu

> **Tài liệu chính thức để triển khai ứng dụng lên Ubuntu Server**

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Chuẩn Bị Deploy](#chuẩn-bị-deploy)
3. [Deploy Lần Đầu](#deploy-lần-đầu)
4. [Cập Nhật Ứng Dụng](#cập-nhật-ứng-dụng)
5. [Quản Lý Database](#quản-lý-database)
6. [Giám Sát Hệ Thống](#giám-sát-hệ-thống)
7. [Xử Lý Sự Cố](#xử-lý-sự-cố)

---

## 🖥️ Yêu Cầu Hệ Thống

### Server Requirements
- **OS**: Ubuntu 20.04 LTS hoặc mới hơn
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Disk**: Tối thiểu 20GB
- **CPU**: 2 cores trở lên
- **Root Access**: Có quyền sudo

### Network Requirements
- Port 80, 443 (HTTP/HTTPS)
- Port 22 (SSH)
- Port 3000, 3006 (Internal - Frontend/Backend)
- Port 5432 (PostgreSQL - Internal)

### Domain & DNS
- Tên miền đã trỏ về IP server (nếu dùng domain)
- SSL certificate (Let's Encrypt - miễn phí)

---

## 🎯 Chuẩn Bị Deploy

### Bước 1: Upload Scripts lên Server

```bash
# Từ máy local, upload toàn bộ thư mục scripts
scp -r scripts/deployment/* user@your-server-ip:/tmp/deployment/
```

### Bước 2: SSH vào Server

```bash
ssh user@your-server-ip
```

### Bước 3: Cấp Quyền Thực Thi

```bash
cd /tmp/deployment
sudo chmod +x *.sh
ls -lh *.sh
```

---

## 🚀 Deploy Lần Đầu

### Phương Án 1: Deploy Tự Động (Khuyến Nghị)

Sử dụng script tự động hóa hoàn toàn:

```bash
cd /tmp/deployment
sudo ./ubuntu-deploy.sh
```

Script sẽ tự động:
- ✅ Cài đặt Node.js, PostgreSQL, Nginx, PM2
- ✅ Tạo database và user
- ✅ Clone code từ repository
- ✅ Build backend và frontend
- ✅ Cấu hình Nginx reverse proxy
- ✅ Setup PM2 cluster mode
- ✅ Cấu hình firewall (UFW)
- ✅ Setup SSL (optional)

**Thời gian**: ~15-20 phút

### Phương Án 2: Quick Setup

Nếu muốn setup nhanh và đơn giản hơn:

```bash
cd /tmp/deployment
sudo ./quick-setup.sh
```

Script sẽ hỏi:
- 📁 Thư mục cài đặt (mặc định: `/var/www/lta`)
- 🔐 Mật khẩu PostgreSQL
- 🌐 Tên miền (optional)
- 📧 Email cho SSL (optional)

**Thời gian**: ~10-15 phút

### Sau Khi Chạy Script

1. **Clone Repository** (nếu script chưa làm):
```bash
cd /var/www/lta
git clone https://github.com/CaoThaiDuong24/conttrade.git .
```

2. **Build Backend**:
```bash
cd /var/www/lta/backend
pnpm install
npx prisma generate
npx prisma migrate deploy
pnpm run build
```

3. **Build Frontend**:
```bash
cd /var/www/lta/frontend
pnpm install
pnpm run build
```

4. **Start với PM2**:
```bash
cd /var/www/lta
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **Kiểm Tra**:
```bash
pm2 list
pm2 logs
```

Truy cập: `http://your-server-ip`

---

## 🔄 Cập Nhật Ứng Dụng

### Cập Nhật Tự Động (Zero-Downtime)

```bash
cd /var/www/lta/scripts/deployment
sudo ./update-app.sh
```

Script tự động:
1. Backup database
2. Pull code mới từ Git
3. Install dependencies
4. Run migrations
5. Build lại frontend/backend
6. Reload PM2 (không downtime)
7. Health check

### Cập Nhật Thủ Công

```bash
cd /var/www/lta

# 1. Backup database
sudo ./scripts/deployment/database.sh backup

# 2. Pull code mới
git pull origin master

# 3. Update backend
cd backend
pnpm install
npx prisma generate
npx prisma migrate deploy
pnpm run build

# 4. Update frontend
cd ../frontend
pnpm install
pnpm run build

# 5. Reload PM2
cd ..
pm2 reload ecosystem.config.js
pm2 save

# 6. Check logs
pm2 logs --lines 50
```

---

## 🗄️ Quản Lý Database

### Script Quản Lý Database

```bash
cd /var/www/lta/scripts/deployment
sudo ./database.sh
```

Menu tương tác:
```
1) Create Backup        - Tạo backup
2) List Backups        - Xem danh sách backup
3) Restore Backup      - Khôi phục backup
4) Export Database     - Export database
5) Run Migrations      - Chạy migrations
6) Show Statistics     - Thống kê database
7) Clean Old Data      - Xóa dữ liệu cũ
8) Reset Database      - Reset toàn bộ (NGUY HIỂM!)
```

### Backup Tự Động

Setup cron job để backup hàng ngày:

```bash
sudo crontab -e

# Thêm dòng này (backup lúc 2h sáng mỗi ngày)
0 2 * * * /var/www/lta/scripts/deployment/database.sh backup
```

### Restore Database

```bash
cd /var/www/lta/scripts/deployment

# Xem danh sách backups
sudo ./database.sh list

# Restore backup cụ thể
sudo ./database.sh restore
# Nhập tên file backup khi được hỏi
```

---

## 📊 Giám Sát Hệ Thống

### Script Monitoring

```bash
cd /var/www/lta/scripts/deployment
sudo ./monitor.sh
```

Menu giám sát:
```
1) Full Status Report      - Báo cáo đầy đủ
2) Check Services Only     - Kiểm tra services
3) Check Application Health - Health check
4) Check Disk Usage        - Dung lượng đĩa
5) Check Memory Usage      - RAM
6) Show Recent Logs        - Logs gần đây
7) Check SSL Certificate   - Kiểm tra SSL
8) Nginx Statistics        - Thống kê Nginx
9) Database Statistics     - Thống kê Database
```

### Hoặc Chạy Report Nhanh

```bash
sudo ./monitor.sh --full
```

### Kiểm Tra Logs

```bash
# PM2 logs (real-time)
pm2 logs

# PM2 logs (100 dòng gần nhất)
pm2 logs --lines 100

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL log
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Kiểm Tra Trạng Thái Services

```bash
# PM2
pm2 status
pm2 monit

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql

# Kiểm tra ports
sudo netstat -tulpn | grep -E ':(80|443|3000|3006|5432)'
```

---

## 🔧 Xử Lý Sự Cố

### Ứng Dụng Không Chạy

```bash
# Kiểm tra PM2
pm2 list
pm2 logs --err

# Kiểm tra port conflicts
sudo netstat -tulpn | grep -E ':(3000|3006)'

# Restart PM2
pm2 restart all

# Hoặc restart từ đầu
pm2 delete all
cd /var/www/lta
pm2 start ecosystem.config.js
pm2 save
```

### Database Connection Error

```bash
# Kiểm tra PostgreSQL
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
sudo -u postgres psql -d i_contexchange -c "SELECT 1;"

# Kiểm tra DATABASE_URL
cat /var/www/lta/backend/.env | grep DATABASE_URL
```

### Nginx Error

```bash
# Test config
sudo nginx -t

# Xem error log
sudo tail -100 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Hết Dung Lượng Đĩa

```bash
# Kiểm tra dung lượng
df -h

# Xem thư mục nào chiếm nhiều
sudo du -h /var/www/lta | sort -rh | head -20

# Xóa logs cũ
pm2 flush
sudo rm /var/log/nginx/*.log.*

# Xóa backups cũ (giữ 7 ngày gần nhất)
find /var/www/lta/backups -name "*.sql.gz" -mtime +7 -delete
```

### Hết RAM

```bash
# Kiểm tra RAM
free -h

# Process nào tốn RAM
ps aux --sort=-%mem | head -10

# Restart PM2 để giải phóng RAM
pm2 restart all

# Thêm swap nếu cần
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Rollback Về Phiên Bản Cũ

```bash
cd /var/www/lta/scripts/deployment
sudo ./rollback.sh

# Script sẽ hiện danh sách commits
# Nhập commit hash muốn rollback
```

---

## 🔐 Setup SSL Certificate

### Tự Động với Script

```bash
cd /var/www/lta/scripts/deployment
sudo ./setup-ssl.sh
```

Script sẽ hỏi:
- 🌐 Tên miền (ví dụ: `example.com`)
- 📧 Email của bạn
- ✅ Có thêm `www.` subdomain không

### Thủ Công

```bash
# Cài đặt certbot (nếu chưa có)
sudo apt install certbot python3-certbot-nginx

# Xin SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

SSL sẽ tự động renewal, kiểm tra bằng:
```bash
sudo certbot certificates
```

---

## 📝 Cấu Trúc Thư Mục Sau Deploy

```
/var/www/lta/
├── backend/
│   ├── dist/              # Code đã build
│   ├── src/               # Source code
│   ├── prisma/            # Database schema
│   ├── uploads/           # User uploads
│   ├── logs/              # Application logs
│   ├── .env               # Environment variables
│   └── package.json
├── frontend/
│   ├── .next/             # Next.js build
│   ├── app/               # Next.js app
│   ├── components/        # React components
│   ├── .env.production    # Production env
│   └── package.json
├── scripts/
│   └── deployment/        # Deployment scripts
├── backups/               # Database backups
├── nginx/                 # Nginx configs
└── ecosystem.config.js    # PM2 config
```

---

## ⚙️ Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=3006
HOST=0.0.0.0
DATABASE_URL=postgresql://lta_user:password@localhost:5432/i_contexchange?schema=public
JWT_SECRET=your-jwt-secret-here
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://lta_user:password@localhost:5432/i_contexchange?schema=public
```

---

## 🎯 Checklist Deploy

### Trước Deploy
- [ ] Backup code hiện tại (nếu có)
- [ ] Backup database
- [ ] Kiểm tra server requirements
- [ ] Chuẩn bị domain & DNS
- [ ] Tạo SSH key cho server

### Trong Deploy
- [ ] Upload scripts
- [ ] Chạy deployment script
- [ ] Clone repository
- [ ] Build backend
- [ ] Build frontend
- [ ] Start PM2
- [ ] Configure Nginx
- [ ] Setup SSL
- [ ] Configure firewall

### Sau Deploy
- [ ] Test ứng dụng
- [ ] Kiểm tra logs
- [ ] Setup monitoring
- [ ] Setup auto-backup
- [ ] Document credentials
- [ ] Test rollback procedure

---

## 📞 Tài Liệu Tham Khảo

### Scripts Có Sẵn
Tất cả scripts trong `scripts/deployment/`:

| Script | Mô Tả | Cách Dùng |
|--------|-------|-----------|
| `ubuntu-deploy.sh` | Deploy lần đầu (full) | `sudo ./ubuntu-deploy.sh` |
| `quick-setup.sh` | Setup nhanh | `sudo ./quick-setup.sh` |
| `update-app.sh` | Update ứng dụng | `sudo ./update-app.sh` |
| `rollback.sh` | Rollback version | `sudo ./rollback.sh` |
| `monitor.sh` | Giám sát hệ thống | `sudo ./monitor.sh` |
| `database.sh` | Quản lý database | `sudo ./database.sh` |
| `setup-ssl.sh` | Setup SSL/HTTPS | `sudo ./setup-ssl.sh` |

### Các Lệnh Thường Dùng

```bash
# PM2
pm2 list                    # Xem danh sách processes
pm2 logs                    # Xem logs
pm2 restart all            # Restart tất cả
pm2 monit                   # Monitor real-time

# Nginx
sudo systemctl restart nginx      # Restart
sudo systemctl status nginx       # Kiểm tra status
sudo nginx -t                     # Test config

# PostgreSQL  
sudo systemctl restart postgresql # Restart
sudo -u postgres psql            # Vào psql console

# System
df -h                       # Disk usage
free -h                     # Memory usage
htop                        # Process monitor
```

---

## ✅ Best Practices

1. **Backup Thường Xuyên**: Setup cron job backup database hàng ngày
2. **Monitor Liên Tục**: Sử dụng PM2 monitor và check logs
3. **Update Bảo Mật**: Chạy `apt update && apt upgrade` định kỳ
4. **SSL Auto-Renewal**: Kiểm tra certbot renew hoạt động
5. **Git Workflow**: Luôn deploy từ branch stable (master/main)
6. **Test Rollback**: Test rollback procedure trước khi cần dùng
7. **Document Changes**: Ghi chép mọi thay đổi quan trọng
8. **Health Checks**: Setup monitoring/alerting cho production

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra logs**: `pm2 logs`
2. **Chạy monitor**: `sudo ./scripts/deployment/monitor.sh --full`
3. **Xem troubleshooting**: Phần "Xử Lý Sự Cố" ở trên

---

**Chúc bạn deploy thành công! 🎉**

> Cập nhật lần cuối: 27/10/2025
