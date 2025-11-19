'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/lib/contexts/cart-context';
import { CartItem } from '@/components/cart/cart-item';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    loading, 
    error, 
    clearCart, 
    getTotalItems, 
    getTotalAmount, 
    refreshCart,
    selectAllItems,
    clearSelection,
    selectedItemIds,
    getSelectedItemsCount,
    getSelectedTotalAmount
  } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleClearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    
    try {
      await clearCart();
      toast({
        title: 'Đã xóa giỏ hàng',
        description: 'Giỏ hàng đã được xóa thành công',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
    }
  };

  const handleCheckout = (type: 'rfq' | 'order') => {
    router.push(`/cart/checkout?type=${type}`);
  };

  if (loading && !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const isEmpty = !cart || cart.cart_items.length === 0;

  // Check if all items are selected
  const allSelected = !isEmpty && cart && selectedItemIds.length === cart.cart_items.length;
  const someSelected = selectedItemIds.length > 0 && selectedItemIds.length < (cart?.cart_items.length || 0);

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllItems();
    }
  };

  // Group items by currency
  const currencyGroups = cart?.cart_items.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = [];
    }
    acc[item.currency].push(item);
    return acc;
  }, {} as Record<string, typeof cart.cart_items>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Giỏ hàng của bạn
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEmpty ? 'Giỏ hàng trống' : `${totalItems} sản phẩm trong giỏ`}
        </p>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
            </p>
            <Button onClick={() => router.push('/listings')}>
              Xem sản phẩm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=indeterminate]:bg-primary"
                  data-state={someSelected ? 'indeterminate' : undefined}
                />
                <h2 className="text-xl font-semibold">
                  {selectedItemIds.length > 0 ? (
                    <>Đã chọn {selectedItemIds.length}/{cart.cart_items.length}</>
                  ) : (
                    <>Sản phẩm ({cart.cart_items.length})</>
                  )}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tất cả
              </Button>
            </div>

            {cart.cart_items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tổng đơn hàng</CardTitle>
                <CardDescription>
                  {selectedItemIds.length > 0 ? (
                    <>Đã chọn {selectedItemIds.length} sản phẩm</>
                  ) : (
                    <>Tổng cộng {totalItems} sản phẩm</>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {selectedItemIds.length === 0 ? (
                    // Show 0 when no items selected
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tổng phụ
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(0, cart.cart_items[0]?.currency || 'VND')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Show selected items total
                    Object.entries(currencyGroups || {}).map(([currency, items]) => {
                      const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
                      
                      const subtotal = selectedItems.reduce((sum, item) => {
                        const price = parseFloat(item.price_snapshot);
                        const months = item.deal_type === 'RENTAL' ? 
                          item.rental_duration_months : 1;
                        return sum + (price * item.quantity * months);
                      }, 0);

                      if (selectedItems.length === 0) return null;

                      return (
                        <div key={currency}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Tổng phụ ({currency})
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(subtotal, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thuế VAT</span>
                      <span>Chưa bao gồm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span>Tính sau</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng cộng</span>
                    <div className="text-right">
                      {selectedItemIds.length === 0 ? (
                        <div>
                          {formatCurrency(0, cart.cart_items[0]?.currency || 'VND')}
                        </div>
                      ) : (
                        Object.entries(currencyGroups || {}).map(([currency]) => {
                          const total = getSelectedTotalAmount(currency);
                          
                          if (total === 0) return null;
                          
                          return (
                            <div key={currency}>
                              {formatCurrency(total, currency)}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleCheckout('order')}
                  disabled={selectedItemIds.length === 0}
                >
                  Đặt hàng ngay
                  {selectedItemIds.length > 0 && ` (${selectedItemIds.length})`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleCheckout('rfq')}
                  disabled={selectedItemIds.length === 0}
                >
                  Tạo yêu cầu báo giá (RFQ)
                  {selectedItemIds.length > 0 && ` (${selectedItemIds.length})`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
