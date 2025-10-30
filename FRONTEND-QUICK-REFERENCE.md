# 🚀 Frontend Quick Reference

> Tài liệu tham khảo nhanh cho developers

## 📦 Quick Commands

```bash
# Development
npm run dev                 # Start dev server (port 3000)
cd frontend && npm run dev  # Start from root

# Build
npm run build              # Production build
npm run start              # Start production server

# Testing
npm run lint               # Run ESLint
npm run type-check         # Check TypeScript

# Database (from backend/)
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run migrations
npx tsx prisma/seed.ts     # Seed database
```

## 🗂️ File Structure Quick Map

```
frontend/
├── app/[locale]/              # 📄 Pages (Next.js App Router)
├── components/                # 🎨 UI Components
│   ├── ui/                   # Base components (Shadcn)
│   ├── layout/               # Layouts (Header, Sidebar)
│   ├── guards/               # Auth/Permission guards
│   └── providers/            # React Context providers
├── lib/                       # 🛠️ Utils & API
│   ├── api/                  # API client
│   └── utils/                # Helper functions
├── hooks/                     # 🪝 Custom hooks
├── types/                     # 📘 TypeScript types
├── messages/                  # 🌍 i18n translations
└── public/                    # 📁 Static files
```

## 🔑 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3005/api/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🎯 Common Imports

```typescript
// Routing (i18n aware)
import { Link, useRouter, usePathname } from '@/i18n/routing';

// Auth
import { useAuth } from '@/components/providers/auth-context';

// Permissions
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/guards/permission-guard';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Table } from '@/components/ui/table';

// Forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// i18n
import { useTranslations } from 'next-intl';

// API
import { useQuery, useMutation } from '@tanstack/react-query';

// Notifications
import { toast } from 'react-hot-toast';
```

## 🔐 Authentication Snippets

### Check if user is logged in
```typescript
const { user, loading } = useAuth();

if (loading) return <Spinner />;
if (!user) return <LoginPrompt />;
```

### Check permission
```typescript
const { hasPermission } = usePermissions();

if (hasPermission('admin.users.write')) {
  // Show edit button
}
```

### Protect component with guard
```typescript
<PermissionGuard permissions={['listings.delete']}>
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGuard>
```

### Logout
```typescript
const { logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout();
  router.push('/auth/login');
};
```

## 🌐 Navigation Snippets

### Link navigation
```typescript
import { Link } from '@/i18n/routing';

<Link href="/dashboard">Dashboard</Link>
<Link href="/listings">Listings</Link>
```

### Programmatic navigation
```typescript
import { useRouter } from '@/i18n/routing';

const router = useRouter();

router.push('/orders');        // Navigate
router.replace('/dashboard');  // Replace
router.back();                 // Go back
```

### Get current path
```typescript
import { usePathname } from '@/i18n/routing';

const pathname = usePathname();
const isActive = pathname === '/dashboard';
```

## 🎨 UI Component Snippets

### Button variants
```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Dialog (Modal)
```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>
          <Button size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Form with validation
```typescript
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', password: '' }
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

## 📡 API Snippets

### Fetch data (GET)
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['listings'],
  queryFn: async () => {
    const response = await apiClient.get('/listings');
    return response.data;
  }
});
```

### Create data (POST)
```typescript
const createMutation = useMutation({
  mutationFn: async (data) => {
    const response = await apiClient.post('/listings', data);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['listings']);
    toast.success('Created successfully');
  },
  onError: () => {
    toast.error('Failed to create');
  }
});

// Usage
createMutation.mutate(formData);
```

### Update data (PUT/PATCH)
```typescript
const updateMutation = useMutation({
  mutationFn: async ({ id, data }) => {
    const response = await apiClient.put(`/listings/${id}`, data);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['listings']);
    toast.success('Updated successfully');
  }
});
```

### Delete data (DELETE)
```typescript
const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['listings']);
    toast.success('Deleted successfully');
  }
});
```

