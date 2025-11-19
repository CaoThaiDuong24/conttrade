# 🎨 HƯỚNG DẪN TRỰC QUAN - DIALOG THÊM GIỎ HÀNG

## 📱 PREVIEW GIAO DIỆN

### 1. DIALOG HEADER - Hiện đại & Chuyên nghiệp

```
┌─────────────────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════════════════╗ │
│  ║ ┌──────┐                                               ║ │
│  ║ │ 🛒 │  Thêm vào giỏ hàng                             ║ │
│  ║ │Blue│  Chọn container hoặc nhập số lượng cần mua     ║ │
│  ║ └──────┘                                               ║ │
│  ╚════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘

Features:
✅ Gradient avatar (blue-500 → cyan-500)
✅ Bold title (text-xl)
✅ Description text (text-sm)
✅ Border bottom để phân tách
```

---

### 2. QUANTITY CARD - Gradient Background

```
┌────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════╗  │
│ ║  📦 Số lượng cần mua *                                ║  │
│ ║                                                        ║  │
│ ║  ┌────┐  ┌──────────────┐  ┌────┐                    ║  │
│ ║  │ − │  │      15      │  │ + │                    ║  │
│ ║  └────┘  └──────────────┘  └────┘                    ║  │
│ ║                                                        ║  │
│ ║  Tối đa: 50 container   Tạm tính: 375,000,000 VND   ║  │
│ ╚══════════════════════════════════════════════════════╝  │
└────────────────────────────────────────────────────────────┘

Background: gradient from slate-50 to gray-50
Border: border-slate-200
Features:
✅ Large buttons (h-10 w-10)
✅ Hover: border-blue-500 + bg-blue-50
✅ Bold quantity text (text-lg)
✅ Real-time tạm tính display
```

---

### 3. DEAL TYPE SELECTOR - Color Indicators

```
┌────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════╗  │
│ ║  Loại giao dịch                                       ║  │
│ ║                                                        ║  │
│ ║  ┌────────────────────────────────────────────────┐  ║  │
│ ║  │ 🟢 Mua                                    ▼ │  ║  │
│ ║  └────────────────────────────────────────────────┘  ║  │
│ ║                                                        ║  │
│ ║  Options:                                             ║  │
│ ║  • 🟢 Mua                                             ║  │
│ ║  • 🟠 Thuê                                            ║  │
│ ╚══════════════════════════════════════════════════════╝  │
└────────────────────────────────────────────────────────────┘

Background: gradient from blue-50 to indigo-50
Border: border-blue-200
Features:
✅ Green dot = Mua (SALE)
✅ Orange dot = Thuê (RENTAL)
✅ h-11 select trigger
✅ Hover: border-blue-400
```

---

### 4. RENTAL DURATION - Animated (nếu chọn Thuê)

```
┌────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════╗  │
│ ║  ⏱️ Số tháng thuê *                                   ║  │
│ ║                                                        ║  │
│ ║  ┌────────────────────────────────────────────────┐  ║  │
│ ║  │ 12                                            │  ║  │
│ ║  └────────────────────────────────────────────────┘  ║  │
│ ║                                                        ║  │
│ ║  💡 Thời gian thuê từ 1 đến 60 tháng                  ║  │
│ ╚══════════════════════════════════════════════════════╝  │
└────────────────────────────────────────────────────────────┘

Background: gradient from orange-50 to amber-50
Border: border-orange-200
Animation: fade-in + slide-in-from-top-2 (300ms)
Features:
✅ Emoji icon ⏱️
✅ Helper text với lightbulb 💡
✅ Focus: border-orange-400
✅ Smooth animation khi xuất hiện
```

---

### 5. NOTES SECTION - Clean & Simple

```
┌────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════╗  │
│ ║  📝 Ghi chú (tùy chọn)                                 ║  │
│ ║                                                        ║  │
│ ║  ┌────────────────────────────────────────────────┐  ║  │
│ ║  │ Ghi chú tùy chọn (ví dụ: yêu cầu giao hàng,  │  ║  │
│ ║  │ điều kiện đặc biệt...)                        │  ║  │
│ ║  │                                               │  ║  │
│ ║  └────────────────────────────────────────────────┘  ║  │
│ ╚══════════════════════════════════════════════════════╝  │
└────────────────────────────────────────────────────────────┘

Background: slate-50
Border: border-slate-200
Features:
✅ Emoji 📝
✅ "(tùy chọn)" để clarify
✅ Placeholder text chi tiết
✅ resize-none để tránh UI breaking
```

---

### 6. FOOTER BUTTONS - Gradient Primary

