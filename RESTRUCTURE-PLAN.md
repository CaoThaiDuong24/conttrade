# LTA Project - Restructured for Deployment

## 📁 Cấu Trúc Thư Mục Mới (Chuẩn Production)

```
LTA-PROJECT/
│
├── 📁 frontend/                     # Next.js Application
│   ├── 📁 app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── [locale]/
│   │   └── api/
│   ├── 📁 components/
│   ├── 📁 hooks/
│   ├── 📁 lib/
│   ├── 📁 types/
│   ├── 📁 messages/
│   ├── 📁 public/
│   ├── 📁 styles/
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env.production.example
│
├── 📁 backend/                      # Fastify API
│   ├── 📁 src/
│   │   ├── server.ts
│   │   ├── 📁 routes/
│   │   ├── 📁 controllers/
│   │   ├── 📁 lib/
│   │   └── 📁 middleware/
│   ├── 📁 prisma/
│   ├── 📁 scripts/
│   ├── 📁 dist/
│   ├── 📁 uploads/
│   ├── 📁 logs/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env.production.example
│
├── 📁 nginx/                        # Nginx Configuration
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
│
├── 📁 scripts/                      # Deployment Scripts
│   └── deployment/
│       ├── build.sh
│       ├── deploy.sh
│       ├── docker-deploy.sh
│       ├── backup.sh
│       └── restore.sh
│
├── 📁 docs/                         # Documentation
│
├── 📄 docker-compose.yml
├── 📄 Dockerfile.frontend
├── 📄 Dockerfile.backend
├── 📄 .dockerignore
├── 📄 .gitignore
├── 📄 ecosystem.config.js          # PM2 Config
├── 📄 DEPLOYMENT.md
├── 📄 QUICK-START.md
└── 📄 README.md
```

---

## 🔄 Workflow Development

### Development Mode

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Running on http://localhost:3006
```

### Production Build

```bash
# Build Frontend
cd frontend && npm run build

# Build Backend
cd backend && npm run build
```

---

## 🚀 Deployment Methods

### 1. PM2 Deployment

**Structure on Server:**
```
/var/www/lta-project/
├── frontend/
├── backend/
├── scripts/
└── ecosystem.config.js
```

**Deploy:**
```bash
bash scripts/deployment/deploy.sh
```

### 2. Docker Deployment

**All in Containers:**
```
- frontend container (port 3000)
- backend container (port 3006)
- postgres container (port 5432)
- nginx container (port 80/443)
```

**Deploy:**
```bash
bash scripts/deployment/docker-deploy.sh
```

---

## 📋 Migration Steps (Hiện Tại → Mới)

### Cấu Trúc Hiện Tại (Problematic):
```
Web/
├── app/           # Frontend mixed
├── backend/       # Backend separate
├── components/    # Frontend mixed
├── lib/          # Frontend mixed
└── ...           # All mixed together
```

### Cấu Trúc Mới (Clean):
```
LTA-PROJECT/
├── frontend/      # All frontend code
└── backend/       # All backend code (đã có)
```

Bạn có muốn tôi tạo script để **tự động di chuyển** các thư mục không?
