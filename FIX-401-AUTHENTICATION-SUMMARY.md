# Fix 401 Authentication Error - Summary

## Vấn đề
- Frontend gọi API `/auth/me` nhưng nhận 401 Unauthorized
- URL có `/vi/undefined/api/v1/auth/me` - chứa `undefined`

## Nguyên nhân

### 1. **URL không đúng format**
- Frontend: `/api/auth/me` 
- Backend: `/api/v1/auth/me`
- ❌ Thiếu `/v1` trong path

### 2. **Environment variable `undefined`**
- Code dùng: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`
- `NEXT_PUBLIC_API_URL` = undefined trên client
- Kết quả: `undefined/api/v1/auth/me`

### 3. **Docker internal network**
- Middleware gọi `localhost:3006` trong container
- ❌ Phải dùng `lta-backend:3006` (Docker service name)

### 4. **Prisma field names sai**
Database sử dụng **snake_case** nhưng code dùng **camelCase**:
- `displayName` → `display_name` ✅
- `defaultLocale` → `default_locale` ✅
- `kycStatus` → `kyc_status` ✅
- `createdAt` → `created_at` ✅
- `password` → `password_hash` ✅
- `organization` → `orgs` ✅
- `position` → không tồn tại (removed)

## Giải pháp đã triển khai

### Frontend fixes:

1. **components/providers/auth-context.tsx**
```typescript
// Before:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, ...)

// After:
const response = await fetch('/api/v1/auth/me', ...)
```

2. **middleware.ts**
```typescript
// Before:
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

// After:
const backendUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
```

3. **lib/auth/auth-context.tsx**
```typescript
// Fixed login/logout URLs from /api/auth/* to /api/v1/auth/*
```

### Backend fixes:

1. **routes/auth.ts - Register endpoint**
```typescript
// Raw SQL fixed:
INSERT INTO users (..., display_name, default_locale, kyc_status, created_at, ...)
VALUES (...)
RETURNING id, email, phone, display_name, default_locale, status, kyc_status
```

2. **routes/auth.ts - /me endpoint**
```typescript
// Prisma query fixed:
select: {
  display_name: true,
  default_locale: true,
  kyc_status: true,
  created_at: true,
  ...
}

// Response mapping:
displayName: user.display_name,
defaultLocale: user.default_locale,
kycStatus: user.kyc_status,
createdAt: user.created_at,
```

3. **routes/auth.ts - Profile update**
```typescript
data: {
  display_name: displayName,
  default_locale: defaultLocale
}
```

4. **routes/auth.ts - Change password**
```typescript
// Fixed:
- prisma.userss → prisma.users
- user.password → user.password_hash
- password: newHash → password_hash: newHash
```

### Docker fixes:

1. **docker-compose.yml**
```yaml
frontend:
  environment:
    API_URL_INTERNAL: http://lta-backend:3006  # For server-side calls
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3006}  # For client-side
```

2. **Healthchecks**
```yaml
# Fixed from localhost to 127.0.0.1 to avoid IPv6 issues
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3006/api/v1/master-data/container-types"]
```

## Files đã sửa

### Frontend (3 files)
1. `frontend/components/providers/auth-context.tsx`
2. `frontend/lib/auth/auth-context.tsx`
3. `frontend/middleware.ts`

### Backend (1 file)
1. `backend/src/routes/auth.ts`

### Config (1 file)
1. `docker-compose.yml`

## Test kết quả

```bash
# Login
curl -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@i-contexchange.vn","password":"admin123"}'
# ✅ Returns: { success: true, data: { token: "..." } }

# Get user info
curl http://localhost:3006/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
# ✅ Returns: { success: true, data: { user: {...} } }
```

## Deployment

```bash
# 1. Build
cd /home/lta/pj/conttrade/backend && npm run build
cd /home/lta/pj/conttrade/frontend && npm run build

# 2. Rebuild Docker images
cd /home/lta/pj/conttrade
docker-compose build

# 3. Restart services
docker-compose up -d

# 4. Verify
docker ps  # All containers should be (healthy)
```

## Checklist

- ✅ Frontend gọi đúng `/api/v1/auth/me`
- ✅ Middleware dùng `API_URL_INTERNAL` cho Docker
- ✅ Backend sử dụng đúng database field names (snake_case)
- ✅ Healthchecks hoạt động (127.0.0.1 thay vì localhost)
- ✅ All containers healthy
- ✅ Authentication flow working end-to-end
- ✅ Login successful
- ✅ /auth/me returns user data with permissions
- ✅ Token verification working

## Next steps

- Test login trên production domain: https://iconttrade.ltacv.com
- Verify tất cả protected routes hoạt động
- Check browser console không còn lỗi 401
- Test với nhiều roles khác nhau (admin, buyer, seller)