```
┌────────────────────────────────────────────────────────────┐
│ ════════════════════════════════════════════════════════  │
│                                                            │
│  ┌──────────┐  ┌──────────────────────────────────┐      │
│  │   Hủy   │  │ 🛒 Thêm 15 container          │      │
│  └──────────┘  └──────────────────────────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘

Cancel Button:
- variant="outline"
- h-11 px-6
- border-2
- hover:bg-slate-100

Primary Button:
- Gradient: blue-600 → cyan-600
- Hover: blue-700 → cyan-700
- h-11 px-6
- shadow-md → shadow-lg on hover
- Icon + dynamic text
```

---

## 🎨 COLOR PALETTE

### Primary Colors
```
Blue Gradient:    from-blue-500 to-cyan-500  (Header avatar)
                  from-blue-600 to-cyan-600  (Primary button)
```

### Secondary Colors
```
Blue Tint:        from-blue-50 to-indigo-50   (Deal type card)
Orange Tint:      from-orange-50 to-amber-50  (Rental card)
Slate Tint:       from-slate-50 to-gray-50    (Quantity card)
Gray:             slate-50                     (Notes card)
```

### Accent Colors
```
Green:            bg-green-500   (Mua indicator)
                  bg-green-600   (Success button state)
Orange:           bg-orange-500  (Thuê indicator)
Red:              text-red-500   (Required field *)
```

### Border Colors
```
Default:          border-slate-200
Blue:             border-blue-200, border-blue-400 (hover)
Orange:           border-orange-200, border-orange-400 (focus)
```

---

## 📐 SPACING SYSTEM

### Padding
```
Card padding:     p-5  (20px)
Dialog padding:   py-6 (24px vertical)
Button padding:   px-6 (24px horizontal)
```

### Gap
```
Sections:         gap-6  (24px between cards)
Items:            gap-3  (12px between related items)
Icon+Text:        gap-2  (8px)
```

### Margin
```
Label bottom:     mb-3  (12px)
Description top:  mt-1  (4px)
```

---

## 🔤 TYPOGRAPHY SCALE

### Titles
```
Dialog Title:     text-xl font-bold text-slate-800
Card Label:       text-sm font-semibold text-slate-700
```

### Body Text
```
Description:      text-sm text-slate-600
Helper:           text-xs text-slate-500
Input:            font-semibold (normal size)
Quantity:         font-bold text-lg (larger)
```

### Button Text
```
All buttons:      font-semibold
```

---

## 🎭 INTERACTION STATES

### Hover States

**Quantity Buttons:**
```
Normal:    border border-slate-200
Hover:     border-2 border-blue-500 bg-blue-50
```

**Deal Type Select:**
```
Normal:    border-2 border-transparent
Hover:     border-blue-400
```

**Cancel Button:**
```
Normal:    border-2 bg-white
Hover:     bg-slate-100
```

**Primary Button:**
```
Normal:    shadow-md
Hover:     shadow-lg + darker gradient
```

### Focus States

**Input Fields:**
```
Quantity:         focus:border-blue-500
Rental Months:    focus:border-orange-400
Notes:            focus:border-blue-400
```

### Success State

**Main Button (isAdded):**
```
Background:       bg-green-600
Icon:             Check with animate-in zoom-in
Text:             "Đã thêm ✓"
Duration:         2 seconds → reset
```

---

## 🎬 ANIMATIONS

### 1. Rental Duration Card Appearance
```
Animation:        animate-in fade-in slide-in-from-top-2
Duration:         300ms
Trigger:          When selectedDealType === 'RENTAL'
```

### 2. Check Icon Success
```
Animation:        animate-in zoom-in
Trigger:          When item added to cart
```

### 3. Button Transitions
```
Property:         all
Duration:         300ms
Timing:           ease
```

### 4. Hover Transitions
```
Property:         border-color, background-color, shadow
Duration:         default (150ms)
Timing:           ease
```

---

## 📏 COMPONENT DIMENSIONS

### Dialog
```
Width:            sm:max-w-[800px]
Height:           max-h-[90vh]
Overflow:         overflow-y-auto
```

### Buttons
```
Height:           h-11 (44px - touch friendly)
Width:            
  - Quantity: h-10 w-10 (40px square)
  - Footer:   auto with px-6
Icon Size:        h-4 w-4 (16px)
```

### Input Fields
```
Quantity Input:   h-10 (40px)
Select Trigger:   h-11 (44px)
Rental Input:     h-11 (44px)
Textarea:         rows={3} (auto height)
```

### Avatar Icon
```
Container:        h-10 w-10 rounded-full
Icon:             h-5 w-5 (20px)
```

---

## 🎯 RESPONSIVE BEHAVIOR

### Breakpoints

**Mobile (< 640px):**
```
- Dialog: Full width
- Cards: Full width stacked
- Buttons: Full width footer
```

