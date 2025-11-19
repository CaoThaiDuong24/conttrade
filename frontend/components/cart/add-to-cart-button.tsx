'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Check, Loader2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContainerSelector } from '@/components/listings/container-selector';

// ✅ Helper function to get rental unit label
const getRentalUnitLabel = (unit?: string): string => {
  switch (unit?.toUpperCase()) {
    case 'DAY': return 'ngày';
    case 'WEEK': return 'tuần';
    case 'MONTH': return 'tháng';
    case 'QUARTER': return 'quý';
    case 'YEAR': return 'năm';
    default: return 'tháng';
  }
};

interface AddToCartButtonProps {
  listingId: string;
  dealType?: 'SALE' | 'RENTAL';
  maxQuantity?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  hasContainers?: boolean; // ✅ NEW: Flag to show container selector
  unitPrice?: number; // ✅ NEW: Price per unit for total calculation
  currency?: string; // ✅ NEW: Currency
  minRentalDuration?: number; // ✅ NEW: Min rental duration from listing
  maxRentalDuration?: number; // ✅ NEW: Max rental duration from listing
  rentalUnit?: string; // ✅ NEW: Rental unit (MONTH, WEEK, etc.)
}

export function AddToCartButton({
  listingId,
  dealType = 'SALE',
  maxQuantity = 100,
  className,
  variant = 'default',
  size = 'default',
  showIcon = true,
  hasContainers = false, // ✅ NEW
  unitPrice = 0, // ✅ NEW
  currency = 'USD', // ✅ NEW
  minRentalDuration = 1, // ✅ NEW: Default min 1 month
  maxRentalDuration = 60, // ✅ NEW: Default max 60 months
  rentalUnit = 'MONTH', // ✅ NEW: Default unit
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Dialog state
  const [quantity, setQuantity] = useState(1);
  const [selectedDealType, setSelectedDealType] = useState<'SALE' | 'RENTAL'>(dealType || 'SALE'); // ✅ FIX: Fallback to 'SALE'
  const [rentalMonths, setRentalMonths] = useState(minRentalDuration || 1); // ✅ FIX: Use minRentalDuration as default
  const [notes, setNotes] = useState('');
  
  // ✅ NEW: Container selection state
  const [containerSelection, setContainerSelection] = useState<{
    mode: 'quantity' | 'selection';
    quantity?: number;
    containerIds?: string[];
    containers?: any[];
    totalPrice?: number;
  }>({ mode: 'quantity', quantity: 1 });

  // Open dialog when button clicked
  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleAddToCart = async () => {
    // ✅ NEW: Use container selection if available
    const finalQuantity = hasContainers && containerSelection.mode === 'quantity' 
      ? containerSelection.quantity! 
      : quantity;
    
    const selectedContainerIds = hasContainers && containerSelection.mode === 'selection'
      ? containerSelection.containerIds
      : undefined;

    // Validate quantity
    if (finalQuantity < 1) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Số lượng phải lớn hơn 0',
      });
      return;
    }

    // ✅ NEW: Validate container selection if in selection mode
    if (hasContainers && containerSelection.mode === 'selection') {
      if (!selectedContainerIds || selectedContainerIds.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Vui lòng chọn ít nhất 1 container',
        });
        return;
      }
    }

    if (finalQuantity > maxQuantity) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Số lượng không được vượt quá ${maxQuantity}`,
      });
      return;
    }

    // Validate rental months for RENTAL type
    if (selectedDealType === 'RENTAL') {
      if (rentalMonths < minRentalDuration) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: `Thời gian thuê tối thiểu là ${minRentalDuration} ${getRentalUnitLabel(rentalUnit)}`,
        });
        return;
      }
      
      if (rentalMonths > maxRentalDuration) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: `Thời gian thuê tối đa là ${maxRentalDuration} ${getRentalUnitLabel(rentalUnit)}`,
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      
      // ✅ BUILD: Options object conditionally
      const options: any = {
        deal_type: selectedDealType,
        notes: notes.trim() || undefined,
        selected_container_ids: selectedContainerIds,
      };
      
      // ✅ FIX: Only include rental_duration_months for RENTAL deals
      if (selectedDealType === 'RENTAL') {
        // Convert from rentalUnit to actual months
        let durationInMonths = Math.max(rentalMonths, 1);
        switch (rentalUnit) {
          case 'YEAR':
            durationInMonths = rentalMonths * 12;
            break;
          case 'QUARTER':
            durationInMonths = rentalMonths * 3;
            break;
          case 'MONTH':
            durationInMonths = rentalMonths;
            break;
          case 'WEEK':
            durationInMonths = Math.round(rentalMonths / 4.33);
            break;
          case 'DAY':
            durationInMonths = Math.round(rentalMonths / 30);
            break;
        }
        options.rental_duration_months = durationInMonths;
      }
      
      await addToCart(listingId, finalQuantity, options);
      
      setShowDialog(false);
      setIsAdded(true);
      
      const message = selectedContainerIds 
        ? `Đã thêm ${selectedContainerIds.length} container vào giỏ hàng`
        : `Đã thêm ${finalQuantity} container vào giỏ hàng`;
      
      toast({
        title: 'Đã thêm vào giỏ hàng',
        description: message,
      });
      
      // Reset form
      setQuantity(1);
      setNotes('');
      setRentalMonths(1);
      setContainerSelection({ mode: 'quantity', quantity: 1 });
      
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể thêm vào giỏ hàng',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        disabled={isAdded}
        variant={variant}
        size={size}
        className={className}
      >
        {isAdded && <Check className="mr-2 h-4 w-4" />}
        {!isAdded && showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
        {isAdded ? 'Đã thêm' : 'Thêm vào giỏ'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Thêm vào giỏ hàng
            </DialogTitle>
            <DialogDescription>
              {hasContainers 
                ? `Chọn container hoặc nhập số lượng cần ${selectedDealType === 'RENTAL' ? 'thuê' : 'mua'}`
                : `Vui lòng nhập số lượng container và các thông tin khác`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* ✅ NEW: Container Selector - Show if listing has containers */}
            {hasContainers && (
              <ContainerSelector
                listingId={listingId}
                onSelectionChange={setContainerSelection}
                unitPrice={unitPrice}
                currency={currency}
                maxQuantity={maxQuantity}
                dealType={selectedDealType} // ✅ Pass dealType to ContainerSelector
              />
            )}

            {/* ✅ LEGACY: Quantity input - Show if NO containers */}
            {!hasContainers && (
              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-base font-medium">
                  Số lượng cần {selectedDealType === 'RENTAL' ? 'thuê' : 'mua'} <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={maxQuantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= maxQuantity) {
                          setQuantity(val);
                        }
                      }}
                      className="flex-1 text-center font-semibold"
                      placeholder="Số lượng"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tối đa: {maxQuantity} container</span>
                    {unitPrice > 0 && (
                      <span className="font-semibold text-blue-600">
                        Tạm tính: {(quantity * unitPrice).toLocaleString()} {currency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="dealType" className="text-base font-medium">
                Loại giao dịch
              </Label>
              <Select
                value={selectedDealType}
                onValueChange={(value) => setSelectedDealType(value as 'SALE' | 'RENTAL')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">Mua</SelectItem>
                  <SelectItem value="RENTAL">Thuê</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedDealType === 'RENTAL' && (
              <div className="space-y-3">
                <Label htmlFor="rentalMonths" className="text-base font-medium">
                  Số {getRentalUnitLabel(rentalUnit)} thuê <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <Input
                    id="rentalMonths"
                    type="number"
                    min={minRentalDuration}
                    max={maxRentalDuration}
                    value={rentalMonths}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      // ✅ Allow user to type freely, validate on submit
                      setRentalMonths(val);
                    }}
                    placeholder={`Nhập số ${getRentalUnitLabel(rentalUnit)} thuê`}
                    className={`text-center font-semibold ${
                      rentalMonths < minRentalDuration || rentalMonths > maxRentalDuration
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tối thiểu: {minRentalDuration} {getRentalUnitLabel(rentalUnit)}</span>
                    <span>Tối đa: {maxRentalDuration} {getRentalUnitLabel(rentalUnit)}</span>
                  </div>
                  {/* ✅ Show error message if out of range */}
                  {(rentalMonths < minRentalDuration || rentalMonths > maxRentalDuration) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                      <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {rentalMonths < minRentalDuration 
                          ? `Tối thiểu ${minRentalDuration} ${getRentalUnitLabel(rentalUnit)}`
                          : `Tối đa ${maxRentalDuration} ${getRentalUnitLabel(rentalUnit)}`
                        }
                      </span>
                    </div>
                  )}
                  {unitPrice > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Giá thuê:</span>
                        <span className="font-medium text-gray-900">
                          {unitPrice.toLocaleString()} {currency}/{getRentalUnitLabel(rentalUnit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-700">Thời gian:</span>
                        <span className="font-medium text-gray-900">{rentalMonths} {getRentalUnitLabel(rentalUnit)}</span>
                      </div>
                      <div className="border-t border-blue-300 mt-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900">Tạm tính:</span>
                          <span className="font-bold text-blue-900 text-lg">
                            {(unitPrice * rentalMonths * (hasContainers && containerSelection.mode === 'quantity' ? containerSelection.quantity! : quantity)).toLocaleString()} {currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-medium">
                Ghi chú (tùy chọn)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú tùy chọn (ví dụ: yêu cầu giao hàng, điều kiện đặc biệt...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleAddToCart} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <ShoppingCart className="mr-2 h-4 w-4" />}
              {hasContainers 
                ? (containerSelection.mode === 'selection' 
                    ? `Thêm ${containerSelection.containerIds?.length || 0} container`
                    : `Thêm ${containerSelection.quantity || 1} container`)
                : `Thêm ${quantity} container`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
