"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, AlertTriangle, XCircle, Upload, Info, Loader2, User, X, Image as ImageIcon } from 'lucide-react';

interface ConfirmReceiptFormProps {
  isOpen: boolean;
  orderId: string;
  deliveryId?: string; // Optional: For confirming individual container
  containerId?: string; // Optional: For confirming individual container
  containerCode?: string; // Optional: For displaying container code
  onSuccess: () => void;
  onClose: () => void;
}

type ConditionType = 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE';

export function ConfirmReceiptForm({ isOpen, orderId, deliveryId, containerId, containerCode, onSuccess, onClose }: ConfirmReceiptFormProps) {
  const [loading, setLoading] = useState(false);
  const [receivedBy, setReceivedBy] = useState('');
  const [condition, setCondition] = useState<ConditionType>('GOOD');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if this is for a single container or whole order
  const isSingleContainer = !!(deliveryId && containerId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} không phải là hình ảnh`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} quá lớn. Kích thước tối đa 5MB`);
          continue;
        }

        // Convert to base64 for preview (temporary solution)
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        uploadedUrls.push(base64);
      }

      setPhotos([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Có lỗi khi tải ảnh lên');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receivedBy.trim()) {
      alert('Vui lòng nhập tên người nhận hàng');
      return;
    }

    if (condition === 'MAJOR_DAMAGE' && !notes.trim()) {
      alert('Vui lòng mô tả chi tiết vấn đề khi báo cáo hư hỏng nghiêm trọng');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Vui lòng đăng nhập');
        return;
      }

      // Determine API endpoint based on whether confirming single container or whole order
      const apiUrl = isSingleContainer
        ? `/api/v1/deliveries/${deliveryId}/containers/${containerId}/confirm-receipt`
        : `/api/v1/orders/${orderId}/confirm-receipt`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receivedBy: receivedBy.trim(),
          condition,
          notes: notes.trim(),
          photos,
          receivedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess();
        // Reset form
        setReceivedBy('');
        setCondition('GOOD');
        setNotes('');
        setPhotos([]);
      } else {
        alert(result.message || 'Có lỗi xảy ra khi xác nhận nhận hàng');
      }
    } catch (error: any) {
      console.error('Error confirming receipt:', error);
      alert('Có lỗi xảy ra khi xác nhận nhận hàng');
    } finally {
      setLoading(false);
    }
  };

  const getConditionIcon = (cond: ConditionType) => {
    switch (cond) {
      case 'GOOD':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'MINOR_DAMAGE':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'MAJOR_DAMAGE':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getConditionColor = (cond: ConditionType) => {
    switch (cond) {
      case 'GOOD':
        return 'border-green-500 bg-green-50';
      case 'MINOR_DAMAGE':
        return 'border-yellow-500 bg-yellow-50';
      case 'MAJOR_DAMAGE':
        return 'border-red-500 bg-red-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden border-none shadow-2xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  {isSingleContainer ? 'Xác nhận nhận container' : 'Xác nhận nhận hàng (Bước 7.2)'}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2 text-sm">
                  {isSingleContainer && containerCode ? (
                    <>Container: <span className="font-mono font-semibold">{containerCode}</span></>
                  ) : (
                    'Vui lòng kiểm tra kỹ hàng hóa và xác nhận tình trạng khi nhận'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info Box */}
          <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Lưu ý quan trọng</h3>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Kiểm tra container bên ngoài trước khi xác nhận</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Chụp ảnh làm bằng chứng nếu có vấn đề</span>
                    </li>
                    {isSingleContainer ? (
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Bạn đang xác nhận <strong>từng container riêng lẻ</strong></span>
                      </li>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>Nếu hàng tốt hoặc chỉ hư hỏng nhỏ, đơn hàng sẽ hoàn tất</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>Nếu hàng hư hỏng nghiêm trọng, tranh chấp sẽ được tạo để admin xem xét</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Received By */}
          <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Thông tin người nhận</h3>
                <p className="text-xs text-gray-500">Người đại diện nhận container</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/50 space-y-2">
              <Label htmlFor="receivedBy" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Người nhận hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="receivedBy"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Nhập tên người đã nhận container"
                required
                className="border-gray-200"
              />
              <p className="text-xs text-gray-500">Tên của người trực tiếp nhận container</p>
            </div>
          </div>

          {/* Condition */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Tình trạng hàng hóa</h3>
                <p className="text-xs text-gray-500">
                  Chọn tình trạng {isSingleContainer ? 'container' : 'hàng hóa'} khi nhận <span className="text-red-500">*</span>
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100/50">
              <RadioGroup value={condition} onValueChange={(value) => setCondition(value as ConditionType)} className="space-y-3">
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                condition === 'GOOD' ? getConditionColor('GOOD') : 'border-gray-200 hover:border-gray-300'
              }`}>
                <RadioGroupItem value="GOOD" id="good" className="mt-1" />
                <label htmlFor="good" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    {getConditionIcon('GOOD')}
                    <span className="font-semibold text-gray-900">Tốt - Không có vấn đề</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Container nguyên vẹn, không có dấu hiệu hư hỏng. {!isSingleContainer && 'Đơn hàng sẽ được hoàn tất.'}
                  </p>
                </label>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                condition === 'MINOR_DAMAGE' ? getConditionColor('MINOR_DAMAGE') : 'border-gray-200 hover:border-gray-300'
              }`}>
                <RadioGroupItem value="MINOR_DAMAGE" id="minor" className="mt-1" />
                <label htmlFor="minor" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    {getConditionIcon('MINOR_DAMAGE')}
                    <span className="font-semibold text-gray-900">Hư hỏng nhỏ</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Có một số vấn đề nhỏ nhưng vẫn chấp nhận được. {!isSingleContainer && 'Đơn hàng vẫn hoàn tất.'}
                  </p>
                </label>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                condition === 'MAJOR_DAMAGE' ? getConditionColor('MAJOR_DAMAGE') : 'border-gray-200 hover:border-gray-300'
              }`}>
                <RadioGroupItem value="MAJOR_DAMAGE" id="major" className="mt-1" />
                <label htmlFor="major" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    {getConditionIcon('MAJOR_DAMAGE')}
                    <span className="font-semibold text-gray-900">Hư hỏng nghiêm trọng</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Container bị hư hỏng nghiêm trọng hoặc không đúng mô tả. {!isSingleContainer && 'Tranh chấp sẽ được tạo.'}
                  </p>
                </label>
              </div>
            </RadioGroup>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1">
                  Ghi chú {condition === 'MAJOR_DAMAGE' && <span className="text-red-500">*</span>}
                </h3>
                <p className="text-xs text-gray-500">Mô tả chi tiết tình trạng {isSingleContainer ? 'container' : 'hàng hóa'}</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100/50 space-y-2">
              <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                condition === 'GOOD' 
                  ? 'Ghi chú thêm (nếu có)...' 
                  : condition === 'MINOR_DAMAGE'
                  ? 'Mô tả các vấn đề nhỏ...'
                  : 'Mô tả chi tiết các vấn đề và hư hỏng...'
              }
              rows={4}
              required={condition === 'MAJOR_DAMAGE'}
              className={`resize-none border-gray-200 ${
                condition === 'MAJOR_DAMAGE' 
                  ? 'focus:border-red-500 focus:ring-red-500' 
                  : 'focus:border-green-500 focus:ring-green-500'
              }`}
            />
            {condition === 'MAJOR_DAMAGE' && !isSingleContainer && (
              <p className="text-xs text-red-600">
                Vui lòng mô tả chi tiết vấn đề để admin có thể xem xét
              </p>
            )}
            {condition === 'MAJOR_DAMAGE' && isSingleContainer && (
              <p className="text-xs text-red-600">
                Vui lòng mô tả chi tiết vấn đề
              </p>
            )}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Hình ảnh bằng chứng</h3>
                <p className="text-xs text-gray-500">Tải lên ảnh container (tùy chọn)</p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 space-y-4">
              {/* Upload Button */}
              <div className="flex items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-purple-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  {uploadingPhotos ? (
                    <>
                      <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-3" />
                      <p className="text-sm text-purple-600 font-medium">Đang tải ảnh lên...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-purple-500 mb-3" />
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Click để chọn ảnh
                      </p>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi ảnh)
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Đã chọn {photos.length} ảnh
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {photos.length === 0 && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">
                    Chưa có ảnh nào được chọn
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning for Major Damage */}
          {condition === 'MAJOR_DAMAGE' && (
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl p-6 border border-red-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Cảnh báo quan trọng</h3>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-100/50">
                    <p className="text-sm text-gray-700">
                      {isSingleContainer ? (
                        'Container này sẽ được đánh dấu là hư hỏng nghiêm trọng. Vấn đề sẽ được ghi nhận.'
                      ) : (
                        'Khi chọn "Hư hỏng nghiêm trọng", một tranh chấp sẽ được tạo và đơn hàng sẽ chuyển sang trạng thái chờ admin xem xét. Thanh toán cho seller sẽ bị tạm giữ.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 ${
                condition === 'MAJOR_DAMAGE'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              } text-white font-semibold`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : condition === 'MAJOR_DAMAGE' ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {isSingleContainer ? 'Xác nhận hư hỏng' : 'Tạo tranh chấp'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isSingleContainer ? 'Xác nhận container này' : 'Xác nhận nhận hàng'}
                </>
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
