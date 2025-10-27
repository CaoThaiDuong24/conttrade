# Hướng Dẫn Deploy Lên Ubuntu Server

## 📋 Mục Lục
1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt Môi Trường](#cài-đặt-môi-trường)
3. [Deploy Với PM2 (Recommended)](#deploy-với-pm2)
4. [Deploy Với Docker](#deploy-với-docker)
5. [Cấu Hình Nginx](#cấu-hình-nginx)
6. [SSL/HTTPS Setup](#ssl-https-setup)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu Cầu Hệ Thống

### Tối Thiểu
- Ubuntu 20.04 LTS hoặc mới hơn
- RAM: 2GB
- CPU: 2 cores
- Disk: 20GB SSD

### Khuyến Nghị
- Ubuntu 22.04 LTS
- RAM: 4GB+
- CPU: 4 cores
- Disk: 50GB SSD

---

## 🔧 Cài Đặt Môi Trường

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Cài Đặt Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v20.x
npm --version
```

### 3. Cài Đặt PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo database và user
sudo -u postgres psql
```

Trong PostgreSQL console:
```sql
CREATE DATABASE i_contexchange;
CREATE USER postgres WITH PASSWORD '240499';
GRANT ALL PRIVILEGES ON DATABASE i_contexchange TO postgres;
\q
```

### 4. Cài Đặt Git
```bash
sudo apt install -y git
```

### 5. Clone Project
```bash
cd /var/www
sudo git clone https://github.com/your-repo/conttrade.git
sudo chown -R $USER:$USER conttrade
cd conttrade
```

---

## 🚀 Deploy Với PM2 (Recommended)

### 1. Cài Đặt PM2
```bash
sudo npm install -g pm2
```

### 2. Setup Environment Variables

**Frontend (.env):**
```bash
cp .env.example .env
nano .env
```

Cấu hình:
```env
NEXT_PUBLIC_API_URL=http://your-server-ip:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://your-server-ip:3000
DATABASE_URL=postgresql://postgres:240499@localhost:5432/i_contexchange?schema=public
NEXTAUTH_SECRET=your-secret-key-here
```

**Backend (backend/.env):**
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Cấu hình:
```env
NODE_ENV=production
PORT=3006
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:240499@localhost:5432/i_contexchange?schema=public
JWT_SECRET=your-jwt-secret-here
CORS_ORIGIN=http://your-server-ip:3000
```

### 3. Chạy Build Script
```bash
chmod +x scripts/deployment/*.sh
bash scripts/deployment/build.sh
```

### 4. Run Database Migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
cd ..
```

### 5. Deploy với PM2
```bash
bash scripts/deployment/deploy.sh
```

### 6. Verify Deployment
```bash
pm2 status
pm2 logs
```

### 7. Setup PM2 Startup
```bash
pm2 startup
# Copy và chạy command mà PM2 suggest
pm2 save
```

### Các Lệnh PM2 Hữu Ích
```bash
pm2 status              # Xem status
pm2 logs                # Xem logs
pm2 logs lta-backend    # Xem logs backend
pm2 logs lta-frontend   # Xem logs frontend
pm2 restart all         # Restart tất cả
pm2 restart lta-backend # Restart backend
pm2 stop all            # Stop tất cả
pm2 delete all          # Xóa tất cả
pm2 monit               # Monitor real-time
```

---

## 🐳 Deploy Với Docker

### 1. Cài Đặt Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Setup Environment
```bash
cp .env.example .env
cp backend/.env.example backend/.env
# Edit files với cấu hình của bạn
```

### 3. Deploy với Docker
```bash
chmod +x scripts/deployment/docker-deploy.sh
bash scripts/deployment/docker-deploy.sh
```

### 4. Verify Deployment
```bash
docker-compose ps
docker-compose logs -f
```

### Các Lệnh Docker Hữu Ích
```bash
docker-compose ps                    # Xem status
docker-compose logs -f               # Xem logs real-time
docker-compose logs -f backend       # Logs backend
docker-compose logs -f frontend      # Logs frontend
docker-compose restart               # Restart tất cả
docker-compose restart backend       # Restart backend
docker-compose down                  # Stop và xóa containers
docker-compose up -d                 # Start lại
docker-compose exec backend sh       # Access backend container
docker-compose exec postgres psql -U postgres -d i_contexchange  # Access DB
```

---

## 🌐 Cấu Hình Nginx

### 1. Cài Đặt Nginx
```bash
sudo apt install -y nginx
```

### 2. Setup Nginx Config

**Nếu dùng PM2:**
```bash
sudo nano /etc/nginx/sites-available/lta
```

Paste config:
```nginx
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:3006;
}

server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20M;

    # API Backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend uploads
    location /uploads/ {
        proxy_pass http://backend;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Nếu dùng Docker:**
Docker Compose đã include Nginx, không cần cài thêm.

### 3. Enable và Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/lta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 SSL/HTTPS Setup

### 1. Cài Đặt Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Lấy SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-Renewal Setup
```bash
sudo systemctl status certbot.timer
# Should be active
```

Test renewal:
```bash
sudo certbot renew --dry-run
```

---

## 🔥 Firewall Setup

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 📊 Monitoring

### Setup Monitoring với PM2
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Check Logs
```bash
# PM2 logs
pm2 logs --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

---

## 🐛 Troubleshooting

### Backend không start
```bash
cd backend
npm run build
node dist/server.js  # Test directly
```

### Frontend không start
```bash
npm run build
npm start  # Test directly
```

### Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d i_contexchange -h localhost
```

### Port already in use
```bash
# Find process using port 3006
sudo lsof -i :3006
# Kill process
sudo kill -9 <PID>

# Find process using port 3000
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Nginx errors
```bash
# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### PM2 issues
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js

# Clear logs
pm2 flush
```

---

## 🔄 Update Application

### PM2 Deployment
```bash
cd /var/www/conttrade
git pull origin master
bash scripts/deployment/deploy.sh
```

### Docker Deployment
```bash
cd /var/www/conttrade
git pull origin master
bash scripts/deployment/docker-deploy.sh
```

---

## 📝 Notes

1. **Thay đổi passwords mặc định** trong production
2. **Backup database** thường xuyên
3. **Monitor logs** để phát hiện lỗi sớm
4. **Update hệ thống** định kỳ
5. **Sử dụng environment variables** cho sensitive data

---

## 📞 Support

Nếu gặp vấn đề, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Database: `sudo -u postgres psql`
4. System resources: `htop` hoặc `top`
