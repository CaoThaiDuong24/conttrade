# ✅ TÓM TẮT FIX BUYER LISTINGS

**Ngày:** 4 tháng 10, 2025

---

## ❌ LỖI

**User báo:** "sao listing của buyer lại nhận luôn thông tin và hiển thị như seller"

**Phát hiện:**
1. ❌ Backend trả về listings `pending_review` (chưa duyệt) cho buyer/guest
2. ❌ Frontend hiển thị status badge "Chờ duyệt", "Từ chối"  
3. ❌ Frontend có buttons Edit/Delete/Archive (chỉ dành cho seller)

---

## ✅ FIX

### **1. Backend - Chỉ trả approved**
**File:** `backend/src/routes/listings.ts` (Line 131-136)

```typescript
// TRƯỚC
where.status = { in: ['active', 'approved', 'pending_review'] };

// SAU
where.status = 'approved'; // ✅ Public chỉ xem đã duyệt
```

### **2. Frontend - Bỏ status badge**
**File:** `app/[locale]/listings/page.tsx` (Line 172)

```tsx
// ❌ REMOVED
{getStatusBadge(listing.status)}
```

### **3. Frontend - Bỏ Edit/Delete buttons**  
**File:** `app/[locale]/listings/page.tsx` (Line 174-182)

```tsx
// ❌ REMOVED
<Button variant="ghost" size="sm"><Eye /></Button>
<Button variant="ghost" size="sm"><Edit /></Button>
<Button variant="ghost" size="sm"><Trash2 /></Button>
```

### **4. Frontend - Thay Action buttons**
**File:** `app/[locale]/listings/page.tsx` (Line 256-267)

```tsx
// TRƯỚC: Edit, Chỉnh sửa, Lưu trữ
// SAU: Xem chi tiết + Liên hệ người bán ✅
<Button size="sm" asChild>
  <Link href={`/listings/${listing.id}`}>Xem chi tiết</Link>
</Button>
<Button size="sm" variant="outline">Liên hệ người bán</Button>
```

---

## 📊 KẾT QUẢ

| Feature | Guest | Buyer | Seller |
|---------|-------|-------|--------|
| Xem approved | ✅ | ✅ | ✅ |
| Xem pending | ❌ | ❌ | ✅ (own) |
| Status badge | ❌ | ❌ | ✅ |
| Edit button | ❌ | ❌ | ✅ |
| Liên hệ button | ✅ | ✅ | ❌ |

---

## ⚠️ BACKEND ISSUE

**Vấn đề:** Backend auto-shutdown sau khi start  
**Nguyên nhân:** `listingRoutes` registration fails silently  
**TODO:** Debug listings.ts module export/import

**Workaround:** Frontend sẽ test với mock data trước

---

**Status:** ✅ CODE FIXED | ⚠️ PENDING BACKEND DEBUG
