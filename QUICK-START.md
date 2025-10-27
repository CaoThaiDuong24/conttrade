# Quick Start Guide - Ubuntu Deployment

## Cài Đặt Nhanh (PM2)

### 1. Cài Đặt Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

### 2. Setup Database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE i_contexchange;
CREATE USER postgres WITH PASSWORD '240499';
GRANT ALL PRIVILEGES ON DATABASE i_contexchange TO postgres;
\q
```

### 3. Clone và Config
```bash
git clone https://github.com/your-repo/conttrade.git
cd conttrade

# Frontend environment
cp .env.example .env
nano .env  # Chỉnh sửa cấu hình

# Backend environment
cp backend/.env.example backend/.env
nano backend/.env  # Chỉnh sửa cấu hình
```

### 4. Deploy
```bash
# Make scripts executable
chmod +x scripts/deployment/*.sh

# Build và deploy
bash scripts/deployment/deploy.sh
```

### 5. Verify
```bash
pm2 status
pm2 logs
```

Truy cập: `http://your-server-ip:3000`

---

## Cài Đặt Nhanh (Docker)

### 1. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone và Config
```bash
git clone https://github.com/your-repo/conttrade.git
cd conttrade

cp .env.example .env
cp backend/.env.example backend/.env
# Edit các file .env
```

### 3. Deploy
```bash
chmod +x scripts/deployment/*.sh
bash scripts/deployment/docker-deploy.sh
```

### 4. Verify
```bash
docker-compose ps
docker-compose logs -f
```

Truy cập: `http://your-server-ip`

---

## Commands Hữu Ích

### PM2
```bash
pm2 status              # Xem status
pm2 logs                # Xem logs
pm2 restart all         # Restart
pm2 monit               # Monitor
```

### Docker
```bash
docker-compose ps       # Status
docker-compose logs -f  # Logs
docker-compose restart  # Restart
```

### Update Code
```bash
# PM2
git pull && bash scripts/deployment/deploy.sh

# Docker
git pull && bash scripts/deployment/docker-deploy.sh
```

---

Xem chi tiết: [DEPLOYMENT.md](./DEPLOYMENT.md)
