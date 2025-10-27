"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  DollarSign,
  Package,
  Plus,
  Minus,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { Quote, QuoteItem, updateQuote } from '@/lib/api/quotes';

interface EditQuoteModalProps {
  open: boolean;
  onClose: () => void;
  quote: Quote | null;
  onQuoteUpdated: (updatedQuote: Quote) => void;
}

export default function EditQuoteModal({ 
  open, 
  onClose, 
  quote, 
  onQuoteUpdated 
}: EditQuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize form when quote changes
  useEffect(() => {
    if (quote) {
      setItems(quote.items || []);
      setCurrency(quote.currency || 'USD');
      setValidUntil(quote.valid_until ? new Date(quote.valid_until).toISOString().split('T')[0] : '');
      setDeliveryTerms(quote.delivery_terms || '');
      setPaymentTerms(quote.payment_terms || '');
      setNotes(quote.notes || '');
    }
  }, [quote]);

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate total_price for this item
    if (field === 'qty' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].qty * updatedItems[index].unit_price;
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: `temp-${Date.now()}`,
      item_type: 'container',
      description: '',
      qty: 1,
      unit_price: 0,
      total_price: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        items,
        total_amount: calculateTotal(),
        currency,
        valid_until: validUntil,
        delivery_terms: deliveryTerms,
        payment_terms: paymentTerms,
        notes,
      };

      const response = await updateQuote(quote.id, updateData);
      onQuoteUpdated(response.quote);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật báo giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (!quote || quote.status !== 'draft') return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chỉnh sửa báo giá
          </DialogTitle>
          <DialogDescription>
            RFQ: {quote.rfq_title} - Buyer: {quote.buyer_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Chi tiết báo giá</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Thêm item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Loại</Label>
                      <Select
                        value={item.item_type}
                        onValueChange={(value: 'container' | 'service') => 
                          handleItemChange(index, 'item_type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="container">Container</SelectItem>
                          <SelectItem value="service">Dịch vụ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Mô tả</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Mô tả sản phẩm/dịch vụ"
                      />
                    </div>

                    <div>
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label>Đơn giá ({currency})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <Label className="text-sm text-muted-foreground">Thành tiền:</Label>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Terms and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Điều khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tiền tệ</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Hiệu lực đến</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>Điều khoản giao hàng</Label>
                  <Select value={deliveryTerms} onValueChange={setDeliveryTerms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn điều khoản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                      <SelectItem value="CIF">CIF - Cost, Insurance, Freight</SelectItem>
                      <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                      <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Điều khoản thanh toán</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn điều khoản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100% Advance">100% Trước</SelectItem>
                      <SelectItem value="50% Advance, 50% COD">50% Trước, 50% COD</SelectItem>
                      <SelectItem value="30 days">30 ngày</SelectItem>
                      <SelectItem value="LC">Letter of Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tổng kết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-sm text-muted-foreground">Tổng giá trị</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </div>
                </div>

                <div>
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú thêm về báo giá..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || items.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật báo giá'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}