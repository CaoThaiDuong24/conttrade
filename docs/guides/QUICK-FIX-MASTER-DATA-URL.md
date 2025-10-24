# QUICK FIX - MASTER DATA API 404

## Vấn Đề Tìm Thấy

### Lỗi 1: URL không có `/api/v1`
**File:** `lib/api/master-data.ts` Line 18

**Code Cũ:**
```typescript
const url = new URL(`${API_BASE_URL}/master-data/${endpoint}`);
```

**Kết Quả:**
- `http://localhost:3006/master-data/deal-types` ❌ WRONG!
- Backend API thực tế: `http://localhost:3006/api/v1/master-data/deal-types` ✅

**Code Mới:**
```typescript
const url = new URL(`${API_BASE_URL}/api/v1/master-data/${endpoint}`);
```

### Lỗi 2: next.config.mjs port sai
**File:** `next.config.mjs` Line 13

**Code Cũ:**
```javascript
destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1'}/:path*`
```

**Code Mới:**
```javascript
destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api/v1'}/:path*`
```

## Testing

1. Clear cache: `Remove-Item .next -Recurse`
2. Restart frontend
3. Reload browser
4. Check console - should see: `🌐 Fetching: http://localhost:3006/api/v1/master-data/deal-types`

