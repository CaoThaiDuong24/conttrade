# ✅ Checklist: Test All Fixed Pages

## Đã Fix (Fixed)

### 🔧 Core API Libraries
- [x] `lib/api/client.ts` - URL construction with fallback
- [x] `lib/api/master-data.ts` - Remove duplicate `/api/v1`
- [x] `lib/api/listings.ts` - Already correct

### 📄 Page Files (11 files)
- [x] `app/[locale]/messages/page.tsx`
- [x] `app/[locale]/messages/[id]/page.tsx`
- [x] `app/[locale]/orders/create/page.tsx`
- [x] `app/[locale]/orders/[id]/pay/page.tsx`
- [x] `app/[locale]/delivery/page.tsx`
- [x] `app/[locale]/delivery/track/[id]/page.tsx`
- [x] `app/[locale]/rfq/sent/page.tsx`
- [x] `app/[locale]/rfq/create/page.tsx`
- [x] `app/listings/page.tsx`
- [x] `app/listings/[id]/page.tsx`

### 🧪 Test Script
- [x] Created `test-api-urls.js` - All 4 tests passed
- [x] Created `fix-api-url-duplication.sh` - Fixed 11 files

## Cần Test (To Test)

### 🌐 Pages to Test (sau khi restart frontend)

#### 1. Dashboard & Home
- [ ] `/vi/dashboard` - Load dashboard data
- [ ] `/vi` - Home page

#### 2. Listings
- [ ] `/vi/listings` - Browse all listings ⚠️ **Lỗi chính ở đây**
- [ ] `/vi/listings/[id]` - View listing details
- [ ] `/vi/sell/my-listings` - My listings (seller)
- [ ] `/vi/sell/new` - Create new listing (seller)

#### 3. Orders
- [ ] `/vi/orders` - View all orders
- [ ] `/vi/orders/create?listingId=xxx` - Create order
- [ ] `/vi/orders/[id]/pay` - Payment page

#### 4. Messages
- [ ] `/vi/messages` - Conversations list
- [ ] `/vi/messages/[id]` - View conversation

#### 5. RFQ (Request for Quote)
- [ ] `/vi/rfq` - RFQ overview
- [ ] `/vi/rfq/sent` - Sent RFQs
- [ ] `/vi/rfq/received` - Received RFQs (seller)
- [ ] `/vi/rfq/create?listingId=xxx` - Create RFQ

#### 6. Delivery
- [ ] `/vi/delivery` - Delivery tracking
- [ ] `/vi/delivery/track/[id]` - Track specific delivery

#### 7. Admin (if admin user)
- [ ] `/vi/admin/listings` - Manage listings
- [ ] `/vi/admin/users` - Manage users
- [ ] `/vi/admin/dashboard` - Admin dashboard

## Test Commands

```bash
# 1. Restart frontend (đã chạy rồi)
cd /home/lta/pj/conttrade
docker-compose restart frontend

# 2. Check logs
docker-compose logs -f frontend

# 3. Test URL construction
cd frontend
node test-api-urls.js

# 4. Check if build completed
docker-compose logs frontend | grep "Ready"
```

## Browser Testing

### 1. Clear Cache
- Hard reload: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or open DevTools → Network → Disable cache

### 2. Check Console
Open DevTools (F12) → Console tab, should see:
```
[API Client] Initialized with baseUrl: https://iconttrade.ltacv.com
[API Client] Constructed URL: https://iconttrade.ltacv.com/api/v1/listings
✅ No "Failed to construct 'URL'" errors
```

### 3. Check Network Tab
Open DevTools (F12) → Network tab:
- Filter: `XHR` or `Fetch`
- Look for requests to `/api/v1/...`
- Status should be `200 OK` (not 404)
- Response should contain data

## Expected Results

### ✅ Success Indicators
- [ ] No "Failed to construct 'URL': Invalid base URL" errors
- [ ] API requests show in Network tab as `/api/v1/...`
- [ ] Pages load data correctly
- [ ] No duplicate paths like `/api/v1/api/v1/...`

### ❌ If Still Errors
1. Check browser console for exact error
2. Check Network tab for failed requests
3. Verify `.env.local` has `NEXT_PUBLIC_API_URL=https://iconttrade.ltacv.com`
4. Check backend is running: `docker-compose ps`
5. Check nginx logs: `docker-compose logs nginx`

## Contact Info

If issues persist:
- Check `FIX-URL-CONSTRUCTION-ERROR.md` for detailed fix info
- Review console logs with `docker-compose logs frontend`
- Check backend logs with `docker-compose logs backend`
