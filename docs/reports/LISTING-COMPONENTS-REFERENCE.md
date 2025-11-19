# 🚀 LISTING COMPONENTS - QUICK REFERENCE

## 📦 Components Overview

Phase 5 tạo 4 reusable components cho listing workflow:

1. **ListingCard** - Display listing với multiple variants
2. **ListingFilters** - Advanced filtering system
3. **ImageGallery** - Professional image viewer với lightbox
4. **FavoriteButton** - Toggle favorite/unfavorite

---

## 1️⃣ ListingCard Component

### Import
```tsx
import { ListingCard } from '@/components/listings';
```

### Basic Usage
```tsx
<ListingCard
  listing={listing}
  variant="default"
  showActions
  showStatus
/>
```

### With Callbacks
```tsx
<ListingCard
  listing={listing}
  variant="compact"
  showActions
  onEdit={(id) => router.push(`/seller/listings/edit/${id}`)}
  onDelete={(id) => handleDelete(id)}
  onShare={(id) => handleShare(id)}
/>
```

### Variants
```tsx
// Default - Full card with image
<ListingCard listing={listing} variant="default" />

// Compact - Horizontal layout
<ListingCard listing={listing} variant="compact" />

// Featured - Large with CTA button
<ListingCard listing={listing} variant="featured" />
```

### Props
```typescript
interface ListingCardProps {
  listing: Listing;                    // Required
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;               // Show edit/delete dropdown
  showStatus?: boolean;                // Show status badge
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}
```

---

## 2️⃣ ListingFilters Component

### Import
```tsx
import { ListingFiltersComponent, ListingFilters } from '@/components/listings';
```

### Basic Usage
```tsx
const [filters, setFilters] = useState<ListingFilters>({});

<ListingFiltersComponent
  filters={filters}
  onChange={setFilters}
  variant="sidebar"
/>
```

### With Apply Button
```tsx
<ListingFiltersComponent
  filters={filters}
  onChange={setFilters}
  onApply={handleApply}
  onReset={handleReset}
  variant="sidebar"
  showActiveFilters
/>
```

### Variants
```tsx
// Sidebar - Accordion layout, apply button
<ListingFiltersComponent variant="sidebar" />

// Inline - Grid layout, auto-apply
<ListingFiltersComponent variant="inline" />

// Compact - Single row, minimal
<ListingFiltersComponent variant="compact" />
```

### Filter Interface
```typescript
interface ListingFilters {
  search?: string;
  dealType?: string[];              // ['SALE', 'RENTAL_DAILY', 'RENTAL_MONTHLY']
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  location?: string;
  containerType?: string[];         // ['DRY', 'REEFER', 'OPENTOP', 'FLATRACK', 'TANK']
  containerSize?: string[];         // ['20ft', '40ft', '45ft']
  condition?: string[];             // ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR']
  status?: string;
  sortBy?: string;                  // 'created_at', 'price_amount', 'views', 'title'
  sortOrder?: 'asc' | 'desc';
}
```

### Props
```typescript
interface ListingFiltersProps {
  filters: ListingFilters;          // Required
  onChange: (filters: ListingFilters) => void;  // Required
  onApply?: () => void;             // Optional - for sidebar variant
  onReset?: () => void;             // Optional
  variant?: 'sidebar' | 'inline' | 'compact';
  showActiveFilters?: boolean;      // Show active filter badges
}
```

---

## 3️⃣ ImageGallery Component

### Import
```tsx
import { ImageGallery } from '@/components/listings';
```

### Basic Usage
```tsx
<ImageGallery
  images={listing.listing_media}
  variant="carousel"
  enableLightbox
/>
```

### Full Options
```tsx
<ImageGallery
  images={images}
  variant="carousel"
  aspectRatio="video"
  showThumbnails={true}
  enableLightbox={true}
/>
```

### Variants
```tsx
// Carousel - Main image + thumbnails (default)
<ImageGallery variant="carousel" />

// Grid - 2-4 columns grid
<ImageGallery variant="grid" />

// Masonry - Pinterest-style layout
<ImageGallery variant="masonry" />
```

### Image Format
```typescript
interface ImageGalleryImage {
  id: string;
  media_url: string;
  media_type: string;
  alt?: string;
}
```

### Props
```typescript
interface ImageGalleryProps {
  images: ImageGalleryImage[];      // Required
  variant?: 'grid' | 'carousel' | 'masonry';
  aspectRatio?: 'square' | 'video' | 'auto';
  showThumbnails?: boolean;         // Carousel variant only
  enableLightbox?: boolean;         // Enable fullscreen lightbox
  className?: string;
}
```

### Lightbox Controls
- **Click image** - Open lightbox
- **← / →** - Navigate images
- **ESC** - Close lightbox
- **+/-** - Zoom in/out
- **Click zoom %** - Reset zoom

---

## 4️⃣ FavoriteButton Component

### Import
```tsx
import { FavoriteButton } from '@/components/listings';
```

### Basic Usage
```tsx
<FavoriteButton listingId={listing.id} />
```

