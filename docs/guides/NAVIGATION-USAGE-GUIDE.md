# 📖 HƯỚNG DẪN SỬ DỤNG NAVIGATION - i-ContExchange

## 🎯 Tổng quan

Navigation system đã được cải thiện với giao diện hiện đại, gradient đẹp mắt, và trải nghiệm người dùng mượt mà.

---

## 🧩 COMPONENTS

### 1. App Header

**Vị trí:** `components/layout/app-header.tsx`

**Sử dụng:**
```tsx
import { AppHeader } from '@/components/layout/app-header';

<AppHeader 
  isAuthenticated={true}
  userInfo={{
    name: "Nguyễn Văn A",
    email: "user@example.com",
    avatar: "/avatar.jpg",
    role: "Buyer",
    roles: ["buyer"],
    permissions: ["PM-010", "rfq.write"]
  }}
  showSidebarTrigger={true}
/>
```

**Features:**
- ✅ Logo với gradient và hover effect
- ✅ Desktop navigation với icons và active states
- ✅ Search bar với focus animation
- ✅ Theme toggle với tooltip
- ✅ Language toggle với checkmark
- ✅ User menu với quick actions
- ✅ Mobile responsive menu

---

### 2. RBAC Dashboard Sidebar

**Vị trí:** `components/layout/rbac-dashboard-sidebar.tsx`

**Sử dụng:**
```tsx
import { RBACDashboardSidebar } from '@/components/layout/rbac-dashboard-sidebar';

<RBACDashboardSidebar 
  isAuthenticated={true}
  userInfo={{
    name: "Nguyễn Văn A",
    email: "user@example.com",
    avatar: "/avatar.jpg",
    roles: ["buyer", "seller"],
    permissions: ["PM-010", "rfq.write"]
  }}
/>
```

**Features:**
- ✅ Auto-detect user roles và hiển thị menu phù hợp
- ✅ Gradient active states
- ✅ Collapsible sidebar
- ✅ Sub-menu với animations
- ✅ User info card với role badge
- ✅ Logout button

**Role-based menus:**
- `admin` - Full access to all menus
- `buyer` - RFQ, Orders, Payments, Reviews
- `seller` - Listings, Quotes, Delivery, Billing
- `depot_staff` - Depot operations
- `inspector` - Inspection tasks

---

### 3. Theme Toggle

**Vị trí:** `components/theme-toggle.tsx`

**Features:**
- ✅ Light/Dark mode switch
- ✅ Tooltip hiển thị chế độ
- ✅ Smooth icon transitions (300ms)
- ✅ Hover scale effect

**Sử dụng:**
```tsx
import { ThemeToggle } from '@/components/theme-toggle';

<ThemeToggle />
```

---

### 4. Language Toggle

**Vị trí:** `components/language-toggle.tsx`

**Features:**
- ✅ Vietnamese/English switch
- ✅ Tooltip hiển thị ngôn ngữ
- ✅ Checkmark cho ngôn ngữ đang chọn
- ✅ Flag emoji

**Sử dụng:**
```tsx
import { LanguageToggle } from '@/components/language-toggle';

<LanguageToggle />
```

---

## 🎨 STYLING GUIDE

### Active States

**Navigation items:**
```tsx
// Active state với gradient
className={`
  ${isActive 
    ? 'text-primary bg-primary/10' 
    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
  }
`}

// Với underline indicator
{isActive && (
  <span className="absolute bottom-0 left-0 right-0 h-0.5 
       bg-primary rounded-t-full" />
)}
```

**Sidebar items:**
```tsx
// Gradient background cho active state
style={{
  backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))',
  color: 'hsl(var(--primary))',
  fontWeight: '600',
  borderLeft: '4px solid hsl(var(--primary))',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
}}
```

### Hover Effects

```tsx
// Scale on hover
className="hover:scale-105 transition-all"

// Translate on hover
className="hover:translate-x-1 transition-all"

// Background on hover
className="hover:bg-accent transition-colors"
```

### Gradients

```tsx
// Logo gradient
className="bg-gradient-to-br from-primary via-primary/90 to-primary/80"

// Text gradient
className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"

// Card gradient
className="bg-gradient-to-r from-muted/60 to-muted/40"
```

