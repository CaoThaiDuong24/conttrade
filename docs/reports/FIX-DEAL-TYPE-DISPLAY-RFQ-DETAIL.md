# Báo Cáo: Sửa Lỗi Hiển Thị Loại Giao Dịch (Deal Type) Trên Trang Chi Tiết RFQ

## 🎯 Vấn Đề

Trên trang chi tiết RFQ (`/rfq/[id]`), phần "Loại giao dịch" (Deal Type) hiển thị sai:
- **Lỗi**: Hiển thị `RENTAL` (tiếng Anh - giá trị gốc từ API)
- **Mong đợi**: Hiển thị `Thuê ngắn hạn` (tiếng Việt)

## 🔍 Nguyên Nhân

1. **Function sai được sử dụng**: 
   - Code đang dùng `getDealTypeLabel()` từ `@/lib/utils/listingStatus`
   - Function này **không có mapping** cho giá trị `RENTAL` đơn thuần
   - Chỉ hỗ trợ: `SALE`, `RENTAL_DAILY`, `RENTAL_MONTHLY`

2. **Function đúng không được dùng**:
   - Đã có `getDealTypeDisplayName()` trong `@/lib/utils/dealType`
   - Function này có mapping đầy đủ: `SALE`, `RENTAL`, `LEASE`, `SWAP`

## ✅ Giải Pháp

### 1. Sửa File `frontend/app/[locale]/rfq/[id]/page.tsx`

**Thay đổi import:**
```tsx
// CŨ:
import { getDealTypeLabel } from '@/lib/utils/listingStatus';

// MỚI:
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
```

**Thay đổi sử dụng:**
```tsx
// CŨ:
{getDealTypeLabel(rfq.listings.deal_type)}

// MỚI:
{getDealTypeDisplayName(rfq.listings.deal_type)}
```

### 2. Sửa File `frontend/app/listings/[id]/page.tsx`

**Thay đổi tương tự:**
```tsx
// Import
import { getDealTypeDisplayName } from '@/lib/utils/dealType';

// Sử dụng
{getDealTypeDisplayName(listing.deal_type)}
```

### 3. Cập Nhật `frontend/lib/utils/listingStatus.tsx`

Mở rộng mapping để hỗ trợ đầy đủ các loại giao dịch:

```tsx
export const DEAL_TYPE_LABELS: Record<string, string> = {
  SALE: 'Bán',
  RENTAL: 'Thuê ngắn hạn',
  LEASE: 'Thuê dài hạn',
  SWAP: 'Trao đổi',
  RENTAL_DAILY: 'Cho thuê theo ngày',
  RENTAL_MONTHLY: 'Cho thuê theo tháng',
  // Lowercase versions
  sale: 'Bán',
  rental: 'Thuê ngắn hạn',
  lease: 'Thuê dài hạn',
  swap: 'Trao đổi',
  rental_daily: 'Cho thuê theo ngày',
  rental_monthly: 'Cho thuê theo tháng',
};

export function getDealTypeLabel(dealType: string): string {
  return DEAL_TYPE_LABELS[dealType] || DEAL_TYPE_LABELS[dealType?.toUpperCase()] || dealType;
}
```

## 📊 Mapping Deal Type

| API Value | Tiếng Việt | Function |
|-----------|-----------|----------|
| `SALE` | Bán | `getDealTypeDisplayName()` |
| `RENTAL` | Thuê ngắn hạn | `getDealTypeDisplayName()` |
| `LEASE` | Thuê dài hạn | `getDealTypeDisplayName()` |
| `SWAP` | Trao đổi | `getDealTypeDisplayName()` |
| `RENTAL_DAILY` | Cho thuê theo ngày | `getDealTypeLabel()` |
| `RENTAL_MONTHLY` | Cho thuê theo tháng | `getDealTypeLabel()` |

## 🎨 Kết Quả Sau Khi Sửa

### Trước:
```
Loại giao dịch: RENTAL
```

### Sau:
```
Loại giao dịch: Thuê ngắn hạn
```

## 📁 Files Đã Thay Đổi

1. ✅ `frontend/app/[locale]/rfq/[id]/page.tsx`
   - Import: `getDealTypeDisplayName` thay vì `getDealTypeLabel`
   - Usage: Line 616

2. ✅ `frontend/app/listings/[id]/page.tsx`
   - Import: `getDealTypeDisplayName` thay vì `getDealTypeLabel`
   - Usage: Line 325

3. ✅ `frontend/lib/utils/listingStatus.tsx`
   - Mở rộng `DEAL_TYPE_LABELS` mapping
   - Cải thiện `getDealTypeLabel()` function

## 🚀 Test & Verify

**Các trường hợp cần test:**

1. ✅ RFQ với `deal_type = 'RENTAL'` → Hiển thị "Thuê ngắn hạn"
2. ✅ RFQ với `deal_type = 'SALE'` → Hiển thị "Bán"
3. ✅ RFQ với `deal_type = 'LEASE'` → Hiển thị "Thuê dài hạn"
4. ✅ Listing detail page cũng hiển thị đúng

**URL để test:**
- Frontend: http://localhost:3001/rfq/[id]
- Listing: http://localhost:3001/listings/[id]

## 🔧 Technical Notes

### Function Recommendation

**Nên dùng `getDealTypeDisplayName()` khi:**
- Hiển thị deal type từ API response
- Cần mapping chuẩn: SALE, RENTAL, LEASE, SWAP

**Nên dùng `getDealTypeLabel()` khi:**
- Cần chi tiết hơn: RENTAL_DAILY, RENTAL_MONTHLY
- Backward compatibility với code cũ

### Best Practice

```tsx
// ✅ GOOD: Sử dụng utility function có mapping đầy đủ
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
<span>{getDealTypeDisplayName(listing.deal_type)}</span>

// ❌ BAD: Hiển thị giá trị gốc từ API
<span>{listing.deal_type}</span>
```

## ✨ Status

- ✅ **Hoàn thành**: Đã sửa tất cả lỗi hiển thị deal type
- ✅ **Testing**: Server đang chạy trên port 3001
- ✅ **No Errors**: Không có lỗi TypeScript/compilation

---

**Ngày tạo**: 31/10/2025  
**Người thực hiện**: GitHub Copilot  
**Trạng thái**: ✅ Đã hoàn thành
