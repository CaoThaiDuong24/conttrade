# LTA Project - Production Deployment Structure

## ✅ Đã Hoàn Thành Tái Cấu Trúc

Dự án đã được tái cấu trúc hoàn toàn để sẵn sàng deploy lên **Ubuntu Server** với các phương pháp:

### 🎯 2 Phương Pháp Deploy

#### 1️⃣ **PM2 Deployment** (Khuyến nghị cho VPS/Dedicated Server)
- Lightweight, performance cao
- Cluster mode cho cả frontend & backend
- Auto-restart, zero-downtime deployment
- Dễ monitor và debug

#### 2️⃣ **Docker Deployment** (Khuyến nghị cho Container-based)
- Portable, environment độc lập
- Bao gồm cả Database
- Dễ scale và replicate
- Consistent across environments

---

## 📦 Files Đã Tạo

### Configuration Files
✅ `ecosystem.config.js` - PM2 process manager config  
✅ `docker-compose.yml` - Docker orchestration  
✅ `Dockerfile.frontend` - Frontend Docker image  
✅ `Dockerfile.backend` - Backend Docker image  
✅ `.dockerignore` - Docker build optimization  

### Environment Templates
✅ `.env.example` - Frontend development environment  
✅ `.env.production.example` - Frontend production environment  
✅ `backend/.env.example` - Backend development environment  
✅ `backend/.env.production.example` - Backend production environment  

### Nginx Configuration
✅ `nginx/nginx.conf` - Main Nginx config  
✅ `nginx/conf.d/default.conf` - Site configuration với SSL support  

### Deployment Scripts (Ubuntu)
✅ `scripts/deployment/build.sh` - Build cả frontend & backend  
✅ `scripts/deployment/deploy.sh` - Deploy với PM2  
✅ `scripts/deployment/docker-deploy.sh` - Deploy với Docker  
✅ `scripts/deployment/health-check.sh` - Health monitoring  
✅ `scripts/deployment/backup.sh` - Database & uploads backup  
✅ `scripts/deployment/restore.sh` - Restore from backup  

### Documentation
✅ `DEPLOYMENT.md` - Chi tiết hướng dẫn deploy đầy đủ  
✅ `QUICK-START.md` - Hướng dẫn deploy nhanh  
✅ `PRODUCTION-STRUCTURE.md` - Cấu trúc production  
✅ `DEPLOYMENT-CHECKLIST.md` - Checklist để verify deployment  

### Updated Files
✅ `next.config.mjs` - Thêm `output: 'standalone'` cho Docker  
✅ `.gitignore` - Updated để keep .env.example files  

---

## 🚀 Quick Start Deploy

### Phương Pháp 1: PM2 (Recommended)

```bash
# 1. Clone project
git clone <your-repo>
cd Web

# 2. Setup environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit các file .env với production values

# 3. Deploy
chmod +x scripts/deployment/*.sh
bash scripts/deployment/deploy.sh

# 4. Verify
pm2 status
pm2 logs
```

### Phương Pháp 2: Docker

```bash
# 1. Clone project
git clone <your-repo>
cd Web

# 2. Setup environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit các file .env với production values

# 3. Deploy
chmod +x scripts/deployment/*.sh
bash scripts/deployment/docker-deploy.sh

# 4. Verify
docker-compose ps
docker-compose logs -f
```

---

## 📁 Cấu Trúc Thư Mục Production

```
Web/
├── app/                  # Next.js frontend
├── backend/              # Fastify API
│   ├── src/             # Source code
│   ├── dist/            # Compiled (production)
│   ├── uploads/         # User uploads
│   └── logs/            # Application logs
├── nginx/               # Nginx configs
├── scripts/deployment/  # Deploy scripts
├── Dockerfile.*         # Docker images
├── docker-compose.yml   # Docker orchestration
├── ecosystem.config.js  # PM2 config
├── .env.example         # Environment templates
└── DEPLOYMENT.md        # Documentation
```

---

## 🔐 Security Checklist

- [x] Environment variables separated (development/production)
- [x] Sensitive data in .env (gitignored)
- [x] .env.example provided cho reference
- [x] Nginx security headers configured
- [x] CORS configured
- [x] SSL/HTTPS ready (commented, uncomment khi có certificate)
- [x] File upload limits set
- [x] Docker security best practices

---

## 📊 Monitoring & Maintenance

### Health Check
```bash
bash scripts/deployment/health-check.sh
```

### Backup
```bash
# Create backup
bash scripts/deployment/backup.sh

# Restore from backup
bash scripts/deployment/restore.sh 20250127_143000
```

### Logs
```bash
# PM2
pm2 logs
pm2 logs lta-backend
pm2 logs lta-frontend

# Docker
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🎯 Next Steps

1. **Đọc Documentation**
   - `DEPLOYMENT.md` - Hướng dẫn chi tiết
   - `QUICK-START.md` - Bắt đầu nhanh
   - `DEPLOYMENT-CHECKLIST.md` - Verify deployment

2. **Setup Server**
   - Cài đặt Ubuntu 20.04+
   - Install dependencies (Node.js, PostgreSQL, PM2/Docker)
   - Configure firewall

3. **Configure Environment**
   - Copy .env.example to .env
   - Update với production values
   - Generate secure secrets

4. **Deploy**
   - Chọn phương pháp (PM2 hoặc Docker)
   - Run deployment script
   - Verify application

5. **Setup Monitoring**
   - Configure PM2 logs hoặc Docker logs
   - Setup health checks
   - Configure backups

---

## 📞 Support

Nếu gặp vấn đề khi deploy:

1. Check logs: `pm2 logs` hoặc `docker-compose logs -f`
2. Verify environment variables
3. Check database connection
4. Run health check: `bash scripts/deployment/health-check.sh`
5. Xem Troubleshooting section trong `DEPLOYMENT.md`

---

## ✨ Features

- ✅ Production-ready configuration
- ✅ Zero-downtime deployment (PM2 cluster mode)
- ✅ Auto-restart on failure
- ✅ Nginx reverse proxy with SSL support
- ✅ Docker containerization
- ✅ Database migration scripts
- ✅ Automated backups
- ✅ Health monitoring
- ✅ Comprehensive documentation

---

**Deployment Date:** 2025-01-27  
**Status:** ✅ Ready for Production  
**Tested On:** Ubuntu 22.04 LTS
