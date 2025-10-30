# 🎯 Hướng Dẫn Interactive Tour - Trang Đăng Tin Mới (/sell/new)

## ✅ Đã Hoàn Thành

Đã triển khai thành công hệ thống hướng dẫn sử dụng (interactive tour) cho trang đăng tin mới `/sell/new` tương tự như trang đăng nhập.

**🆕 CẬP NHẬT MỚI**: Đã bổ sung **5 steps** mới cho quản lý container cho thuê (RENTAL/LEASE) - Tổng cộng **20 steps**.

---

## 📋 Tổng Quan

### Tour Steps (15-20 bước - Động hóa)

Tour guide cho trang đăng tin mới bao gồm **15-20 bước** hướng dẫn chi tiết (tùy theo loại giao dịch):

**Phần cơ bản (15 bước - Áp dụng cho TẤT CẢ):**
1. **Welcome** - Giới thiệu về trang đăng tin
2. **Progress Bar** - Thanh tiến trình động (5 hoặc 6 bước)
3. **Deal Type** - Chọn loại giao dịch (Sale/Rental/Lease/Auction)
4. **Container Size** - Kích thước container (20ft/40ft/45ft)
5. **Container Type** - Loại container (Dry/Reefer/Open Top/Flat Rack/Tank)
6. **Quality Standard** - Tiêu chuẩn chất lượng (ISO/IICL/CW/AS-IS)
7. **Condition** - Tình trạng (New/Used/Refurbished/Damaged)
8. **Title & Description** - Tiêu đề và mô tả tin đăng
9. **Media Upload** - Upload hình ảnh và video
10. **Pricing** - Thiết lập giá cả và tiền tệ

**🆕 Phần quản lý cho thuê (5 bước - CHỈ cho RENTAL/LEASE):**
11. **Rental Management Overview** - Tổng quan quản lý cho thuê
12. **Quantity Inventory** - Quản lý số lượng container
13. **Rental Duration** - Thời gian thuê tối thiểu/tối đa
14. **Deposit Policy** - Chính sách đặt cọc và phí
15. **Renewal Policy** - Chính sách gia hạn tự động

**Phần hoàn tất (5 bước - Áp dụng cho TẤT CẢ):**
16. **Depot Selection** - Chọn depot lưu trữ
17. **Location Notes** - Ghi chú vị trí (tùy chọn)
18. **Review** - Xem lại thông tin
19. **Submit Button** - Gửi duyệt tin đăng
20. **Completion** - Hoàn thành

> **💡 Lưu ý:** Steps array được **động hóa** dựa trên loại giao dịch:
> - **SALE/AUCTION**: 5 bước (Thông số → Hình ảnh → Giá cả → Vị trí → Xem lại)
> - **RENTAL/LEASE**: 6 bước (Thông số → Hình ảnh → Giá cả → **Quản lý** → Vị trí → Xem lại)
> 
> Tour guide tự động **skip** các elements không tồn tại, vì vậy chỉ hiển thị 15 steps cho SALE và 20 steps cho RENTAL.

---

## 🛠️ Các Thay Đổi Đã Thực Hiện

### 1. **driver-config.ts** - Thêm Tour Steps

**File**: `frontend/lib/tour/driver-config.ts`

```typescript
// 8. Sell New Listing Tour - Comprehensive Guide
export const sellNewTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎉 Chào Mừng Đến Trang Đăng Tin Mới',
      description: 'Chúng tôi sẽ hướng dẫn bạn qua 5 bước để tạo một tin đăng container chuyên nghiệp. Hãy bắt đầu!',
    },
  },
  // ... 13 steps khác
];
```

**Đăng ký tour**:
```typescript
export function startTour(tourName: string) {
  const tours: Record<string, DriveStep[]> = {
    // ... existing tours
    sellNew: sellNewTourSteps, // ✅ ADDED
  };
  // ...
}
```

### 2. **sell/new/page.tsx** - Thêm IDs cho Elements

**Các ID đã thêm**:

| Element | ID | Mục đích |
|---------|-----|----------|
| Progress Steps | `#progress-steps-indicator` | Highlight thanh tiến trình |
| Deal Type Section | `#deal-type-section` | Highlight section chọn loại giao dịch |
| Container Size | `#container-size-select` | Highlight dropdown kích thước |
| Container Type | `#container-type-select` | Highlight dropdown loại container |
| Quality Standard | `#quality-standard-select` | Highlight dropdown tiêu chuẩn |
| Condition | `#condition-select` | Highlight dropdown tình trạng |
| Title & Description | `#title-description-section` | Highlight section tiêu đề/mô tả |
| Media Upload | `#media-upload-section` | Highlight khu vực upload |
| Pricing | `#pricing-section` | Highlight section giá cả |
| Depot Select | `#depot-select` | Highlight dropdown depot |
| Location Notes | `#location-notes-textarea` | Highlight textarea ghi chú |
| Review Section | `#review-section` | Highlight khu vực xem lại |
| Submit Button | `#submit-listing-button` | Highlight nút gửi duyệt |

### 3. **TourHelpButton** - Integration

**Thêm import**:
```typescript
import { TourHelpButton } from '@/components/tour/tour-button';
```

**Thêm button vào page**:
```tsx
return (
  <div className="min-h-screen bg-gray-50/50">
    {/* Tour Help Button - Fixed position */}
    <div className="fixed bottom-6 right-6 z-50">
      <TourHelpButton tourName="sellNew" />
    </div>
    
    {/* ... rest of page */}
  </div>
);
```

---

## 🎨 UI/UX Features

### Tour Button
- **Vị trí**: Fixed bottom-right corner
- **Icon**: Help Circle với animation
- **Màu sắc**: Blue gradient (bg-blue-600 hover:bg-blue-700)
- **Shadow**: Có shadow để nổi bật
- **Tooltip**: "Xem hướng dẫn"

### Tour Popover
- **Theme**: driverjs-theme (custom styling)
- **Progress**: Hiển thị "Bước X/15"
- **Buttons**: 
  - ← Quay lại
  - Tiếp theo →
  - ✓ Hoàn thành
  - Đóng (X)
- **Animation**: Smooth transitions
- **Overlay**: Dark overlay 85% opacity
- **Highlight**: Border radius 8px, padding 8px

---

## 📝 Cách Sử Dụng

### Cho User

1. **Vào trang đăng tin mới**: `/sell/new`
2. **Click vào nút Help** (bottom-right) với icon `?`
3. **Tour sẽ bắt đầu** với 15 bước hướng dẫn
4. **Navigate**: Dùng buttons "Tiếp theo" / "Quay lại"
5. **Hoàn thành**: Click "✓ Hoàn thành" để kết thúc tour

### Cho Developer

**Start tour programmatically**:
```typescript
import { startTour } from '@/lib/tour/driver-config';

// Start tour
startTour('sellNew');
```

**Check if tour was seen**:
```typescript
import { hasSeenTour } from '@/lib/tour/driver-config';

if (!hasSeenTour('sellNew')) {
  // Tour chưa được xem
}
```

**Reset tour** (for testing):
```typescript
import { resetTour } from '@/lib/tour/driver-config';

resetTour('sellNew');
```

---

## 🔍 Tour Flow Chi Tiết

### Bước 1-2: Introduction
- Welcome message
- Giới thiệu thanh tiến trình 5 bước

### Bước 3-7: Specs Step (Thông số)
- Deal Type → Size → Type → Standard → Condition
- Mỗi bước highlight dropdown tương ứng
- Giải thích ý nghĩa và tùy chọn

### Bước 8: Title & Description
- Highlight section tiêu đề/mô tả
- Giải thích auto-generation nếu để trống

### Bước 9: Media Upload
- Highlight upload area
- Giải thích: 10 ảnh (≤5MB) + 1 video (≤100MB)
- Drag & drop instructions

### Bước 10: Pricing
- Highlight pricing section
- Giải thích: giá, tiền tệ, đơn vị thuê

### Bước 11-12: Depot & Location
- Depot selection với available slots
- Location notes (optional)

