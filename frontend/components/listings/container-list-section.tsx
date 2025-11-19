"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Box, Loader2 } from 'lucide-react';

interface ContainerListSectionProps {
  listingId: string;
  isAdmin?: boolean;
}

export function ContainerListSection({ listingId, isAdmin = false }: ContainerListSectionProps) {
  const [containers, setContainers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        const apiUrl = '/api/v1';
        
        // Use admin endpoint if admin, otherwise public endpoint
        const endpoint = isAdmin 
          ? `${apiUrl}/admin/listings/${listingId}/containers`
          : `${apiUrl}/listings/${listingId}/containers`;
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(endpoint, { headers });

        if (response.ok) {
          const data = await response.json();
          setContainers(data.data?.containers || []);
          setSummary(data.data?.summary || null); // ✅ Lưu summary
        }
      } catch (error) {
        console.error('Error fetching containers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContainers();
  }, [listingId, isAdmin]);

  if (isLoading) {
    return (
      <Card className="shadow-sm border">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Box className="h-5 w-5 text-cyan-600" />
            Danh sách Container
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
            Danh sách Container
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Chưa có container nào</p>
            <p className="text-slate-400 text-sm mt-1">Container sẽ được hiển thị khi có sẵn</p>
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
          Danh sách Container ({containers.length})
        </CardTitle>
        <CardDescription>
          Chi tiết các container thuộc listing này
          {summary && (
            <span className="ml-2 text-xs">
              • Tổng: {summary.total} • Khả dụng: {summary.available} 
              {summary.reserved > 0 && ` • Đang giữ chỗ: ${summary.reserved}`}
              {summary.sold > 0 && ` • Đã bán: ${summary.sold}`}
              {summary.rented > 0 && ` • Đã cho thuê: ${summary.rented}`}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-bold text-slate-700">Container ID</th>
                <th className="text-left py-3 px-4 font-bold text-slate-700">Hãng tàu</th>
                <th className="text-left py-3 px-4 font-bold text-slate-700">Năm sản xuất</th>
                <th className="text-left py-3 px-4 font-bold text-slate-700">Trạng thái</th>
                <th className="text-left py-3 px-4 font-bold text-slate-700">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container, index) => (
                <tr key={container.id} className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-600">
                      {container.container_iso_code || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                      {container.shipping_line || 'Chưa có thông tin'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {container.manufactured_year || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={container.status === 'AVAILABLE' ? 'default' : 'secondary'}
                      className={
                        container.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-700 border-green-300' 
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {container.status === 'AVAILABLE' ? '✅ Khả dụng' : container.status || 'N/A'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm">
                    {container.created_at ? new Date(container.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
