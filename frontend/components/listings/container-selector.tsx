"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Box, Loader2, Filter, CheckCircle2, CheckSquare } from 'lucide-react';

interface Container {
  id: string;
  listing_id: string;
  container_iso_code: string;
  shipping_line: string | null;
  manufactured_year: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Summary {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  rented: number;
}

interface ContainerSelectorProps {
  listingId: string;
  onSelectionChange?: (selection: {
    mode: 'quantity' | 'selection';
    quantity?: number;
    containerIds?: string[];
    containers?: Container[];
    totalPrice?: number;
  }) => void;
  unitPrice?: number;
  currency?: string;
  maxQuantity?: number;
  dealType?: 'SALE' | 'RENTAL'; // ✅ NEW: Add dealType prop
}

export function ContainerSelector({ 
  listingId, 
  onSelectionChange,
  unitPrice = 0,
  currency = 'USD',
  maxQuantity = 100,
  dealType = 'SALE' // ✅ NEW: Default to SALE
}: ContainerSelectorProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'quantity' | 'selection'>('quantity');
  const [quantity, setQuantity] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filters
  const [filterShippingLine, setFilterShippingLine] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  
  // ✅ FIX: Use ref to track if we need to notify parent (prevent infinite loop)
  const lastNotifiedSelection = useRef<string>('');
  
  // ✅ FIX: Stable callback ref to prevent infinite loop
  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    fetchContainers();
  }, [listingId]);

  // ✅ FIX: Notify parent only when selection actually changes (prevent infinite loop)
  useEffect(() => {
    if (!onSelectionChangeRef.current) return;

    let selectionData;
    let selectionKey;

    if (mode === 'quantity') {
      selectionKey = `quantity-${quantity}`;
      selectionData = {
        mode: 'quantity' as const,
        quantity,
        totalPrice: quantity * unitPrice
      };
    } else {
      const selectedArray = Array.from(selectedIds);
      selectionKey = `selection-${selectedArray.sort().join(',')}`;
      const selected = containers.filter(c => selectedIds.has(c.id));
      selectionData = {
        mode: 'selection' as const,
        quantity: selectedIds.size,
        containerIds: selectedArray,
        containers: selected,
        totalPrice: selectedIds.size * unitPrice
      };
    }

    // Only call parent callback if selection actually changed
    if (lastNotifiedSelection.current !== selectionKey) {
      lastNotifiedSelection.current = selectionKey;
      onSelectionChangeRef.current(selectionData);
    }
  }, [mode, quantity, selectedIds, unitPrice, containers]); // ✅ Removed onSelectionChange from deps

  const fetchContainers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = '/api/v1';
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/listings/${listingId}/containers`, { headers });

      if (response.ok) {
        const data = await response.json();
        setContainers(data.data?.containers || []);
        setSummary(data.data?.summary || null);
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContainer = (containerId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(containerId)) {
      newSelected.delete(containerId);
    } else {
      newSelected.add(containerId);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredContainers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContainers.map(c => c.id)));
    }
  };

  // Get unique shipping lines and years for filters
  const shippingLines = Array.from(new Set(containers.map(c => c.shipping_line).filter(Boolean)));
  const years = Array.from(new Set(containers.map(c => c.manufactured_year).filter(Boolean))).sort((a, b) => b! - a!);

  // Filter containers
  const filteredContainers = containers.filter(c => {
    if (filterShippingLine !== 'all' && c.shipping_line !== filterShippingLine) return false;
    if (filterYear !== 'all' && c.manufactured_year?.toString() !== filterYear) return false;
    return true;
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Box className="h-5 w-5 text-cyan-600" />
            Chọn Container
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2 mx-auto" />
            <p className="text-slate-500 text-sm">Đang tải danh sách container...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (containers.length === 0) {
    return (
      <Card className="shadow-sm border">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Box className="h-5 w-5 text-cyan-600" />
            Thông tin Container
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Chưa có thông tin container chi tiết</p>
            <p className="text-slate-400 text-sm mt-1">
              Vui lòng nhập số lượng cần {dealType === 'RENTAL' ? 'thuê' : 'mua'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Box className="h-5 w-5 text-cyan-600" />
          Chọn Container ({summary?.available || 0} khả dụng)
        </CardTitle>
        <CardDescription>
          {summary && (
            <span className="text-xs">
              Tổng: {summary.total} • Khả dụng: {summary.available}
              {summary.reserved > 0 && ` • Đang giữ chỗ: ${summary.reserved}`}
              {summary.sold > 0 && ` • Đã bán: ${summary.sold}`}
              {summary.rented > 0 && ` • Đã cho thuê: ${summary.rented}`}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Mode Toggle - More Compact */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => {
              setMode('quantity');
              setSelectedIds(new Set());
            }}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              mode === 'quantity' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <Package className="h-4 w-4" />
            <span className="font-medium text-sm">Theo số lượng</span>
          </div>
          <div
            onClick={() => {
              setMode('selection');
              setQuantity(1);
            }}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              mode === 'selection' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span className="font-medium text-sm">Chọn từng con</span>
          </div>
        </div>

        {/* Mode: Quantity */}
        {mode === 'quantity' && (
          <div className="space-y-3">
            {/* Quantity Input - More Compact */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 mb-1 block">
                    Số lượng cần {dealType === 'RENTAL' ? 'thuê' : 'mua'}
                  </Label>
                  <p className="text-xs text-slate-500">
                    Tối đa {summary?.available || 0} containers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </Button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={Math.min(maxQuantity, summary?.available || 0)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, summary?.available || 0)))}
                    className="w-16 text-center border-2 border-slate-300 rounded-lg py-2 font-bold text-lg focus:border-blue-500 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setQuantity(Math.min(summary?.available || 0, quantity + 1))}
                    disabled={quantity >= (summary?.available || 0)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Alert - More Compact */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Hệ thống sẽ tự động chọn <span className="font-semibold">{quantity} container</span> khả dụng cho bạn
              </p>
            </div>

            {/* Preview containers */}
            <details className="bg-white border border-slate-200 rounded-lg overflow-hidden group">
              <summary className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 text-sm flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Xem danh sách {summary?.available} containers</span>
                </div>
                <span className="text-xs text-slate-400 group-open:hidden">Click để mở</span>
                <span className="text-xs text-slate-400 hidden group-open:inline">Click để đóng</span>
              </summary>
              <div className="border-t bg-slate-50">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 sticky top-0 border-b-2 border-slate-200">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs uppercase w-12">#</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs uppercase">Container ID</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs uppercase">Hãng tàu</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs uppercase">Năm SX</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {containers.map((container, index) => (
                        <tr key={container.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="py-2 px-3 text-slate-500 text-xs">{index + 1}</td>
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-blue-600 text-sm">
                              {container.container_iso_code}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                              {container.shipping_line || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-medium text-sm">
                            {container.manufactured_year || 'N/A'}
                          </td>
                          <td className="py-2 px-3">
                            <Badge 
                              variant="default"
                              className="bg-green-100 text-green-700 border-green-200 text-xs"
                            >
                              ✓ Sẵn sàng
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Tổng tiền:</span>
                <span className="text-2xl font-bold text-green-700">
                  {(quantity * unitPrice).toLocaleString()} {currency}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {quantity} container × {unitPrice.toLocaleString()} {currency}
              </p>
            </div>
          </div>
        )}

        {/* Mode: Selection */}
        {mode === 'selection' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={filterShippingLine} onValueChange={setFilterShippingLine}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Hãng tàu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hãng tàu</SelectItem>
                  {shippingLines.map(line => (
                    <SelectItem key={line} value={line!}>{line}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Năm SX" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year!.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={toggleAll}
                className="ml-auto"
              >
                {selectedIds.size === filteredContainers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>

            {/* Container List */}
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-100 sticky top-0">
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 font-bold text-slate-700 w-12"></th>
                    <th className="text-left py-3 px-4 font-bold text-slate-700">Container ID</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-700">Hãng tàu</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-700">Năm SX</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContainers.map((container, index) => (
                    <tr 
                      key={container.id} 
                      className={`border-b hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      } ${selectedIds.has(container.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(container.id)}
                          onCheckedChange={(checked) => {
                            toggleContainer(container.id);
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => toggleContainer(container.id)}>
                        <span className="font-mono font-bold text-blue-600">
                          {container.container_iso_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => toggleContainer(container.id)}>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          {container.shipping_line || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold cursor-pointer" onClick={() => toggleContainer(container.id)}>
                        {container.manufactured_year || 'N/A'}
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => toggleContainer(container.id)}>
                        <Badge 
                          variant={container.status === 'AVAILABLE' ? 'default' : 'secondary'}
                          className={
                            container.status === 'AVAILABLE' 
                              ? 'bg-green-100 text-green-700 border-green-300' 
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {container.status === 'AVAILABLE' ? '✅ Khả dụng' : container.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selection Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-800">Đã chọn: {selectedIds.size} containers</span>
              </div>
              
              {selectedIds.size > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.from(selectedIds).slice(0, 5).map(id => {
                    const container = containers.find(c => c.id === id);
                    return container ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {container.container_iso_code}
                      </Badge>
                    ) : null;
                  })}
                  {selectedIds.size > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedIds.size - 5} nữa
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                <span className="font-medium text-slate-700">Tổng tiền:</span>
                <span className="text-2xl font-bold text-blue-700">
                  {(selectedIds.size * unitPrice).toLocaleString()} {currency}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {selectedIds.size} container × {unitPrice.toLocaleString()} {currency}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
