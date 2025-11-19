'use client';

import { useState } from 'react';
import { Trash2, Minus, Plus, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/lib/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Helper function to convert rental_duration_months back to original unit
const convertMonthsToRentalUnit = (months: number, rentalUnit: string): number => {
  switch (rentalUnit) {
    case 'YEAR':
      return months / 12;
    case 'QUARTER':
      return months / 3;
    case 'MONTH':
      return months;
    case 'WEEK':
      return Math.round(months * 4.33);
    case 'DAY':
      return Math.round(months * 30);
    default:
      return months;
  }
};

interface CartItemProps {
  item: {
    id: string;
    listing_id: string;
    quantity: number;
    deal_type: 'SALE' | 'RENTAL';
    rental_duration_months: number;
    price_snapshot: string;
    currency: string;
    notes?: string;
    selected_container_ids?: string[];
    listing: {
      id: string;
      title: string;
      type?: string;
      status?: string;
      available_quantity?: number;
      price_sale?: string;
      price_rental_per_month?: string;
      rental_unit?: string;
      currency?: string;
      seller_user_id?: string;
      users?: {
        id: string;
        display_name?: string;
        email?: string;
      };
      seller?: {
        id: string;
        display_name?: string;
        email?: string;
      };
      depots?: {
        name: string;
        province?: string;
      };
      locationDepot?: {
        name: string;
        province: string;
      };
      location?: {
        city?: string;
        country?: string;
      };
      listing_containers?: Array<{
        id: string;
        container_iso_code: string;
        status: string;
      }>;
    };
  };
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, toggleItemSelection, isItemSelected } = useCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const isSelected = isItemSelected(item.id);

  // Get seller display name from either users or seller field
  const sellerName = item.listing.users?.display_name 
    || item.listing.seller?.display_name 
    || item.listing.users?.email 
    || item.listing.seller?.email 
    || 'Người bán';

  // Get location name from either depots or locationDepot
  const locationName = item.listing.depots?.name 
    || item.listing.locationDepot?.name;
  const locationProvince = item.listing.depots?.province 
    || item.listing.locationDepot?.province;

  const unitPrice = parseFloat(item.price_snapshot);
  const months = item.deal_type === 'RENTAL' ? item.rental_duration_months : 1;
  const lineTotal = unitPrice * quantity * months;

  // Get selected container details
  const selectedContainers = item.selected_container_ids && item.selected_container_ids.length > 0
    ? item.listing.listing_containers?.filter(c => item.selected_container_ids?.includes(c.id))
    : [];

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > (item.listing.available_quantity || 999)) {
      toast({
        variant: 'destructive',
        title: 'Vượt quá số lượng khả dụng',
        description: `Chỉ còn ${item.listing.available_quantity} container`,
      });
      return;
    }

    try {
      setIsUpdating(true);
      setQuantity(newQuantity);
      await updateQuantity(item.id, newQuantity);
      toast({
        title: 'Đã cập nhật',
        description: 'Số lượng đã được cập nhật',
      });
    } catch (error: any) {
      setQuantity(item.quantity); // Revert on error
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await removeFromCart(item.id);
      toast({
        title: 'Đã xóa',
        description: 'Đã xóa sản phẩm khỏi giỏ hàng',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
      setIsRemoving(false);
    }
  };

  return (
    <Card className={isRemoving ? 'opacity-50' : ''}>
      <div className="flex items-center gap-6 px-6">
        {/* Checkbox - centered vertically */}
        <div className="flex items-center self-stretch">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => toggleItemSelection(item.id)}
            className="self-center"
          />
        </div>

        {/* Card Content - Full width */}
        <div className="flex-1">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link 
                  href={`/listings/${item.listing_id}`}
                  className="hover:underline"
                >
                  <h3 className="text-lg font-semibold">{item.listing.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  Người bán: {sellerName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-destructive hover:text-destructive"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
      
          {/* Content Section */}
          <div className="space-y-4">
          {/* Deal Type & Location */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={item.deal_type === 'SALE' ? 'default' : 'secondary'}>
              {item.deal_type === 'SALE' ? 'Mua' : (
                item.listing.rental_unit 
                  ? `Thuê ${convertMonthsToRentalUnit(item.rental_duration_months, item.listing.rental_unit)} ${item.listing.rental_unit === 'YEAR' ? 'năm' : item.listing.rental_unit === 'QUARTER' ? 'quý' : item.listing.rental_unit === 'WEEK' ? 'tuần' : item.listing.rental_unit === 'DAY' ? 'ngày' : 'tháng'}`
                  : `Thuê ${item.rental_duration_months} tháng`
              )}
            </Badge>
            {locationName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationName}{locationProvince && `, ${locationProvince}`}
              </Badge>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-muted-foreground">
              Ghi chú: {item.notes}
            </p>
          )}

          {/* Selected Containers */}
          {selectedContainers && selectedContainers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Container đã chọn ({selectedContainers.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedContainers.map((container) => (
                  <Badge 
                    key={container.id} 
                    variant="outline"
                    className="font-mono text-xs"
                  >
                    {container.container_iso_code}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Price & Quantity */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đơn giá</p>
              <p className="font-semibold">
                {formatCurrency(unitPrice, item.currency)}
                {item.deal_type === 'RENTAL' && '/tháng'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min={1}
                max={item.listing.available_quantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleQuantityChange(val);
                  }
                }}
                className="w-16 text-center"
                disabled={isUpdating}
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= (item.listing.available_quantity || 999) || isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tổng</p>
              <p className="text-lg font-bold">
                {formatCurrency(lineTotal, item.currency)}
              </p>
              {item.deal_type === 'RENTAL' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(unitPrice, item.currency)} × {quantity} × {months} tháng
                </p>
              )}
            </div>
          </div>

          {/* Stock warning */}
          {item.listing.available_quantity && quantity >= item.listing.available_quantity * 0.8 && (
            <p className="text-xs text-orange-600">
              Chỉ còn {item.listing.available_quantity} container khả dụng
            </p>
          )}
          </div>
        </div>
      </div>
    </Card>
  );
}
