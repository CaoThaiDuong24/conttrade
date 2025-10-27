'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';

export interface ListingFilters {
  search?: string;
  dealType?: string[];
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  location?: string;
  containerType?: string[];
  containerSize?: number[];
  condition?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListingFiltersProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onApply?: () => void;
  onReset?: () => void;
  variant?: 'sidebar' | 'inline' | 'compact';
  showActiveFilters?: boolean;
  className?: string;
}

const DEAL_TYPES = [
  { value: 'SALE', label: 'Bán' },
  { value: 'RENTAL_DAILY', label: 'Thuê theo ngày' },
  { value: 'RENTAL_MONTHLY', label: 'Thuê theo tháng' },
];

const CONTAINER_TYPES = [
  { value: 'DRY', label: 'Dry Container' },
  { value: 'REEFER', label: 'Reefer Container' },
  { value: 'OPENTOP', label: 'Open Top' },
  { value: 'FLATRACK', label: 'Flat Rack' },
  { value: 'TANK', label: 'Tank Container' },
];

const CONTAINER_SIZES = [
  { value: 20, label: '20ft' },
  { value: 40, label: '40ft' },
  { value: 45, label: '45ft' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'Mới' },
  { value: 'EXCELLENT', label: 'Xuất sắc' },
  { value: 'GOOD', label: 'Tốt' },
  { value: 'FAIR', label: 'Khá' },
  { value: 'POOR', label: 'Kém' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Ngày đăng' },
  { value: 'price_amount', label: 'Giá' },
  { value: 'views', label: 'Lượt xem' },
  { value: 'title', label: 'Tên' },
];

export function ListingFiltersComponent({
  filters,
  onChange,
  onApply,
  onReset,
  variant = 'sidebar',
  showActiveFilters = true,
  className = '',
}: ListingFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 0,
    filters.priceMax || 10000000000,
  ]);

  // Sync with parent filters
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([
      filters.priceMin || 0,
      filters.priceMax || 10000000000,
    ]);
  }, [filters]);

  // Update filter
  const updateFilter = (key: keyof ListingFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Auto-apply for inline variant
    if (variant === 'inline' || variant === 'compact') {
      onChange(newFilters);
    }
  };

  // Toggle array filter (checkbox)
  const toggleArrayFilter = (key: keyof ListingFilters, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  // Handle apply
  const handleApply = () => {
    onChange(localFilters);
    onApply?.();
  };

  // Handle reset
  const handleReset = () => {
    const emptyFilters: ListingFilters = {};
    setLocalFilters(emptyFilters);
    setPriceRange([0, 10000000000]);
    onChange(emptyFilters);
    onReset?.();
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.dealType && localFilters.dealType.length > 0) count++;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    if (localFilters.location) count++;
    if (localFilters.containerType && localFilters.containerType.length > 0) count++;
    if (localFilters.containerSize && localFilters.containerSize.length > 0) count++;
    if (localFilters.condition && localFilters.condition.length > 0) count++;
    if (localFilters.status) count++;
    return count;
  };

  // Remove single filter
  const removeFilter = (key: keyof ListingFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-2 items-center ${className}`}>
        <Input
          placeholder="Tìm kiếm..."
          value={localFilters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="max-w-xs"
        />

        <Select
          value={localFilters.sortBy || 'created_at'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        {countActiveFilters() > 0 && (
          <Badge variant="secondary">
            {countActiveFilters()} bộ lọc
          </Badge>
        )}
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                placeholder="Nhập từ khóa..."
                value={localFilters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            {/* Deal Type */}
            <div>
              <Label htmlFor="dealType">Loại giao dịch</Label>
              <Select
                value={localFilters.dealType?.[0] || 'all'}
                onValueChange={(value) =>
                  updateFilter('dealType', value === 'all' ? undefined : [value])
                }
              >
                <SelectTrigger id="dealType">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {DEAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Khu vực</Label>
              <Input
                id="location"
                placeholder="Nhập tỉnh/thành phố..."
                value={localFilters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Sort */}
            <div>
              <Label htmlFor="sortBy">Sắp xếp</Label>
              <Select
                value={localFilters.sortBy || 'created_at'}
                onValueChange={(value) => updateFilter('sortBy', value)}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {showActiveFilters && countActiveFilters() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
                {localFilters.search && (
                  <Badge variant="secondary">
                    Từ khóa: {localFilters.search}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeFilter('search')}
                    />
                  </Badge>
                )}
                {localFilters.dealType && localFilters.dealType.length > 0 && (
                  <Badge variant="secondary">
                    {DEAL_TYPES.find((t) => t.value === localFilters.dealType![0])?.label}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeFilter('dealType')}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Xóa tất cả
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Sidebar variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </span>
          {countActiveFilters() > 0 && (
            <Badge variant="secondary">{countActiveFilters()}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search-sidebar">Tìm kiếm</Label>
          <Input
            id="search-sidebar"
            placeholder="Nhập từ khóa..."
            value={localFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <Accordion type="multiple" defaultValue={['deal-type', 'price', 'container']}>
          {/* Deal Type */}
          <AccordionItem value="deal-type">
            <AccordionTrigger>Loại giao dịch</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {DEAL_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`deal-${type.value}`}
                    checked={localFilters.dealType?.includes(type.value) || false}
                    onCheckedChange={() => toggleArrayFilter('dealType', type.value)}
                  />
                  <label
                    htmlFor={`deal-${type.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger>Khoảng giá</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <Label>
                  {new Intl.NumberFormat('vi-VN').format(priceRange[0])} -{' '}
                  {new Intl.NumberFormat('vi-VN').format(priceRange[1])} VND
                </Label>
                <Slider
                  min={0}
                  max={10000000000}
                  step={1000000}
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number]);
                    updateFilter('priceMin', value[0]);
                    updateFilter('priceMax', value[1]);
                  }}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="priceMin" className="text-xs">Từ</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={localFilters.priceMin || ''}
                    onChange={(e) => updateFilter('priceMin', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax" className="text-xs">Đến</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={localFilters.priceMax || ''}
                    onChange={(e) => updateFilter('priceMax', Number(e.target.value))}
                    placeholder="∞"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Container Type */}
          <AccordionItem value="container">
            <AccordionTrigger>Loại container</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {CONTAINER_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`container-${type.value}`}
                    checked={localFilters.containerType?.includes(type.value) || false}
                    onCheckedChange={() => toggleArrayFilter('containerType', type.value)}
                  />
                  <label
                    htmlFor={`container-${type.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Container Size */}
          <AccordionItem value="size">
            <AccordionTrigger>Kích thước</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {CONTAINER_SIZES.map((size) => (
                <div key={size.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.value}`}
                    checked={localFilters.containerSize?.includes(size.value) || false}
                    onCheckedChange={() => toggleArrayFilter('containerSize', size.value.toString())}
                  />
                  <label
                    htmlFor={`size-${size.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {size.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Condition */}
          <AccordionItem value="condition">
            <AccordionTrigger>Tình trạng</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {CONDITIONS.map((cond) => (
                <div key={cond.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${cond.value}`}
                    checked={localFilters.condition?.includes(cond.value) || false}
                    onCheckedChange={() => toggleArrayFilter('condition', cond.value)}
                  />
                  <label
                    htmlFor={`condition-${cond.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {cond.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Sort */}
        <div>
          <Label htmlFor="sortBy-sidebar">Sắp xếp</Label>
          <Select
            value={localFilters.sortBy || 'created_at'}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger id="sortBy-sidebar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleApply} className="flex-1">
            Áp dụng
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ListingFiltersComponent;
