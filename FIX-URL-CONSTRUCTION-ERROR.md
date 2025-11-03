# Fix: "Failed to construct 'URL': Invalid base URL" Error

## Vấn đề (Problem)

Nhiều trang trong ứng dụng gặp lỗi: **"Failed to construct 'URL': Invalid base URL"**

```
TypeError: Failed to construct 'URL': Invalid base URL
    at a.request (page-5b2ffb736d2d027f.js:1:21783)
```

### Nguyên nhân (Root Cause)

1. **API URL Duplication trong các page files:**
   - Các file định nghĩa: `const API_URL = '/api/v1'`
   - Nhưng sử dụng: `${API_URL}/api/v1/endpoint`
   - Kết quả: URL bị trùng lặp `/api/v1/api/v1/endpoint` ❌

2. **Invalid URL construction trong lib/api/master-data.ts:**
   - Dùng `new URL('/api/v1/api/v1/master-data/...')` - path tương đối không có base URL hợp lệ
   - `new URL()` yêu cầu absolute URL hoặc relative path + valid base URL

3. **Empty baseURL trong lib/api/client.ts:**
   - Khi `baseUrl = ""`, việc gọi `new URL(path, "")` sẽ fail
   - Cần fallback đến `window.location.origin`
   - Logic URL construction bị lỗi khi baseUrl là empty string

## Giải pháp (Solution)

### 1. Fixed `lib/api/master-data.ts`

**Trước:**
```typescript
const url = new URL(`${API_BASE_URL}/api/v1/master-data/${endpoint}`);
if (params) {
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
}
const response = await fetch(url.toString());
```

**Sau:**
```typescript
// Construct URL properly - use relative path
let urlString = `${API_BASE_URL}/master-data/${endpoint}`;

// If we have query params, build URL with searchParams
if (params) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value);
  });
  urlString = `${urlString}?${queryParams.toString()}`;
}

const response = await fetch(urlString);
```

### 2. Fixed `lib/api/client.ts`

**Trước:**
```typescript
constructor(config?: ApiClientConfig) {
  this.baseUrl = config?.baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  // ...
}

async request(...) {
  let urlString: string;
  try {
    if (this.baseUrl) {
      const url = new URL(path, this.baseUrl);
      urlString = url.toString();
    } else {
      urlString = path;
    }
  } catch (error) {
    urlString = path;
  }
  
  const url = new URL(urlString, this.baseUrl || window.location.origin);
  // ^ This fails when baseUrl is empty string!
}
```

**Sau:**
```typescript
constructor(config?: ApiClientConfig) {
  // Use window.location.origin as fallback instead of empty string
  this.baseUrl = config?.baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? 
    (typeof window !== 'undefined' ? window.location.origin : '');
  // ...
}

async request(...) {
  // Construct URL properly - handle both absolute and relative paths
  let url: URL;
  const effectiveBaseUrl = this.baseUrl || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  try {
    // Always use an effective base URL to avoid "Invalid base URL" error
    url = new URL(path, effectiveBaseUrl);
    console.log('[API Client] Constructed URL:', url.toString());
  } catch (error) {
    // Fallback: if path is absolute, try without base
    try {
      url = new URL(path);
    } catch (e2) {
      // Last resort: use path with window.location.origin
      url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    }
  }
  
  // Add query parameters...
}
```

### 3. Fixed API_URL duplication trong 11 files

Script được tạo để fix tất cả các files có pattern: `${API_URL}/api/v1/...`

**Files đã fix:**
- `app/[locale]/messages/page.tsx`
- `app/[locale]/messages/[id]/page.tsx`
- `app/[locale]/orders/create/page.tsx`
- `app/[locale]/orders/[id]/pay/page.tsx`
- `app/[locale]/delivery/page.tsx`
- `app/[locale]/delivery/track/[id]/page.tsx`
- `app/[locale]/rfq/sent/page.tsx`
- `app/[locale]/rfq/create/page.tsx`
- `app/listings/page.tsx`
- `app/listings/[id]/page.tsx`

**Thay đổi:**
```bash
# Trước: /api/v1/api/v1/endpoint
fetch(`${API_URL}/api/v1/orders/from-listing`)

# Sau: /api/v1/endpoint
fetch(`${API_URL}/orders/from-listing`)
```

## Cách chạy fix

```bash
cd /home/lta/pj/conttrade/frontend
chmod +x fix-api-url-duplication.sh
./fix-api-url-duplication.sh

# Test URL construction
node test-api-urls.js

# Rebuild and restart
npm run build
docker-compose restart frontend
```

## Kết quả (Results)

✅ **Build thành công** - Không còn lỗi URL construction  
✅ **API calls hoạt động đúng** - Không còn duplicate paths  
✅ **Master data API** - Sử dụng relative paths chính xác  
✅ **API Client** - Handle cả absolute và relative URLs properly  
✅ **URL Test** - All 4 test cases passed  

## Testing

Test URL construction:
```bash
cd frontend
node test-api-urls.js

# Output:
# 🧪 Testing API URL Construction
# ✅ Production (with base URL) - https://iconttrade.ltacv.com/api/v1/listings
# ✅ Production (empty base URL) - http://localhost:3000/api/v1/listings
# ✅ Development (localhost) - http://localhost:3006/api/v1/listings
# ✅ Relative path only - http://localhost:3000/api/v1/users/me
# 📊 Results: 4 passed, 0 failed
```

Test các pages:
```bash
# Start services
cd /home/lta/pj/conttrade
docker-compose up -d

# Test các pages:
- https://iconttrade.ltacv.com/vi/listings (Browse listings)
- https://iconttrade.ltacv.com/vi/dashboard (Dashboard)
- https://iconttrade.ltacv.com/vi/orders (Orders)
- https://iconttrade.ltacv.com/vi/messages (Messages)
- https://iconttrade.ltacv.com/vi/rfq (RFQ)
```

## Environment Setup

Ensure `.env.local` has correct values:
```bash
# Production
NEXT_PUBLIC_API_URL=https://iconttrade.ltacv.com
NEXT_PUBLIC_FRONTEND_URL=https://iconttrade.ltacv.com

# Development (for local testing)
# NEXT_PUBLIC_API_URL=http://localhost:3006
# NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Nginx Configuration

Nginx correctly proxies `/api/v1/*` requests to backend:
```nginx
location /api/v1/ {
    proxy_pass http://backend;
    # ... proxy settings
}
```

## Notes

- Tất cả các API calls giờ sử dụng relative paths `/api/v1/...`
- Nginx proxy sẽ forward requests đến backend
- Không cần CORS vì cùng origin
- Environment variable `NEXT_PUBLIC_API_URL` được sử dụng làm base URL
- Fallback to `window.location.origin` khi không có base URL

## Additional Fixes

### Vercel Insights Error (Optional)
Error: `Refused to execute script from '/_vercel/insights/script.js'`

**Giải pháp:** Đây là lỗi do browser cache hoặc extension. Không ảnh hưởng đến app. Để fix:
1. Clear browser cache
2. Hard reload (Ctrl+Shift+R)
3. Disable browser extensions

## Date

Fixed on: November 3, 2025
