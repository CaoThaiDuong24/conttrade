# THIẾT KẾ TRANG EDIT LISTING - CHI TIẾT

## 📐 LAYOUT STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    GRADIENT BACKGROUND                       │
│              (slate-50 → blue-50/30 → slate-50)             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [← Quay lại danh sách]                              │    │
│  │                                                      │    │
│  │         Chỉnh sửa tin đăng                          │    │
│  │   Cập nhật thông tin tin đăng của bạn              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📄 THÔNG TIN CƠ BẢN                                 │   │
│  │ (Primary gradient header)                            │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Tiêu đề tin đăng *                                  │   │
│  │ [________________________________]                   │   │
│  │                                                      │   │
│  │ ─────────────────────────────────                   │   │
│  │                                                      │   │
│  │ Mô tả chi tiết *                                    │   │
│  │ [________________________________]                   │   │
│  │ [________________________________]                   │   │
│  │ [________________________________]                   │   │
│  │ Mô tả chi tiết sẽ giúp người mua...                │   │
│  │                                                      │   │
│  │ ─────────────────────────────────                   │   │
│  │                                                      │   │
│  │ Loại giao dịch *                                    │   │
│  │ [Chọn loại giao dịch ▼]                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💵 THÔNG TIN GIÁ CẢ                                 │   │
│  │ (Green gradient header)                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Giá bán *          │ Đơn vị tiền tệ *               │   │
│  │ [_____________]    │ [Chọn đơn vị ▼]                │   │
│  │                    │                                 │   │
│  │ ─────────────────────────────────────                │   │
│  │                                                      │   │
│  │ Đơn vị thời gian thuê * (if rental)                │   │
│  │ [Chọn đơn vị thời gian ▼]                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📍 VỊ TRÍ LƯU TRỮ                                   │   │
│  │ (Blue gradient header)                               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Depot *                                              │   │
│  │ [📍 Chọn depot ▼]                                   │   │
│  │                                                      │   │
│  │ ─────────────────────────────────────                │   │
│  │                                                      │   │
│  │ Ghi chú vị trí (tùy chọn)                           │   │
│  │ [________________________________]                   │   │
│  │ [________________________________]                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ℹ️ THÔNG SỐ CONTAINER                               │   │
│  │ (Amber gradient header + warning background)         │   │
│  │ ⚠️ Các thông số này không thể chỉnh sửa             │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Kích thước │ Loại      │ Tiêu chuẩn │ Tình trạng   │   │
│  │ [20FT]     │ [DRY]     │ [ISO]      │ [NEW]        │   │
│  │ (disabled)  (disabled)  (disabled)   (disabled)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [STICKY BOTTOM BAR]                                  │   │
│  │                                                      │   │
│  │ [    Hủy    ] [💾 Cập nhật tin đăng (gradient)]    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 COLOR PALETTE

### Card Headers:
```css
Basic Info:     from-primary/5 via-primary/3 to-transparent
Pricing:        from-green-500/5 via-green-500/3 to-transparent
Location:       from-blue-500/5 via-blue-500/3 to-transparent
Specifications: from-amber-500/10 via-amber-500/5 to-transparent
```

### Icon Backgrounds:
```css
FileText (Basic):    bg-primary/10 text-primary
DollarSign (Price):  bg-green-500/10 text-green-600
MapPin (Location):   bg-blue-500/10 text-blue-600
Info (Specs):        bg-amber-500/10 text-amber-600
```

### Borders:
```css
Default:     border-primary/10
Focus:       border-primary
Read-only:   border-amber-200/50
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Mobile (< 768px):
- Cards: Full width với padding giảm
- Grid: 1 column cho tất cả
- Buttons: Stack vertically, full width
- Sticky bar: Full width bottom

### Tablet (768px - 1024px):
- Cards: Max-width with margins
- Grid: 2 columns cho price fields
- Buttons: Side by side
- Container: max-w-3xl

### Desktop (> 1024px):
- Cards: max-w-5xl centered
- Grid: 2 columns cho price, 4 columns cho specs
- Full layout as designed
- Optimal spacing

---

## ⚡ INTERACTIVE STATES

### Input Fields:
```
Normal:  border-primary/20 bg-white
Hover:   border-primary/40
Focus:   border-primary ring-2 ring-primary/20
Error:   border-red-500 ring-2 ring-red-500/20
```

### Buttons:
```
Primary (Submit):
  Normal:  bg-gradient-to-r from-primary via-primary/90 to-primary/80
  Hover:   from-primary/90 via-primary/80 to-primary/70 + shadow-lg
  Loading: Spinner + "Đang cập nhật..."
  
