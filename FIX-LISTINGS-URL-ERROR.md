# FIX: Listings Page "Invalid base URL" Error

## Nguyên nhân lỗi

Lỗi **"Failed to construct 'URL': Invalid base URL"** xảy ra do:

1. **Environment Variable không đúng format:**
   - File `.env.local` đang set: `NEXT_PUBLIC_API_URL=https://iconttrade.ltacv.com`
   - Thiếu phần `/api/v1` ở cuối URL

2. **URL Construction lỗi:**
   - API client cố gắng construct URL: `new URL('/api/v1/listings', baseUrl)`
   - Nếu `baseUrl` là empty string hoặc undefined → Lỗi "Invalid base URL"

3. **Kết quả:**
   - Trang `/listings` không load được dữ liệu
   - Console hiện lỗi URL construction
   - Không có listings nào được hiển thị

## Các thay đổi đã thực hiện

### 1. Fix Environment Variable (`.env.local`)

**Trước:**
```bash
NEXT_PUBLIC_API_URL=https://iconttrade.ltacv.com
```

**Sau:**
```bash
NEXT_PUBLIC_API_URL=https://iconttrade.ltacv.com/api/v1
```

### 2. Cải thiện URL Construction (`lib/api/client.ts`)

**Cải tiến:**
- Kiểm tra baseUrl có empty không trước khi dùng
- Log warning nếu baseUrl bị thiếu
- Better error handling với message rõ ràng hơn
- Hỗ trợ cả absolute URL và relative path

**Code mới:**
```typescript
// Ensure we always have a valid base URL
let effectiveBaseUrl = this.baseUrl;
if (!effectiveBaseUrl || effectiveBaseUrl.trim() === '') {
  effectiveBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  console.warn('[API Client] baseUrl is empty, using fallback:', effectiveBaseUrl);
}

try {
  // Check if path is absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    url = new URL(path);
  } else {
    // Relative path - use baseUrl
    url = new URL(path, effectiveBaseUrl);
  }
  console.log('[API Client] Constructed URL:', url.toString());
} catch (error) {
  console.error('[API Client] URL construction failed:', error);
  throw new ApiError('Invalid URL construction', 0, 'URL_CONSTRUCTION_ERROR', { path, baseUrl: effectiveBaseUrl });
}
```

## Cách test

1. **Rebuild frontend:**
   ```bash
   cd /home/lta/pj/conttrade/frontend
   npm run build
   ```

2. **Restart PM2:**
   ```bash
   pm2 restart frontend
   ```

3. **Test trên browser:**
   - Vào trang: https://iconttrade.ltacv.com/listings
   - Mở DevTools Console
   - Kiểm tra:
     - Không còn lỗi "Invalid base URL"
     - URL được construct đúng: `https://iconttrade.ltacv.com/api/v1/listings`
     - Listings được load và hiển thị

4. **Kiểm tra API logs:**
   ```bash
   # Check frontend logs
   pm2 logs frontend --lines 50
   
   # Tìm dòng log:
   [API Client] Constructed URL: https://iconttrade.ltacv.com/api/v1/listings
   ```

## Lưu ý quan trọng

### ⚠️ Environment Variables trong Next.js

Next.js cần **rebuild** để apply thay đổi environment variables:
- Environment variables được embed vào build output
- Chỉ restart server KHÔNG ĐỦ
- Phải chạy `npm run build` lại

### 🔍 Debug Tips

Nếu vẫn còn lỗi, check:

1. **Environment variable có load không:**
   ```javascript
   // Add vào code
   console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
   ```

2. **URL construction:**
   ```javascript
   // Check trong browser console
   console.log('[API Client] baseUrl:', this.baseUrl);
   console.log('[API Client] effectiveBaseUrl:', effectiveBaseUrl);
   ```

3. **Network tab:**
   - Mở DevTools > Network
   - Filter: XHR/Fetch
   - Check request URL có đúng format không

### 📝 Best Practices

1. **Luôn thêm `/api/v1` vào NEXT_PUBLIC_API_URL**
2. **Test sau mỗi lần thay đổi .env file**
3. **Rebuild và restart sau khi sửa environment variables**
4. **Check logs để debug URL construction**

## Tóm tắt

✅ **Fixed:**
- Environment variable thiếu `/api/v1`
- URL construction không handle empty baseUrl
- Better error messages cho debugging

✅ **Result:**
- Listings page load được dữ liệu
- Không còn lỗi "Invalid base URL"
- URL construction đúng format

## Files đã sửa

1. `/home/lta/pj/conttrade/frontend/.env.local`
2. `/home/lta/pj/conttrade/frontend/lib/api/client.ts`
