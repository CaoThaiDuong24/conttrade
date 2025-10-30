# 📦 CÁC BƯỚC DEPLOY LÊN UBUNTU SERVER

## 🎯 TÓM TẮT NHANH

**Có 2 cách deploy:**
1. **Tự động từ GitHub** (Khuyến nghị ⭐) - 3 lệnh
2. **Docker Compose** - 4 lệnh

---

## 🔥 CÁCH 1: TỰ ĐỘNG TỪ GITHUB (KHUYẾN NGHỊ)

### **A. Trên Máy Windows (1 lần duy nhất):**

```powershell
# Chạy script để push code lên GitHub
.\push-to-github.ps1
```

Script sẽ:
- Add tất cả files
- Commit với message tự động
- Push lên GitHub

### **B. Trên Ubuntu Server:**

#### **B1. Deploy lần đầu (1 lần duy nhất):**

```bash
# Tải và chạy script deploy
wget https://raw.githubusercontent.com/CaoThaiDuong24/conttrade/master/scripts/deployment/ubuntu-deploy.sh
chmod +x ubuntu-deploy.sh
sudo ./ubuntu-deploy.sh
```

⏱️ **Đợi 15-20 phút** - Script tự động:
- ✅ Cài Node.js, PostgreSQL, Nginx, PM2
- ✅ Clone code từ GitHub
- ✅ Tạo database
- ✅ Build backend & frontend
- ✅ Start ứng dụng

#### **B2. Cấu hình .env:**

```bash
cd /var/www/lta

# Tạo .env tự động (khuyến nghị)
sudo ./scripts/deployment/create-env.sh

# Hoặc tạo thủ công
sudo nano backend/.env.production
sudo nano frontend/.env.production
```

#### **B3. Build và Start:**

```bash
# Build backend
cd /var/www/lta/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Build frontend
cd ../frontend
npm install
npm run build

# Start PM2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **B4. Kiểm tra:**

```bash
pm2 list
pm2 logs
```

🌐 **Truy cập:** `http://your-server-ip`

### **C. Cập nhật lần sau (khi code thay đổi):**

**Trên Windows:**
```powershell
.\push-to-github.ps1
```

**Trên Ubuntu:**
```bash
cd /var/www/lta
sudo ./scripts/deployment/update-app.sh
```

⏱️ **1-2 phút** - Zero downtime!

---

## 🐳 CÁCH 2: DOCKER COMPOSE

### **A. Trên Ubuntu Server:**

#### **A1. Cài Docker:**

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo apt install docker-compose -y
```

#### **A2. Clone Code:**

```bash
git clone https://github.com/CaoThaiDuong24/conttrade.git /var/www/lta
cd /var/www/lta
```

#### **A3. Tạo .env:**

```bash
# Tự động
sudo ./scripts/deployment/create-env.sh

# Hoặc thủ công
nano .env
```

**Nội dung .env:**
```bash
POSTGRES_USER=lta_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=i_contexchange
JWT_SECRET=your-secret-key
FRONTEND_URL=http://your-server-ip:3000
NEXT_PUBLIC_API_URL=http://your-server-ip:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://your-server-ip:3000
```

#### **A4. Build và Start:**

```bash
# Build
sudo docker-compose build

# Start
sudo docker-compose up -d

# Run migrations
sudo docker-compose exec backend npx prisma migrate deploy

# Kiểm tra
sudo docker-compose ps
sudo docker-compose logs -f
```

🌐 **Truy cập:** `http://your-server-ip`

### **B. Cập nhật lần sau:**

```bash
cd /var/www/lta
git pull
sudo docker-compose up -d --build
```

---

## ✅ CHECKLIST

### Trước Deploy:
- [ ] Đã push code lên GitHub
- [ ] Có SSH access vào Ubuntu server
- [ ] Server đáp ứng yêu cầu (2GB RAM, 20GB disk)

### Trong Deploy:
- [ ] Script chạy không lỗi
- [ ] Database được tạo
- [ ] Build backend thành công
- [ ] Build frontend thành công
- [ ] PM2/Docker start thành công

### Sau Deploy:
- [ ] `pm2 list` hoặc `docker-compose ps` hiện OK
- [ ] Không có lỗi trong logs
- [ ] Truy cập được http://server-ip
- [ ] Test login thành công

---

## 🔍 KIỂM TRA & DEBUG

### Xem Logs:

```bash
# PM2
pm2 logs
pm2 logs lta-backend
pm2 logs lta-frontend

# Docker
sudo docker-compose logs -f
sudo docker-compose logs backend
sudo docker-compose logs frontend
```

### Restart:

```bash
# PM2
pm2 restart all

# Docker
sudo docker-compose restart
```

### Kiểm tra Services:

```bash
# PM2
pm2 list
pm2 monit

# Docker
sudo docker-compose ps
sudo docker ps

# PostgreSQL
sudo systemctl status postgresql
```

---

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### 1. Port đã được sử dụng:

```bash
# Tìm process
sudo lsof -i :3000
sudo lsof -i :3006

# Kill
sudo kill -9 <PID>

# Hoặc restart
pm2 restart all
```

### 2. Database connection error:

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
sudo -u postgres psql -d i_contexchange -U lta_user -W
```

### 3. Build error:

```bash
# Xóa node_modules và build lại
cd /var/www/lta/backend
rm -rf node_modules dist
npm install
npm run build

cd /var/www/lta/frontend
rm -rf node_modules .next
npm install
npm run build
```

### 4. Không truy cập được:

```bash
# Kiểm tra firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3006/tcp

# Kiểm tra ports
sudo netstat -tulpn | grep -E ':(80|3000|3006)'
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **Chi tiết đầy đủ:** `BUILD-AND-DEPLOY.md`
- **Deploy nhanh:** `QUICK-DEPLOY.md`
- **Hướng dẫn cũ:** `DEPLOYMENT-GUIDE.md`

---

## 🆘 CẦN TRỢ GIÚP?

### Chạy Monitor:

```bash
cd /var/www/lta/scripts/deployment
sudo ./monitor.sh --full
```

### Xem tất cả scripts:

```bash
ls -lh /var/www/lta/scripts/deployment/
```

**Scripts có sẵn:**
- `ubuntu-deploy.sh` - Deploy lần đầu
- `update-app.sh` - Update code
- `create-env.sh` - Tạo file .env
- `monitor.sh` - Giám sát hệ thống
- `database.sh` - Quản lý database
- `rollback.sh` - Rollback về version cũ

---

## 🎉 HOÀN THÀNH!

Sau khi deploy xong:

1. ✅ Truy cập: `http://your-server-ip`
2. ✅ Test login
3. ✅ Setup SSL (optional): `sudo ./scripts/deployment/setup-ssl.sh`
4. ✅ Setup auto backup: `sudo crontab -e`

**Chúc mừng bạn đã deploy thành công! 🚀**

---

> Cập nhật: 30/10/2025
