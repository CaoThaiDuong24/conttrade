'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Upload, X, Image as ImageIcon, FileText, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { vi } from 'date-fns/locale';

interface PrepareDeliveryFormProps {
  orderId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PrepareDeliveryForm({ orderId, onSuccess, onCancel }: PrepareDeliveryFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles(prev => [...prev, ...files]);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocFiles(prev => [...prev, ...files]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDoc = (index: number) => {
    setDocFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getMinDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estimatedDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ngày dự kiến sẵn sàng',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      // TODO: Implement file upload to S3/CloudStorage
      // For now, we'll send without files
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      
      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/prepare-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          preparationNotes,
          estimatedReadyDate: new Date(estimatedDate).toISOString(),
          conditionNotes,
          inspectionPhotos: [], // TODO: Upload files first
          documents: [], // TODO: Upload files first
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Thành công!',
          description: 'Đã bắt đầu chuẩn bị container. Buyer sẽ nhận được thông báo.',
        });
        onSuccess?.();
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể chuẩn bị giao hàng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-0 shadow-none">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900">
              Bắt đầu chuẩn bị giao hàng
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Xác nhận bạn đang bắt đầu chuẩn bị container để giao cho buyer
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6 max-h-[65vh] overflow-y-auto">
          {/* Estimated Ready Date */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDate" className="text-sm font-medium text-gray-900">
              Dự kiến sẵn sàng <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="estimatedDate"
                type="date"
                value={estimatedDate}
                onChange={(e) => setEstimatedDate(e.target.value)}
                min={getMinDate()}
                required
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Chọn ngày"
              />
            </div>
            {estimatedDate && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                Đã chọn: {new Date(estimatedDate).toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>

          {/* Preparation Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-900">
              Ghi chú chuẩn bị
            </Label>
            <Textarea
              id="notes"
              placeholder="Mô tả quá trình chuẩn bị: kiểm tra, vệ sinh, sửa chữa..."
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              rows={4}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Mô tả chi tiết các công việc bạn sẽ thực hiện để chuẩn bị container
            </p>
          </div>

          {/* Condition Notes */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-sm font-medium text-gray-900">
              Ghi chú tình trạng container
            </Label>
            <Textarea
              id="condition"
              placeholder="Mô tả tình trạng hiện tại của container..."
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              rows={3}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Ghi chú về tình trạng container trước khi bắt đầu chuẩn bị
            </p>
          </div>

          {/* Inspection Photos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Ảnh kiểm tra container
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all duration-200 bg-gray-50 hover:bg-blue-50/50">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click để upload hoặc kéo thả ảnh vào đây
                </p>
                <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB mỗi file</p>
              </div>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                className="mt-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={handlePhotoChange}
              />
            </div>
            
            {photoFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  📷 Đã chọn {photoFiles.length} ảnh
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {photoFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate flex-1" title={file.name}>
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-100 rounded-full"
                        onClick={() => removePhoto(idx)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Tài liệu đính kèm <span className="text-gray-500 font-normal">(nếu có)</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all duration-200 bg-gray-50 hover:bg-blue-50/50">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload tài liệu PDF, Word
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX tối đa 10MB mỗi file</p>
              </div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                className="mt-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                onChange={handleDocChange}
              />
            </div>
            
            {docFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  📄 Đã chọn {docFiles.length} tài liệu
                </p>
                <div className="space-y-2">
                  {docFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate flex-1" title={file.name}>
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-100 rounded-full"
                        onClick={() => removeDoc(idx)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={loading}
            className="min-w-[120px] h-11 border-gray-300 hover:bg-gray-100"
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !estimatedDate}
            className="min-w-[180px] h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Bắt đầu chuẩn bị
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
