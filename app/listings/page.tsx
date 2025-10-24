'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Grid3x3, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ListingCard,
  ListingFiltersComponent,
  ListingFilters,
} from '@/components/listings';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

export default function BrowseListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [filters, pagination.page]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'ACTIVE',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.dealType?.length) {
        filters.dealType.forEach(type => params.append('dealType', type));
      }
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters.containerType?.length) {
        filters.containerType.forEach(type => params.append('containerType', type));
      }
      if (filters.containerSize?.length) {
        filters.containerSize.forEach(size => params.append('containerSize', String(size)));
      }
      if (filters.condition?.length) {
        filters.condition.forEach(cond => params.append('condition', cond));
      }
      if (filters.location) params.append('location', filters.location);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${API_URL}/api/v1/listings?${params}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setListings(result.data || []);
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
          totalPages: result.totalPages || 1,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch listings');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách listings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ListingFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Container Listings
        </h1>
        <p className="text-muted-foreground text-lg">
          Khám phá hàng nghìn container listings từ các sellers uy tín
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-80 shrink-0">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
              <CardDescription>
                Tìm kiếm container phù hợp với nhu cầu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ListingFiltersComponent
                filters={filters}
                onChange={handleFilterChange}
                onApply={fetchListings}
                onReset={() => {
                  setFilters({ sortBy: 'created_at', sortOrder: 'desc' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                variant="sidebar"
                showActiveFilters
              />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* View Mode & Stats */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  'Đang tải...'
                ) : (
                  <>
                    Hiển thị{' '}
                    <span className="font-semibold">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>
                    {' - '}
                    <span className="font-semibold">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {' trên '}
                    <span className="font-semibold">{pagination.total}</span>
                    {' kết quả'}
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && listings.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-lg font-semibold mb-2">
                  Không tìm thấy listing nào
                </p>
                <p className="text-muted-foreground mb-6">
                  Thử điều chỉnh bộ lọc hoặc xóa một số tiêu chí tìm kiếm
                </p>
                <Button
                  onClick={() => {
                    setFilters({ sortBy: 'created_at', sortOrder: 'desc' });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  Reset bộ lọc
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Listings Grid */}
          {!isLoading && listings.length > 0 && (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    variant={viewMode === 'grid' ? 'default' : 'compact'}
                    showActions
                    showStatus
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(pagination.page - 1)}
                          className={
                            pagination.page === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first, last, current, and adjacent pages
                          return (
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.page) <= 1
                          );
                        })
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <PaginationItem>
                                <span className="px-2">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === pagination.page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(pagination.page + 1)}
                          className={
                            pagination.page === pagination.totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
