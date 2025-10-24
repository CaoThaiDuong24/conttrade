'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RaiseDisputeFormProps {
  orderId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DISPUTE_REASONS = [
  { value: 'CONTAINER_DAMAGED', label: 'Container hư hỏng' },
  { value: 'NOT_AS_DESCRIBED', label: 'Không đúng mô tả' },
  { value: 'WRONG_CONTAINER', label: 'Sai container' },
  { value: 'MISSING_PARTS', label: 'Thiếu phụ kiện' },
  { value: 'LATE_DELIVERY', label: 'Giao hàng trễ' },
  { value: 'OTHER', label: 'Khác' },
];

const RESOLUTION_OPTIONS = [
  { value: 'FULL_REFUND', label: 'Hoàn tiền đầy đủ' },
  { value: 'PARTIAL_REFUND', label: 'Hoàn tiền một phần' },
  { value: 'REPLACEMENT', label: 'Đổi container khác' },
  { value: 'REPAIR', label: 'Sửa chữa/Khắc phục' },
  { value: 'OTHER', label: 'Khác' },
];

export function RaiseDisputeForm({ orderId, onSuccess, onCancel }: RaiseDisputeFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<Array<{ type: string; url: string; description: string }>>([]);
  const [requestedResolution, setRequestedResolution] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !description) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ lý do và mô tả chi tiết',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/raise-dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description,
          evidence,
          requestedResolution,
          requestedAmount: requestedAmount ? parseFloat(requestedAmount) : undefined,
          additionalNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Đã gửi khiếu nại',
          description: 'Admin sẽ xem xét và phản hồi trong 24-48 giờ',
        });
        onSuccess?.();
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Báo cáo vấn đề
        </CardTitle>
        <CardDescription>
          Nếu container có vấn đề, vui lòng mô tả chi tiết. Số tiền escrow sẽ được giữ cho đến khi giải quyết xong.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 mt-4">
          {/* Reason */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Lý do khiếu nại <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {DISPUTE_REASONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết vấn đề: Container có nhiều vết rỉ sét và lỗ thủng không thấy trong ảnh listing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-gray-500">
              Hãy mô tả càng chi tiết càng tốt để admin có thể giải quyết nhanh chóng
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Bằng chứng (ảnh, video) <span className="text-red-500">*</span></Label>
            <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center bg-red-50">
              <Upload className="mx-auto h-12 w-12 text-red-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload ảnh hoặc video chứng minh vấn đề
              </p>
              <p className="text-xs text-red-600 mt-1">
                Quan trọng: Bằng chứng rõ ràng giúp giải quyết nhanh hơn
              </p>
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                className="mt-2"
                onChange={(e) => {
                  // TODO: Handle file upload
                  console.log('Evidence files:', e.target.files);
                }}
              />
            </div>
            {evidence.length > 0 && (
              <div className="space-y-2 mt-2">
                {evidence.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                    <span className="text-sm">{item.type === 'photo' ? '📷' : '🎥'}</span>
                    <span className="text-sm flex-1">{item.description || `Evidence ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requested Resolution */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Giải pháp mong muốn</Label>
            <RadioGroup value={requestedResolution} onValueChange={setRequestedResolution}>
              {RESOLUTION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`res-${option.value}`} />
                  <Label htmlFor={`res-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Requested Amount */}
          {(requestedResolution === 'FULL_REFUND' || requestedResolution === 'PARTIAL_REFUND') && (
            <div className="space-y-2">
              <Label htmlFor="amount">
                Số tiền yêu cầu hoàn (VND) {requestedResolution === 'FULL_REFUND' && <span className="text-gray-500 text-xs">(Toàn bộ)</span>}
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000000"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
              />
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú bổ sung</Label>
            <Textarea
              id="notes"
              placeholder="Thông tin bổ sung khác..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Sau khi gửi khiếu nại:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 ml-4 space-y-1 list-disc">
              <li>Số tiền escrow sẽ được giữ cho đến khi giải quyết xong</li>
              <li>Admin sẽ liên hệ trong vòng 24-48 giờ</li>
              <li>Cần cung cấp thêm thông tin khi admin yêu cầu</li>
              <li>Quyết định cuối cùng do admin đưa ra</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !reason || !description}
            variant="destructive"
          >
            {loading ? 'Đang gửi...' : 'Gửi khiếu nại'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