---

## 📱 RESPONSIVE BEHAVIOR

### Breakpoints

| Breakpoint | Size | Navigation | Sidebar |
|------------|------|------------|---------|
| Mobile | < 768px | Sheet menu | Collapsed |
| Tablet | 768px - 1024px | Desktop nav | Icon only |
| Desktop | > 1024px | Full nav + search | Full sidebar |

### Mobile Menu

```tsx
// Trigger button (mobile only)
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
</Sheet>
```

---

## ⌨️ KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| `Tab` | Navigate through items |
| `Enter` | Select item |
| `Esc` | Close dropdown/menu |
| `Arrow Up/Down` | Navigate dropdown items |

---

## 🎯 BEST PRACTICES

### 1. Active State Detection
```tsx
const isActiveNav = (href: string) => {
  if (href === '/vi') {
    return pathname === '/vi' || pathname === '/';
  }
  return pathname.startsWith(href);
};
```

### 2. Icon Rendering
```tsx
const Icon = item.icon; // Get icon component
<Icon className="h-4 w-4" /> // Render with consistent size
```

### 3. User Info Display
```tsx
// Always show name and email
<p className="text-sm font-semibold truncate">{userInfo?.name}</p>
<p className="text-xs text-muted-foreground truncate">{userInfo?.email}</p>

// Show role badge
<Badge variant="outline" className="text-xs w-fit mt-2">
  {userInfo?.role}
</Badge>
```

### 4. Responsive Layout
```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop content</div>

// Show on mobile, hide on desktop
<div className="md:hidden">Mobile content</div>

// Responsive spacing
<div className="p-4 md:p-6">Content</div>
```

---

## 🐛 TROUBLESHOOTING

### Issue: Active state không hoạt động

**Giải pháp:**
```tsx
// Đảm bảo pathname được clean properly
const cleanPathname = pathname.replace(/^\/(en|vi)/, '');
const isActive = cleanPathname.startsWith(item.url);
```

### Issue: Hydration error với sidebar

**Giải pháp:**
```tsx
const [isMounted, setIsMounted] = React.useState(false);

React.useEffect(() => {
  setIsMounted(true);
}, []);

// Chỉ render sau khi mounted
const navigationItems = isMounted ? getUserNavigationMenu() : NAVIGATION_MENU.guest;
```

### Issue: Theme toggle không smooth

**Giải pháp:**
```tsx
// Sử dụng transition-all với duration
<Sun className="transition-all duration-300 dark:-rotate-90 dark:scale-0" />
<Moon className="transition-all duration-300 dark:rotate-0 dark:scale-100" />
```

---

## 📚 EXAMPLES

### Example 1: Custom Navigation Item

```tsx
const customNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: BarChart3,
    badge: '5' // Optional badge
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings 
  }
];
```

### Example 2: Custom Quick Action

```tsx
const quickActions = [
  { 
    name: 'Tạo đơn hàng', 
    href: '/orders/create', 
    icon: Plus,
    permission: 'orders.write'
  }
];

// Filter by permission
const allowedActions = quickActions.filter(action => 
  userInfo.permissions?.includes(action.permission)
);
```

### Example 3: Custom Role Badge Color

```tsx
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-500';
    case 'seller': return 'bg-orange-500';
    case 'buyer': return 'bg-cyan-500';
    default: return 'bg-gray-500';
  }
};
```

---

## 🎨 COLOR PALETTE

### Primary Colors
- `primary` - Main brand color
- `primary/5` - Very light (5% opacity)
- `primary/10` - Light (10% opacity)
- `primary/15` - Medium light (15% opacity)
- `primary/20` - Medium (20% opacity)
- `primary/70` - Dark (70% opacity)

### Status Colors
- `destructive` - Red for logout/delete
- `accent` - Hover background
- `muted` - Secondary text/background

---

## 📞 SUPPORT

Nếu có vấn đề hoặc cần hỗ trợ:
1. Kiểm tra console log
2. Verify user roles và permissions
3. Check pathname và routing
4. Review component props

---

**Version:** 1.0.0  
**Last Updated:** 18/10/2025  
**Maintainer:** Development Team