### With Text Label
```tsx
<FavoriteButton
  listingId={listing.id}
  variant="default"
  size="default"
  showText={true}
/>
```

### With Callback
```tsx
<FavoriteButton
  listingId={listing.id}
  onToggle={(isFavorited) => {
    console.log('Favorited:', isFavorited);
    // Update local state, refetch, etc.
  }}
/>
```

### Sizes
```tsx
// Icon only (default)
<FavoriteButton size="icon" />

// Small with text
<FavoriteButton size="sm" showText />

// Default size
<FavoriteButton size="default" showText />

// Large
<FavoriteButton size="lg" showText />
```

### Props
```typescript
interface FavoriteButtonProps {
  listingId: string;                // Required
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;               // Show "Lưu" / "Đã lưu"
  initialFavorited?: boolean;       // Initial state (auto-checked anyway)
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}
```

---

## 🎯 Common Use Cases

### Browse Listings Page
```tsx
import { ListingCard, ListingFiltersComponent } from '@/components/listings';

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [listings, setListings] = useState([]);

  return (
    <div className="flex gap-6">
      {/* Sidebar Filters */}
      <aside className="w-80">
        <ListingFiltersComponent
          filters={filters}
          onChange={setFilters}
          variant="sidebar"
          showActiveFilters
        />
      </aside>

      {/* Listings Grid */}
      <main className="flex-1">
        <div className="grid grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="default"
              showActions
              showStatus
            />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### Listing Detail Page
```tsx
import { ImageGallery, FavoriteButton } from '@/components/listings';

export default function ListingDetailPage({ listing }) {
  return (
    <div>
      {/* Hero Section */}
      <div className="flex justify-between items-start mb-6">
        <h1>{listing.title}</h1>
        <FavoriteButton listingId={listing.id} showText />
      </div>

      {/* Image Gallery */}
      <ImageGallery
        images={listing.listing_media}
        variant="carousel"
        aspectRatio="video"
        showThumbnails
        enableLightbox
      />

      {/* Rest of content... */}
    </div>
  );
}
```

### Seller Dashboard (Compact Cards)
```tsx
import { ListingCard } from '@/components/listings';

export default function SellerDashboard() {
  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          variant="compact"
          showActions
          showStatus
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### Featured Listings (Hero)
```tsx
<div className="grid grid-cols-2 gap-6">
  {featuredListings.map((listing) => (
    <ListingCard
      key={listing.id}
      listing={listing}
      variant="featured"
      showActions={false}
      showStatus={false}
    />
  ))}
</div>
```

---

## 🎨 Styling & Customization

### Custom CSS Classes
```tsx
<ListingCard
  listing={listing}
  className="shadow-lg hover:shadow-xl transition-shadow"
/>

<ImageGallery
  images={images}
  className="rounded-lg border-2 border-primary"
/>
```

### Tailwind Integration
All components use TailwindCSS and support className prop for custom styling.

---

## 🔍 API Integration

### Fetch Listings
```typescript
const response = await fetch(`${API_URL}/api/v1/listings?${params}`);
const result = await response.json();
setListings(result.data);
```

### Fetch Favorites
```typescript
const token = localStorage.getItem('token');
const response = await fetch(`${API_URL}/api/v1/favorites`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const result = await response.json();
setFavorites(result.data);
```

### Toggle Favorite
```typescript
// Add
await fetch(`${API_URL}/api/v1/favorites`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ listingId })
});

// Remove
await fetch(`${API_URL}/api/v1/favorites/${listingId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📱 Responsive Design

All components are mobile-first and responsive:

- **ListingCard**: Stacks vertically on mobile
- **ListingFilters**: Compact variant for mobile
- **ImageGallery**: Touch-friendly navigation
- **FavoriteButton**: Icon-only on small screens

---

## ✅ Best Practices

### Performance
```tsx
// Lazy load images
<ImageGallery images={images} /> // Uses Next.js Image

// Debounce filters
const debouncedFilters = useDebouncedValue(filters, 500);

// Paginate listings
const [page, setPage] = useState(1);
```

### Error Handling
```tsx
// Handle API errors
<FavoriteButton
  listingId={listing.id}
  onToggle={(isFavorited) => {
    if (!isFavorited) {
      // Handle error (toast notification automatic)
    }
  }}
/>
```

### Type Safety
```tsx
// Always use TypeScript types
const [filters, setFilters] = useState<ListingFilters>({});
```

---

## 📚 Related Pages

- **Favorites Page:** `/app/favorites/page.tsx`
- **Browse Listings:** `/app/listings/page.tsx` (to implement)
- **Listing Detail:** `/app/listings/[id]/page.tsx` (to enhance)

---

## 🚀 Quick Start Checklist

- [ ] Import components from `@/components/listings`
- [ ] Use TypeScript interfaces for type safety
- [ ] Choose appropriate variant for use case
- [ ] Add error handling for API calls
- [ ] Test on mobile devices
- [ ] Verify auth token for favorites

---

**Created:** 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