## 🌍 i18n Snippets

### Use translations
```typescript
const t = useTranslations('common');

<h1>{t('title')}</h1>
<p>{t('welcome', { name: user.name })}</p>
```

### Get current locale
```typescript
import { useLocale } from 'next-intl';

const locale = useLocale(); // 'vi' or 'en'
```

### Change language
```typescript
const router = useRouter();
const pathname = usePathname();

const changeLanguage = (newLocale: string) => {
  router.replace(pathname, { locale: newLocale });
};
```

## 🎨 Styling Snippets

### Common Tailwind classes
```typescript
// Layout
className="container mx-auto"
className="flex items-center justify-between"
className="grid grid-cols-1 md:grid-cols-3 gap-4"

// Spacing
className="p-4 m-2"        // padding, margin
className="px-6 py-4"      // padding x, y
className="space-y-4"      // gap between children

// Typography
className="text-3xl font-bold"
className="text-sm text-gray-500"
className="text-center"

// Colors
className="bg-blue-500 text-white"
className="border border-gray-300"
className="hover:bg-blue-600"

// Responsive
className="hidden md:block"    // Show on md and up
className="w-full md:w-1/2"   // Full on mobile, half on md+
```

### Custom component with variants
```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white',
        outline: 'border border-blue-500 text-blue-500',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

## 🔧 Utility Functions

### Format date
```typescript
import { format } from 'date-fns';

const formatted = format(new Date(), 'dd/MM/yyyy');
const time = format(new Date(), 'HH:mm');
```

### Format currency
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

formatCurrency(1000000); // "1.000.000 ₫"
```

### Debounce
```typescript
import { useDebounce } from '@/hooks/use-debounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // API call with debouncedSearch
}, [debouncedSearch]);
```

### Copy to clipboard
```typescript
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};
```

## 📝 TypeScript Snippets

### Define component props
```typescript
interface MyComponentProps {
  title: string;
  count?: number;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
}

export function MyComponent({ title, count = 0, onSubmit, children }: MyComponentProps) {
  // ...
}
```

### API response type
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  createdAt: Date;
}

type ListingsResponse = ApiResponse<Listing[]>;
```

### Form data type
```typescript
type CreateListingForm = {
  title: string;
  description: string;
  price: number;
  size: '20' | '40' | '45';
  condition: 'new' | 'used' | 'refurbished';
};
```

## 🐛 Debug Snippets

### Log component renders
```typescript
useEffect(() => {
  console.log('Component rendered', { props, state });
});
```

### Log API calls
```typescript
apiClient.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

apiClient.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

### Check user permissions
```typescript
console.log('User:', user);
console.log('Roles:', user?.roles);
console.log('Permissions:', user?.permissions);
```

## 🎯 Performance Optimization

### Lazy load component
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <Spinner />,
  ssr: false, // Disable server-side rendering if needed
});
```

### Memoize expensive computation
```typescript
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### Prevent unnecessary re-renders
```typescript
import { memo } from 'react';

export const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

## 📊 Common Patterns

### Loading state
```typescript
if (isLoading) {
  return <div className="flex justify-center p-8"><Spinner /></div>;
}
```

### Error state
```typescript
if (error) {
  return (
    <div className="text-red-500 p-4">
      Error: {error.message}
    </div>
  );
}
```

### Empty state
```typescript
if (data.length === 0) {
  return (
    <div className="text-center p-8 text-gray-500">
      No items found
    </div>
  );
}
```

### Confirm before action
```typescript
const handleDelete = async () => {
  if (confirm('Are you sure you want to delete?')) {
    await deleteMutation.mutateAsync(id);
  }
};
```

## 🔗 Useful Links

- **Next.js Docs**: https://nextjs.org/docs
- **Shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Query**: https://tanstack.com/query/latest
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/

---

**💡 Tip**: Bookmark this page for quick reference while coding!

*Last updated: October 2025*
