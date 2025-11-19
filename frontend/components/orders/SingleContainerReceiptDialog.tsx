"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Package,
  Upload,
  X
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';

interface Props {
  deliveryId: string;
  container: {
    id: string;
    container_iso_code: string;
  };
  batchNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SingleContainerReceiptDialog({
  deliveryId,
  container,
  batchNumber,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [receivedBy, setReceivedBy] = useState('');
  const [condition, setCondition] = useState<'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE'>('GOOD');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotificationContext();

  const handlePhotoUpload = async (file: File) => {
    // TODO: Implement actual photo upload to S3 or your storage
    // For now, just create a local URL
    const photoUrl = URL.createObjectURL(file);
    setPhotos(prev => [...prev, photoUrl]);
  };

  const handleRemovePhoto = (photoUrl: string) => {
    setPhotos(prev => prev.filter(p => p !== photoUrl));
  };

  const handleSubmit = async () => {
    // Validation
    if (!receivedBy.trim()) {
      showError('Vui lòng nhập tên người nhận hàng');
      return;
    }

    if ((condition === 'MINOR_DAMAGE' || condition === 'MAJOR_DAMAGE') && !notes.trim()) {
      showError('Vui lòng nhập ghi chú cho container bị hư hỏng');
      return;
    }

    if (condition === 'MAJOR_DAMAGE' && photos.length === 0) {
      showError('Vui lòng upload ảnh cho container hư hỏng nặng');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `/api/v1/deliveries/${deliveryId}/containers/${container.id}/confirm-receipt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receivedBy,
            condition,
            notes: notes || undefined,
            photos: photos.length > 0 ? photos : undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm receipt');
      }

      const result = await response.json();
      
      let message = result.message || 'Xác nhận nhận hàng thành công';
      
      // If dispute was created, notify user
      if (result.data?.dispute) {
        message += '\n\nĐã tự động tạo tranh chấp cho container hư hỏng nặng.';
      }
      
      showSuccess(message);
      onSuccess();
    } catch (error: any) {
      console.error('Error confirming receipt:', error);
      showError(error.message || 'Failed to confirm receipt');
    } finally {
      setLoading(false);
    }
  };

  const getConditionIcon = (conditionType: string) => {
    switch (conditionType) {
      case 'GOOD':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'MINOR_DAMAGE':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'MAJOR_DAMAGE':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Xác nhận nhận container
          </DialogTitle>
          <DialogDescription>
            {container.container_iso_code} - Batch {batchNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Received By */}
          <div>
            <Label htmlFor="receivedBy">Người nhận hàng *</Label>
            <Input
              id="receivedBy"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Nhập tên người nhận hàng"
              className="mt-1"
            />
          </div>

          {/* Condition Selection */}
          <div>
            <Label className="text-sm">Tình trạng container *</Label>
            <RadioGroup
              value={condition}
              onValueChange={(value) => setCondition(value as any)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GOOD" id="good" />
                <Label htmlFor="good" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Container trong tình trạng tốt
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MINOR_DAMAGE" id="minor" />
                <Label htmlFor="minor" className="flex items-center gap-2 cursor-pointer">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Hư hỏng nhẹ (vết trầy, xước)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MAJOR_DAMAGE" id="major" />
                <Label htmlFor="major" className="flex items-center gap-2 cursor-pointer">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Hư hỏng nặng (cửa hỏng, thủng, biến dạng)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes (required for damaged containers) */}
          {(condition === 'MINOR_DAMAGE' || condition === 'MAJOR_DAMAGE') && (
            <div>
              <Label htmlFor="notes" className="text-sm">
                Mô tả chi tiết hư hỏng *
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mô tả chi tiết về hư hỏng của container..."
                className="mt-1"
                rows={3}
              />
            </div>
          )}

          {/* Photos (required for major damage) */}
          {condition === 'MAJOR_DAMAGE' && (
            <div>
              <Label className="text-sm">Ảnh chứng minh hư hỏng *</Label>
              <div className="mt-2 space-y-2">
                {/* Photo Upload Button */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handlePhotoUpload(file);
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Tải lên ảnh</span>
                  </Label>
                </div>

                {/* Preview Uploaded Photos */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${photoIndex + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemovePhoto(photo)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning for major damage */}
          {condition === 'MAJOR_DAMAGE' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              ⚠️ Container hư hỏng nặng sẽ tự động tạo tranh chấp để admin xử lý
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận nhận hàng
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
