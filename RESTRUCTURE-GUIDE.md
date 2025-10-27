# Hướng Dẫn Tái Cấu Trúc Project

## 🎯 Mục Đích

Tái cấu trúc từ cấu trúc **mixed** (frontend + backend cùng root) sang cấu trúc **separated** (frontend/ và backend/ riêng biệt).

---

## 📁 Cấu Trúc Hiện Tại (Before)

```
Web/
├── app/              # Frontend (Next.js)
├── components/       # Frontend
├── hooks/            # Frontend
├── lib/              # Frontend
├── types/            # Frontend
├── backend/          # Backend (Fastify)
├── package.json      # Frontend dependencies
└── ...
```

**Vấn đề:**
- Frontend và backend mixed ở root level
- Khó phân biệt code frontend/backend
- Deploy phức tạp
- Không theo best practices

---

## 📁 Cấu Trúc Mới (After)

```
LTA-PROJECT/
├── frontend/         # 🎨 All frontend code
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── package.json
│   ├── next.config.mjs
│   └── .env
│
├── backend/          # ⚙️ All backend code
│   ├── src/
│   ├── prisma/
│   ├── dist/
│   ├── package.json
│   └── .env
│
├── scripts/          # 🚀 Deployment scripts
├── nginx/            # 🌐 Nginx config
├── docker-compose.yml
└── ecosystem.config.js
```

**Ưu điểm:**
- ✅ Rõ ràng, dễ quản lý
- ✅ Deploy độc lập
- ✅ Scale riêng biệt
- ✅ Theo best practices
- ✅ Dễ CI/CD

---

## 🔄 Cách Tái Cấu Trúc

### Tự Động (Recommended)

**PowerShell (Windows):**
```powershell
.\scripts\restructure-project.ps1
```

**Bash (Linux/Mac):**
```bash
chmod +x scripts/restructure-project.sh
bash scripts/restructure-project.sh
```

Script sẽ tự động:
1. Tạo thư mục `frontend/`
2. Move tất cả frontend code vào `frontend/`
3. Copy config files
4. Update package.json names
5. Backend giữ nguyên ở `backend/`

### Thủ Công (Manual)

```bash
# 1. Create frontend directory
mkdir frontend

# 2. Move frontend files
mv app components hooks lib types messages public styles i18n frontend/

# 3. Copy config files
cp package.json next.config.mjs tsconfig.json frontend/
cp .env.example .env frontend/

# 4. Backend already in backend/ - no change needed
```

---

## ✅ Sau Khi Tái Cấu Trúc

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Update Environment Files

**frontend/.env:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

**backend/.env:**
```env
PORT=3006
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3000
```

### 3. Test Development Mode

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# http://localhost:3006
```

### 4. Update Import Paths (If Needed)

Nếu có import absolute paths, có thể cần update:
- `@/components/...` → Should still work
- `../lib/...` → Should still work

---

## 🚀 Deploy Sau Khi Restructure

### PM2 Deploy
```bash
# All files updated to use new structure
bash scripts/deployment/deploy.sh
```

### Docker Deploy
```bash
# docker-compose.yml updated to use frontend/ and backend/
bash scripts/deployment/docker-deploy.sh
```

---

## 📝 Files Đã Được Update

Các files sau đã được update để work với cấu trúc mới:

✅ `ecosystem.config.js` - PM2 config  
✅ `docker-compose.yml` - Docker orchestration  
✅ `Dockerfile.frontend` - Frontend Docker build context  
✅ `Dockerfile.backend` - Backend Docker build context  
✅ `scripts/deployment/build.sh` - Build script  

---

## ⚠️ Lưu Ý

1. **Backup trước khi restructure:**
   ```bash
   git add .
   git commit -m "Before restructure"
   ```

2. **Không làm mất file:**
   - Script chỉ **move** và **copy**, không delete
   - Files gốc vẫn còn ở root (có thể xóa sau)

3. **Test kỹ sau khi restructure:**
   - Test frontend: `cd frontend && npm run dev`
   - Test backend: `cd backend && npm run dev`
   - Test build: `bash scripts/deployment/build.sh`

4. **Git ignore:**
   - `frontend/node_modules/`
   - `frontend/.next/`
   - `backend/node_modules/`
   - `backend/dist/`

---

## 🆘 Rollback

Nếu có vấn đề:

```bash
# Git rollback
git reset --hard HEAD

# Or restore from backup
git checkout HEAD -- .
```

---

## 📞 Support

Nếu gặp lỗi khi restructure:
1. Check script output cho errors
2. Verify files đã move đúng chưa
3. Test lại dependencies
4. Check import paths

---

**Status:** ✅ Ready to Restructure  
**Script:** `scripts/restructure-project.ps1` (Windows) hoặc `scripts/restructure-project.sh` (Linux/Mac)
