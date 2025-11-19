'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  MapPin,
  Package,
  Calendar,
  Eye,
  Share2,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageGallery, FavoriteButton } from '@/components/listings';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
import { getConditionLabel } from '@/lib/utils/condition';
import { getSizeLabel } from '@/lib/utils/containerSize';
import { getStandardLabel } from '@/lib/utils/qualityStandard';
import { getTypeLabel } from '@/lib/utils/containerType';
import { formatListingTitle } from '@/lib/utils/listingTitle';

// Use relative path for API calls
const API_URL = '/api/v1';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRfqDialog, setShowRfqDialog] = useState(false);
  const [rfqMessage, setRfqMessage] = useState('');
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (listingId) {
      fetchListingDetail();
      incrementViewCount();
    }
  }, [listingId]);

  const fetchListingDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/listings/${listingId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setListing(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch listing');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin listing',
        variant: 'destructive',
      });
      router.push('/listings');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`${API_URL}/listings/${listingId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleSubmitRfq = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Chưa đăng nhập',
        description: 'Vui lòng đăng nhập để gửi RFQ',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (!rfqMessage.trim()) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập nội dung yêu cầu báo giá',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingRfq(true);
    try {
      const response = await fetch(`${API_URL}/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: listingId,
          message: rfqMessage,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Thành công',
          description: 'RFQ đã được gửi đến seller',
        });
        setShowRfqDialog(false);
        setRfqMessage('');
        router.push('/buyer/rfqs');
      } else {
        throw new Error(result.error || 'Failed to submit RFQ');
      }
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể gửi RFQ',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      ACTIVE: { variant: 'default', label: 'Đang bán', icon: CheckCircle2 },
      DRAFT: { variant: 'secondary', label: 'Bản nháp', icon: Clock },
      PENDING_REVIEW: { variant: 'secondary', label: 'Chờ duyệt', icon: Clock },
      SOLD: { variant: 'secondary', label: 'Đã bán', icon: CheckCircle2 },
      REJECTED: { variant: 'destructive', label: 'Từ chối', icon: XCircle },
      PAUSED: { variant: 'secondary', label: 'Tạm dừng', icon: Clock },
    };

    const config = variants[status] || variants.DRAFT;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <ImageGallery
            images={listing.listing_media || []}
            variant="carousel"
            aspectRatio="video"
            showThumbnails
            enableLightbox
          />

          {/* Tabs: Details, Specifications, etc. */}
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Chi tiết</TabsTrigger>
              <TabsTrigger value="specs" className="flex-1">Thông số kỹ thuật</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">Vị trí</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.description || 'Không có mô tả'}
                  </p>
                </CardContent>
              </Card>

              {listing.features && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tính năng nổi bật</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {Object.entries(listing.features).map(([key, value]) => (
                        <li key={key} className="text-muted-foreground">
                          <span className="font-medium text-foreground">{key}:</span> {String(value)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.specifications ? (
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(listing.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                          <dd className="text-sm font-semibold">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-muted-foreground">Không có thông số kỹ thuật</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vị trí container</CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.depots ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">{listing.depots.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.depots.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {listing.depots.province}, {listing.depots.country || 'Việt Nam'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Thông tin vị trí không có sẵn</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{formatListingTitle(listing.title, listing)}</CardTitle>
                  {getStatusBadge(listing.status)}
                </div>
                <FavoriteButton listingId={listing.id} size="icon" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(listing.price_amount, listing.price_currency)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getDealTypeDisplayName(listing.deal_type)}
                </p>
              </div>

              <Separator />

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Container ID:</span>
                  <span className="font-medium">{listing.container_id || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lượt xem:</span>
                  <span className="font-medium">{listing.view_count || 0}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Đăng ngày:</span>
                  <span className="font-medium">
                    {new Date(listing.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowRfqDialog(true)}
                  disabled={listing.status !== 'ACTIVE'}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Yêu cầu báo giá (RFQ)
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>

              {/* Seller Info */}
              {listing.users && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">Người bán</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {listing.users.full_name?.[0] || listing.users.display_name?.[0] || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {listing.users.full_name || listing.users.display_name || 'Seller'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.users.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RFQ Dialog */}
      <Dialog open={showRfqDialog} onOpenChange={setShowRfqDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu báo giá (RFQ)</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu báo giá cho listing: {listing.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="rfq-message">Nội dung yêu cầu *</Label>
              <Textarea
                id="rfq-message"
                placeholder="Mô tả chi tiết nhu cầu của bạn, số lượng cần mua/thuê, thời gian..."
                value={rfqMessage}
                onChange={(e) => setRfqMessage(e.target.value)}
                rows={5}
                className="mt-2"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRfqDialog(false)}
                disabled={isSubmittingRfq}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitRfq}
                disabled={isSubmittingRfq || !rfqMessage.trim()}
              >
                {isSubmittingRfq ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi RFQ'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