**Tablet (640px - 1024px):**
```
- Dialog: max-w-[800px]
- Cards: Stacked layout
- Buttons: Inline footer
```

**Desktop (> 1024px):**
```
- Dialog: max-w-[800px] centered
- Cards: Stacked with generous spacing
- Buttons: Inline footer with gap-3
```

---

## 🔍 VISUAL HIERARCHY

### Level 1: Primary Focus
```
- Primary button (gradient + shadow)
- Quantity input value (font-bold text-lg)
```

### Level 2: Important Info
```
- Dialog title (text-xl font-bold)
- Card labels (font-semibold)
- Tạm tính amount (font-semibold text-blue-600)
```

### Level 3: Supporting Info
```
- Descriptions (text-sm)
- Helper text (text-xs)
- Placeholder text (text-slate-500)
```

### Level 4: Optional
```
- Notes section (slate-50 background)
- Border separators (border-slate-200)
```

---

## 💎 DESIGN TOKENS

```css
/* Colors */
--primary-gradient: linear-gradient(to right, #2563eb, #06b6d4);
--card-blue: linear-gradient(to right, #eff6ff, #eef2ff);
--card-orange: linear-gradient(to right, #fff7ed, #fefce8);
--card-slate: linear-gradient(to right, #f8fafc, #f3f4f6);

/* Spacing */
--card-padding: 1.25rem;  /* p-5 */
--section-gap: 1.5rem;    /* gap-6 */
--item-gap: 0.75rem;      /* gap-3 */

/* Border */
--border-width: 1px;
--border-width-emphasis: 2px;
--border-radius-lg: 0.75rem;  /* rounded-xl */
--border-radius-md: 0.5rem;   /* rounded-lg */

/* Typography */
--font-title: 1.25rem;     /* text-xl */
--font-label: 0.875rem;    /* text-sm */
--font-helper: 0.75rem;    /* text-xs */
--font-weight-bold: 700;
--font-weight-semibold: 600;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 300ms ease;
```

---

## 🎨 ICON USAGE

### Lucide Icons
```
ShoppingCart:  Header avatar, Primary button
Package:       Quantity label
Plus:          Increase quantity
Minus:         Decrease quantity
Check:         Success state
Loader2:       Loading state
```

### Emoji Icons
```
📦  Quantity (Package/Box)
⏱️  Rental duration (Timer)
💡  Helper info (Light bulb)
📝  Notes (Memo)
✓   Success checkmark
🟢  Sale indicator (Green dot)
🟠  Rental indicator (Orange dot)
```

---

## 📊 COMPARISON - OLD vs NEW

| Feature | Old Design | New Design |
|---------|-----------|------------|
| **Layout** | Grid 4-col | Stacked cards |
| **Header** | Text only | Avatar + text |
| **Cards** | None | Gradient backgrounds |
| **Spacing** | gap-4 (16px) | gap-6 (24px) |
| **Buttons** | Default size | h-11 (44px) |
| **Icons** | Basic | Context + Emoji |
| **Colors** | Minimal | Rich gradients |
| **Borders** | 1px | 2px emphasis |
| **Shadows** | None | sm, md, lg |
| **Animations** | None | Fade, zoom, slide |
| **Typography** | Basic | Bold, sizes |
| **Helper Text** | Minimal | Detailed + emoji |
| **Visual Feedback** | Basic | Rich (colors, animations) |

---

## ✅ ACCESSIBILITY

### Keyboard Navigation
✅ All interactive elements focusable
✅ Clear focus indicators (border-2)
✅ Logical tab order

### Screen Readers
✅ Semantic HTML (Label, Input, Button)
✅ Required field indicators (*)
✅ Helper text associations

### Visual
✅ Sufficient contrast ratios
✅ Large touch targets (44px+)
✅ Clear visual hierarchy
✅ Non-color indicators (text + icons)

### Motion
✅ Smooth animations (300ms)
✅ Optional - can be disabled via prefers-reduced-motion

---

## 🎉 FINAL RESULT

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  [🛒]  Thêm vào giỏ hàng                                 ║
║        Chọn container hoặc nhập số lượng cần mua         ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ 📦 Số lượng cần mua *                            │   ║
║  │ [−]  [  15  ]  [+]                               │   ║
║  │ Tối đa: 50        Tạm tính: 375,000,000 VND      │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                           ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ Loại giao dịch                                   │   ║
║  │ [🟢 Mua                                    ▼]    │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                           ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ 📝 Ghi chú (tùy chọn)                            │   ║
║  │ [                                            ]    │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║         [  Hủy  ]    [🛒 Thêm 15 container]              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

**Kết quả:** Giao diện hiện đại, professional, dễ sử dụng và đồng nhất với design system! 🚀
