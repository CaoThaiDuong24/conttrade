# ⚡ DEPLOY NHANH - 5 PHÚT

> **Hướng dẫn deploy siêu nhanh cho Ubuntu Server**

---

## 🎯 CÁCH 1: TỰ ĐỘNG HOÀN TOÀN (3 LỆNH)

### **Trên Ubuntu Server:**

```bash
# 1. Tải và chạy script
wget https://raw.githubusercontent.com/CaoThaiDuong24/conttrade/master/scripts/deployment/ubuntu-deploy.sh
chmod +x ubuntu-deploy.sh
sudo ./ubuntu-deploy.sh

# Script sẽ tự động làm TẤT CẢ!
# ✅ Cài Node.js, PostgreSQL, Nginx, PM2
# ✅ Clone code
# ✅ Build backend & frontend  
# ✅ Start ứng dụng
```

**⏱️ Thời gian: 15-20 phút**

**🌐 Truy cập:** `http://your-server-ip`

---

## 🚀 CÁCH 2: DOCKER (4 LỆNH)

### **Trên Ubuntu Server:**

```bash
# 1. Cài Docker
curl -fsSL https://get.docker.com | sudo sh
sudo apt install docker-compose -y

# 2. Clone và cấu hình
git clone https://github.com/CaoThaiDuong24/conttrade.git /var/www/lta
cd /var/www/lta
nano .env  # Điền thông tin database

# 3. Build và start
sudo docker-compose up -d

# 4. Chạy migrations
sudo docker-compose exec backend npx prisma migrate deploy
```

**⏱️ Thời gian: 10-15 phút**

**🌐 Truy cập:** `http://your-server-ip`

---

## 🔧 FILE .env CẦN TẠO

### **Cho Docker (.env trong thư mục gốc):**

```bash
# PostgreSQL
POSTGRES_USER=lta_user
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=i_contexchange

# JWT
JWT_SECRET=change-this-secret-key

# URLs
FRONTEND_URL=http://your-server-ip:3000
NEXT_PUBLIC_API_URL=http://your-server-ip:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://your-server-ip:3000
```

---

## ✅ KIỂM TRA SAU KHI DEPLOY

```bash
# Cách 1 (PM2)
pm2 list
pm2 logs

# Cách 2 (Docker)
sudo docker-compose ps
sudo docker-compose logs
```

---

## 🔄 CẬP NHẬT SAU NÀY

```bash
# Cách 1 (PM2)
cd /var/www/lta
sudo ./scripts/deployment/update-app.sh

# Cách 2 (Docker)
cd /var/www/lta
git pull
sudo docker-compose up -d --build
```

---

## 🆘 NẾU GẶP LỖI

```bash
# Xem logs
pm2 logs  # hoặc
sudo docker-compose logs -f

# Restart
pm2 restart all  # hoặc
sudo docker-compose restart
```

---

**🎉 XONG! Đơn giản vậy thôi!**

> Chi tiết đầy đủ xem: `BUILD-AND-DEPLOY.md`