### Bước 13: Review
- Highlight review section
- Kiểm tra thông tin cuối cùng

### Bước 14: Submit
- Highlight submit button
- Giải thích quy trình duyệt

### Bước 15: Completion
- Congratulations message
- Hướng dẫn tiếp theo

---

## 🎯 Tính Năng Đặc Biệt

### 1. **Smart Element Detection**
- Tour tự động skip các elements không tồn tại
- Filter valid steps before starting

### 2. **LocalStorage Tracking**
- Tour chỉ hiển thị 1 lần cho mỗi user
- Key: `tour_seen_sellNew`
- Reset available for testing

### 3. **Responsive Design**
- Popover position tự động adjust
- Side: bottom/top/left/right
- Align: start/center/end

### 4. **Accessibility**
- Close button (ESC key)
- Click outside to close
- Keyboard navigation support

---

## 🧪 Testing Checklist

### ✅ Manual Testing

- [ ] Tour button hiển thị ở bottom-right
- [ ] Click button → Tour bắt đầu
- [ ] 15 steps hoạt động đúng
- [ ] Elements được highlight chính xác
- [ ] Progress text hiển thị "Bước X/15"
- [ ] Navigation buttons hoạt động
- [ ] Close button đóng tour
- [ ] ESC key đóng tour
- [ ] Tour chỉ hiển thị 1 lần (localStorage)
- [ ] Reset tour hoạt động

### ✅ Element IDs

| ID | Status |
|----|--------|
| `#progress-steps-indicator` | ✅ |
| `#deal-type-section` | ✅ |
| `#container-size-select` | ✅ |
| `#container-type-select` | ✅ |
| `#quality-standard-select` | ✅ |
| `#condition-select` | ✅ |
| `#title-description-section` | ✅ |
| `#media-upload-section` | ✅ |
| `#pricing-section` | ✅ |
| `#depot-select` | ✅ |
| `#location-notes-textarea` | ✅ |
| `#review-section` | ✅ |
| `#submit-listing-button` | ✅ |

---

## 🚀 Next Steps (Optional Enhancements)

### 1. Auto-start Tour
```typescript
import { AutoTour } from '@/components/tour/auto-tour';

// In page.tsx
<AutoTour tourName="sellNew" delay={2000} enabled={true} />
```

### 2. Tour Progress Indicator
- Show "Step 3 of 15" in a badge
- Visual progress bar

### 3. Interactive Demo Data
- Pre-fill form with demo data
- "Try it yourself" feature

### 4. Video Tutorial Integration
- Embed video tutorials
- Link to help documentation

### 5. Multi-language Support
- Vietnamese (default)
- English translation

---

## 📚 Related Files

### Modified Files
1. `frontend/lib/tour/driver-config.ts` - Tour steps definition
2. `frontend/app/[locale]/sell/new/page.tsx` - IDs + TourHelpButton
3. `frontend/components/tour/tour-button.tsx` - Tour button component (existing)

### Existing Components
- `TourHelpButton` - Help button component
- `AutoTour` - Auto-start tour on first visit
- `SimpleTourTest` - Testing component

### CSS Styling
- `frontend/styles/driver-custom.css` - Custom driver.js styles

---

## 🎉 Summary

✅ **Đã triển khai thành công** hệ thống hướng dẫn sử dụng cho trang `/sell/new`

### Key Highlights:
- 🎯 **15 tour steps** covering all form sections
- 🎨 **Professional UI** với help button fixed position
- 📱 **Responsive design** cho mọi màn hình
- 💾 **Smart tracking** với localStorage
- ♿ **Accessible** với keyboard support
- 🔄 **Reusable** architecture cho các trang khác

### Benefits:
- ✨ **Better UX** - Người dùng mới dễ hiểu cách sử dụng
- 📈 **Higher conversion** - Giảm bounce rate khi tạo tin đăng
- 🎓 **Self-service** - Giảm support requests
- 🚀 **Professional** - Tăng độ tin cậy của platform

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:
1. Check console logs
2. Verify element IDs exist
3. Test with `resetTour('sellNew')`
4. Contact development team

**Happy touring! 🎊**
