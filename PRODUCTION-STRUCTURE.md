# Cấu Trúc Dự Án - LTA Project (Restructured for Production)

```
Web/
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── [locale]/                    # i18n routes
│   ├── api/                         # Next.js API routes
│   └── ...
│
├── 📁 backend/                      # Fastify Backend API
│   ├── 📁 src/
│   │   ├── server.ts                # Entry point
│   │   ├── 📁 routes/               # API routes
│   │   ├── 📁 controllers/          # Business logic
│   │   ├── 📁 lib/                  # Utilities
│   │   └── 📁 middleware/           # Express/Fastify middleware
│   ├── 📁 prisma/                   # Database schema
│   ├── 📁 dist/                     # Compiled JS (gitignored)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env.production.example
│   └── uploads/                     # User uploads (gitignored)
│
├── 📁 components/                   # React components
│   ├── ui/                          # shadcn/ui components
│   ├── admin/                       # Admin components
│   ├── layout/                      # Layout components
│   └── ...
│
├── 📁 lib/                          # Frontend utilities
│   ├── api.ts                       # API client
│   ├── utils.ts
│   └── ...
│
├── 📁 hooks/                        # React hooks
│
├── 📁 types/                        # TypeScript types
│
├── 📁 messages/                     # i18n translations
│   ├── en.json
│   └── vi.json
│
├── 📁 public/                       # Static files
│
├── 📁 nginx/                        # Nginx configuration
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
│
├── 📁 scripts/
│   └── 📁 deployment/               # Deployment scripts
│       ├── build.sh                 # Build script
│       ├── deploy.sh                # PM2 deployment
│       └── docker-deploy.sh         # Docker deployment
│
├── 📁 docs/                         # Documentation
│
├── 📄 Dockerfile.frontend           # Frontend Docker image
├── 📄 Dockerfile.backend            # Backend Docker image
├── 📄 docker-compose.yml            # Docker Compose config
├── 📄 .dockerignore
│
├── 📄 ecosystem.config.js           # PM2 configuration
│
├── 📄 .env.example                  # Frontend env example
├── 📄 .env.production.example       # Frontend production env
│
├── 📄 next.config.mjs               # Next.js configuration (updated)
├── 📄 package.json                  # Frontend dependencies
├── 📄 tsconfig.json
│
├── 📄 DEPLOYMENT.md                 # 📖 Deployment guide
├── 📄 QUICK-START.md                # 📖 Quick start guide
├── 📄 README.md
│
└── 📄 .gitignore

```

## 🎯 Cấu Trúc Deployment

### Môi Trường Development
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3006
- Database: localhost:5432
```

### Môi Trường Production (Ubuntu)

#### Option 1: PM2 Deployment
```
- Frontend: PM2 cluster (port 3000)
- Backend: PM2 cluster (port 3006)
- Nginx: Reverse proxy (port 80/443)
- Database: PostgreSQL (port 5432)
```

#### Option 2: Docker Deployment
```
- Frontend: Docker container (port 3000)
- Backend: Docker container (port 3006)
- Nginx: Docker container (port 80/443)
- Database: Docker container (port 5432)
- All in Docker network
```

## 📦 Files Quan Trọng

### Configuration Files
- `ecosystem.config.js` - PM2 process manager config
- `docker-compose.yml` - Docker orchestration
- `Dockerfile.frontend` - Frontend Docker build
- `Dockerfile.backend` - Backend Docker build
- `nginx/conf.d/default.conf` - Nginx reverse proxy

### Environment Files
- `.env.example` - Frontend env template
- `.env.production.example` - Frontend production env template
- `backend/.env.example` - Backend env template
- `backend/.env.production.example` - Backend production env template

### Deployment Scripts
- `scripts/deployment/build.sh` - Build both frontend & backend
- `scripts/deployment/deploy.sh` - Deploy with PM2
- `scripts/deployment/docker-deploy.sh` - Deploy with Docker

### Documentation
- `DEPLOYMENT.md` - Chi tiết deployment lên Ubuntu
- `QUICK-START.md` - Hướng dẫn nhanh

## 🚀 Deployment Methods

### 1. PM2 (Recommended cho VPS/Dedicated)
**Ưu điểm:**
- Lightweight, sử dụng ít tài nguyên
- Hot reload, zero-downtime deployment
- Built-in monitoring
- Dễ debug và xem logs

**Nhược điểm:**
- Phải cài đặt dependencies trên server
- Cần quản lý PostgreSQL riêng

### 2. Docker (Recommended cho Container-based)
**Ưu điểm:**
- Portable, chạy ở đâu cũng giống nhau
- Isolated, không conflict dependencies
- Dễ scale
- Include cả database

**Nhược điểm:**
- Resource overhead
- Phức tạp hơn cho debugging

## 🔄 Workflow Deployment

### Development
```bash
# Frontend
npm run dev

# Backend
cd backend && npm run dev
```

### Production Build
```bash
# Build all
bash scripts/deployment/build.sh

# Or manual:
npm run build          # Frontend
cd backend && npm run build  # Backend
```

### Deploy to Ubuntu

**PM2:**
```bash
bash scripts/deployment/deploy.sh
```

**Docker:**
```bash
bash scripts/deployment/docker-deploy.sh
```

## 📝 Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

### Backend (backend/.env)
```env
NODE_ENV=production
PORT=3006
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:3000
```

## 🔒 Security Checklist

- [ ] Đổi tất cả passwords mặc định
- [ ] Generate JWT_SECRET mới
- [ ] Generate NEXTAUTH_SECRET mới
- [ ] Setup firewall (ufw)
- [ ] Enable HTTPS/SSL
- [ ] Secure PostgreSQL
- [ ] Limit file upload size
- [ ] Enable CORS properly
- [ ] Use environment variables
- [ ] Don't commit .env files

## 📊 Monitoring

### PM2
```bash
pm2 monit              # Real-time monitor
pm2 logs               # View logs
pm2 status             # Process status
```

### Docker
```bash
docker-compose logs -f # Follow logs
docker-compose ps      # Container status
docker stats           # Resource usage
```

## 🆘 Support

Xem chi tiết tại:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [QUICK-START.md](./QUICK-START.md) - Quick start guide
- [README.md](./README.md) - Project overview
