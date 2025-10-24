# 🎨 Listing Status Display - Vietnamese Labels

**File:** `lib/utils/listingStatus.tsx`  
**Created:** 17/10/2024  
**Purpose:** Centralized utility for consistent listing status display across the app

---

## 📋 Overview

Utility functions để đảm bảo tất cả các status của listing đều hiển thị **tiếng Việt** nhất quán trong toàn bộ ứng dụng.

---

## 🎯 Status Labels (Vietnamese)

| Status Code | Vietnamese Label | Badge Variant | Icon |
|-------------|------------------|---------------|------|
| `DRAFT` | Bản nháp | secondary | Package |
| `PENDING_REVIEW` | Chờ duyệt | outline | Clock |
| `ACTIVE` | Đang hoạt động | default | CheckCircle |
| `SOLD` | Đã bán | default | CheckCircle |
| `REJECTED` | Bị từ chối | destructive | XCircle |
| `PAUSED` | Tạm dừng | secondary | Pause |
| `EXPIRED` | Hết hạn | secondary | AlertTriangle |

**Note:** Hỗ trợ cả uppercase và lowercase (VD: `ACTIVE` hoặc `active`)

---

## 📦 Functions

### 1. getListingStatusLabel()
```tsx
import { getListingStatusLabel } from '@/lib/utils/listingStatus';

const label = getListingStatusLabel('ACTIVE'); // "Đang hoạt động"
const label2 = getListingStatusLabel('pending_review'); // "Chờ duyệt"
```

### 2. getListingStatusVariant()
```tsx
import { getListingStatusVariant } from '@/lib/utils/listingStatus';

const variant = getListingStatusVariant('ACTIVE'); // "default"
const variant2 = getListingStatusVariant('REJECTED'); // "destructive"
```

### 3. getListingStatusIcon()
```tsx
import { getListingStatusIcon } from '@/lib/utils/listingStatus';

const Icon = getListingStatusIcon('ACTIVE'); // CheckCircle component
```

### 4. renderListingStatusBadge() ⭐ Recommended
```tsx
import { renderListingStatusBadge } from '@/lib/utils/listingStatus';

// With icon
{renderListingStatusBadge('ACTIVE', true)}

// Without icon
{renderListingStatusBadge('PENDING_REVIEW', false)}
```

---

## 🎨 Deal Type Labels

| Deal Type Code | Vietnamese Label |
|----------------|------------------|
| `SALE` | Bán |
| `RENTAL_DAILY` | Cho thuê theo ngày |
| `RENTAL_MONTHLY` | Cho thuê theo tháng |

### getDealTypeLabel()
```tsx
import { getDealTypeLabel } from '@/lib/utils/listingStatus';

const label = getDealTypeLabel('SALE'); // "Bán"
const label2 = getDealTypeLabel('RENTAL_MONTHLY'); // "Cho thuê theo tháng"
```

---

## 🔄 Migration Guide

### Before (Old Code)
```tsx
// ❌ Hardcoded labels
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Đang hoạt động';
    case 'DRAFT': return 'Nháp';
    // ... duplicated code
  }
};

<Badge variant="default">{getStatusLabel(listing.status)}</Badge>
```

### After (New Code)
```tsx
// ✅ Use centralized utility
import { renderListingStatusBadge } from '@/lib/utils/listingStatus';

{renderListingStatusBadge(listing.status)}
```

---

## 📍 Usage in Components

### ListingCard Component
```tsx
import { getListingStatusLabel, getListingStatusVariant } from '@/lib/utils/listingStatus';

const getStatusBadge = (status?: string) => {
  if (!status || !showStatus) return null;
  
  return (
    <Badge variant={getListingStatusVariant(status)}>
      {getListingStatusLabel(status)}
    </Badge>
  );
};
```

### Seller Listings Page
```tsx
import { getListingStatusLabel, getListingStatusVariant } from '@/lib/utils/listingStatus';

{listings.map((listing) => (
  <Badge variant={getListingStatusVariant(listing.status)}>
    {getListingStatusLabel(listing.status)}
  </Badge>
))}
```

### Admin Listings Page
```tsx
import { renderListingStatusBadge } from '@/lib/utils/listingStatus';

<TableCell>
  {renderListingStatusBadge(listing.status)}
</TableCell>
```

---

## ✅ Current Implementation Status

| Component/Page | Status | Method Used |
|----------------|--------|-------------|
| `components/listings/listing-card.tsx` | ✅ Has own getStatusBadge | Can migrate to utility |
| `app/[locale]/seller/listings/page.tsx` | ✅ Has getStatusLabel | Can migrate to utility |
| `app/[locale]/admin/listings/page.tsx` | ✅ Has statusLabels | Can migrate to utility |
| `app/listings/page.tsx` | ✅ Uses ListingCard | Inherits from component |
| `app/listings/[id]/page.tsx` | ✅ Has getStatusBadge | Can migrate to utility |
| `app/favorites/page.tsx` | ✅ Uses ListingCard | Inherits from component |

**Note:** Tất cả đều đã hiển thị tiếng Việt đúng. Utility này giúp tương lai maintain dễ hơn.

---

## 🎯 Benefits

1. ✅ **Consistency** - Một chỗ duy nhất để quản lý labels
2. ✅ **Maintainability** - Dễ update khi cần thay đổi
3. ✅ **Type Safety** - TypeScript interfaces
4. ✅ **Reusability** - Import vào bất kỳ component nào
5. ✅ **DRY Principle** - Không duplicate code
6. ✅ **Bilingual Support** - Hỗ trợ cả uppercase & lowercase

---

## 🔮 Future Enhancements

### Multi-language Support
```tsx
// Add i18n support
export function getListingStatusLabel(status: string, locale = 'vi'): string {
  const labels = {
    vi: LISTING_STATUS_LABELS,
    en: LISTING_STATUS_LABELS_EN,
  };
  return labels[locale][status] || status;
}
```

### Custom Badge Styles
```tsx
// Add custom styles per status
export const LISTING_STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500 text-white',
  REJECTED: 'bg-red-500 text-white',
  // ...
};
```

---

## 📚 Related Files

- `components/listings/listing-card.tsx` - Uses status badges
- `app/[locale]/seller/listings/page.tsx` - Seller's listing management
- `app/[locale]/admin/listings/page.tsx` - Admin review page
- `app/listings/[id]/page.tsx` - Public listing detail
- `lib/utils/dealType.ts` - Similar utility for deal types

---

## ✅ Summary

**Status:** ✅ Complete  
**Vietnamese Labels:** ✅ All status codes covered  
**Components Updated:** ✅ All displaying Vietnamese correctly  
**Future Ready:** ✅ Centralized utility for easy maintenance

**All listing statuses are now displaying in Vietnamese! 🎉**

---

**Created:** 17/10/2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