Secondary (Cancel):
  Normal:  border-primary/20 bg-white
  Hover:   bg-primary/5 border-primary
```

### Cards:
```
Normal:  shadow-lg
Hover:   shadow-xl
Focus:   (none for cards)
```

---

## 🔤 TYPOGRAPHY SCALE

```
Page Title:       text-4xl font-bold (gradient)
Subtitle:         text-lg text-muted-foreground
Card Title:       text-2xl font-bold
Card Description: text-sm text-muted-foreground
Label:            text-base font-semibold
Helper Text:      text-xs text-muted-foreground
Input Text:       text-base
Button Text:      text-base
```

---

## 📏 SPACING SYSTEM

```
Card Padding:      pt-6 (content)
Section Spacing:   space-y-6
Field Spacing:     space-y-2
Grid Gap:          gap-4 (fields), gap-6 (cards)
Button Gap:        gap-4
Separator Margin:  my-6
```

---

## 🎭 COMPONENT STATES

### Loading State (Initial):
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
  <div className="flex flex-col items-center gap-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <Package className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </div>
    <p className="text-sm text-muted-foreground font-medium">Đang tải dữ liệu...</p>
  </div>
</div>
```

### Submit State (Button):
```tsx
{submitting ? (
  <>
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
    <span>Đang cập nhật...</span>
  </>
) : (
  <>
    <Save className="mr-2 h-5 w-5" />
    <span>Cập nhật tin đăng</span>
  </>
)}
```

---

## 🎯 ACCESSIBILITY

### Required Fields:
- Marked with red asterisk: `<span className="text-red-500">*</span>`
- Proper `required` attribute on inputs
- Clear validation messages

### Labels:
- Always associated with inputs via `htmlFor`
- Descriptive text
- Helper text for complex fields

### Focus Management:
- Visible focus rings with primary color
- Logical tab order
- Skip to content options

### Color Contrast:
- All text meets WCAG AA standards
- Sufficient contrast for disabled fields
- Clear visual hierarchy

---

## 🔧 TECHNICAL DETAILS

### Class Naming Convention:
```
Gradients:     bg-gradient-to-{direction}
Colors:        {color}-{shade} or {color}/{opacity}
Spacing:       {property}-{size}
Transitions:   transition-{property} duration-{time}
```

### Animation Timings:
```
Fast:     100ms - 150ms (hover states)
Normal:   200ms - 300ms (transitions)
Slow:     400ms - 600ms (page transitions)
Spinner:  Infinite (loading states)
```

### Z-Index Layers:
```
Base:           z-0 (default)
Sticky Bar:     z-10
Modals:         z-50
Tooltips:       z-60
```

---

## ✅ VALIDATION & FEEDBACK

### Field Validation:
- **Required fields:** Red border + message on submit
- **Number fields:** Min/max constraints
- **Conditional fields:** Show/hide based on deal type

### Success Feedback:
```tsx
toast({
  title: "Thành công",
  description: "Cập nhật tin đăng thành công",
})
```

### Error Feedback:
```tsx
toast({
  variant: "destructive",
  title: "Lỗi",
  description: errorData.message || "Không thể cập nhật tin đăng",
})
```

---

## 🚀 PERFORMANCE

### Optimizations:
- Lazy load depot data
- Debounce input changes (if needed)
- Memoize expensive calculations
- Efficient re-renders

### Loading Strategies:
- Show skeleton while loading
- Prefetch depot data
- Cache master data (1 hour)
- Optimistic UI updates

---

## 📝 NOTES

1. **Disabled Fields Styling:**
   - Special amber/orange theme
   - Clear visual distinction
   - Cursor: not-allowed
   - Tooltip explaining why

2. **Sticky Action Bar:**
   - Always visible at bottom
   - Elevated shadow
   - Full width on mobile
   - Z-index for proper layering

3. **Gradient Consistency:**
   - All gradients use same pattern
   - Opacity variations for depth
   - Smooth transitions
   - Professional appearance

4. **Icon Usage:**
   - Semantic meaning (FileText for docs, DollarSign for price)
   - Consistent sizing (h-5/h-6 with w-5/w-6)
   - Colored backgrounds for emphasis
   - Proper spacing with text

5. **Mobile Experience:**
   - Touch-friendly targets (min 44px)
   - Reduced motion for accessibility
   - Optimized keyboard layout
   - Bottom navigation for thumb reach
