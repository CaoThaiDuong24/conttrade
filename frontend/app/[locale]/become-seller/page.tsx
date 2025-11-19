'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Upload, Building2, Warehouse, CreditCard, Briefcase, FileText, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, MapPin, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  type: string;
  filename: string;
  url: string;
  fileSize: number;
  uploadedAt: string;
}

interface FormData {
  // Business Info
  businessType: 'INDIVIDUAL' | 'COMPANY';
  businessName: string;
  taxCode: string;
  nationalId: string;
  address: string;
  province: string;
  city: string;
  representativeName: string;
  website: string;
  
  // Depot Info
  depotName: string;
  depotAddress: string;
  depotProvince: string;
  depotCity: string;
  depotLatitude?: number;
  depotLongitude?: number;
  depotAreaSqm?: number;
  depotCapacityTeu?: number;
  depotImages: string[];
  
  // Bank Info
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  
  // Experience
  yearsExperience?: number;
  containerTypes: string[];
  supplySource: 'OWN' | 'AGENT' | 'BROKER';
  currentInventory?: number;
  businessDescription: string;
  
  // Documents
  documents: Document[];
}

const STEPS = [
  { id: 1, title: 'Thông tin doanh nghiệp', icon: Building2 },
  { id: 2, title: 'Thông tin kho bãi', icon: Warehouse },
  { id: 3, title: 'Thông tin ngân hàng', icon: CreditCard },
  { id: 4, title: 'Kinh nghiệm kinh doanh', icon: Briefcase },
  { id: 5, title: 'Tài liệu chứng minh', icon: FileText },
  { id: 6, title: 'Xem lại & Xác nhận', icon: CheckCircle2 }
];

const CONTAINER_TYPES = ['20ft', '40ft', '40HC', '45HC', 'Reefer 20ft', 'Reefer 40ft', 'Open Top', 'Flat Rack', 'Tank'];

export default function BecomeSellerPage() {
  const router = useRouter();
  const t = useTranslations();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    businessType: 'COMPANY',
    businessName: '',
    taxCode: '',
    nationalId: '',
    address: '',
    province: '',
    city: '',
    representativeName: '',
    website: '',
    
    depotName: '',
    depotAddress: '',
    depotProvince: '',
    depotCity: '',
    depotImages: [],
    
    bankName: '',
    bankBranch: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    
    containerTypes: [],
    supplySource: 'OWN',
    businessDescription: '',
    
    documents: []
  });
  
  const progress = (currentStep / STEPS.length) * 100;
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileUpload = async (files: FileList | null, type: 'image' | 'document') => {
    if (!files || files.length === 0) return;
    
    const isImage = type === 'image';
    const setState = isImage ? setUploadingImages : setUploadingDocs;
    
    setState(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const uploadedUrls: string[] = [];
      const uploadedDocs: Document[] = [];
      
      for (const file of Array.from(files)) {
        // Validate file
        if (isImage) {
          if (!file.type.startsWith('image/')) {
            toast({
              title: 'Lỗi',
              description: `File ${file.name} không phải là ảnh`,
              variant: 'destructive'
            });
            continue;
          }
        } else {
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
          if (!allowedTypes.includes(file.type)) {
            toast({
              title: 'Lỗi',
              description: `File ${file.name} không đúng định dạng (PDF/JPG/PNG)`,
              variant: 'destructive'
            });
            continue;
          }
        }
        
        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'Lỗi',
            description: `File ${file.name} vượt quá 10MB`,
            variant: 'destructive'
          });
          continue;
        }
        
        // Upload
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        
        if (isImage) {
          uploadedUrls.push(data.data.media.url);
        } else {
          uploadedDocs.push({
            type: 'business_document',
            filename: file.name,
            url: data.data.media.url,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          });
        }
      }
      
      if (isImage) {
        setFormData(prev => ({
          ...prev,
          depotImages: [...prev.depotImages, ...uploadedUrls]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, ...uploadedDocs]
        }));
      }
      
      toast({
        title: 'Thành công',
        description: `Đã upload ${isImage ? uploadedUrls.length : uploadedDocs.length} file`
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể upload file. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setState(false);
    }
  };
  
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      depotImages: prev.depotImages.filter((_, i) => i !== index)
    }));
  };
  
  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };
  
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.businessName || !formData.address) {
          toast({
            title: 'Thiếu thông tin',
            description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
            variant: 'destructive'
          });
          return false;
        }
        if (formData.businessType === 'COMPANY' && !formData.taxCode) {
          toast({
            title: 'Thiếu mã số thuế',
            description: 'Doanh nghiệp cần có mã số thuế',
            variant: 'destructive'
          });
          return false;
        }
        if (formData.businessType === 'INDIVIDUAL' && !formData.nationalId) {
          toast({
            title: 'Thiếu CCCD',
            description: 'Cá nhân cần có số CCCD/CMND',
            variant: 'destructive'
          });
          return false;
        }
        break;
        
      case 2:
        if (!formData.depotName || !formData.depotAddress) {
          toast({
            title: 'Thiếu thông tin kho',
            description: 'Vui lòng điền đầy đủ thông tin kho bãi',
            variant: 'destructive'
          });
          return false;
        }
        if (formData.depotImages.length < 3) {
          toast({
            title: 'Thiếu ảnh kho',
            description: 'Cần ít nhất 3 ảnh kho bãi',
            variant: 'destructive'
          });
          return false;
        }
        break;
        
      case 3:
        if (!formData.bankName || !formData.bankAccountNumber || !formData.bankAccountHolder) {
          toast({
            title: 'Thiếu thông tin ngân hàng',
            description: 'Vui lòng điền đầy đủ thông tin ngân hàng',
            variant: 'destructive'
          });
          return false;
        }
        break;
        
      case 4:
        if (formData.containerTypes.length === 0) {
          toast({
            title: 'Thiếu loại container',
            description: 'Vui lòng chọn ít nhất 1 loại container',
            variant: 'destructive'
          });
          return false;
        }
        break;
        
      case 5:
        if (formData.documents.length === 0) {
          toast({
            title: 'Thiếu tài liệu',
            description: 'Vui lòng upload ít nhất 1 tài liệu chứng minh',
            variant: 'destructive'
          });
          return false;
        }
        break;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Submit failed');
      }
      
      toast({
        title: 'Thành công!',
        description: 'Đơn đăng ký đã được gửi thành công'
      });
      
      // Redirect to status page
      router.push(`/vi/seller-application-status?id=${data.data.applicationId}`);
      
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi đơn. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Loại hình <span className="text-red-500">*</span></Label>
              <Select value={formData.businessType} onValueChange={(v) => handleInputChange('businessType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Cá nhân</SelectItem>
                  <SelectItem value="COMPANY">Doanh nghiệp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tên {formData.businessType === 'COMPANY' ? 'doanh nghiệp' : 'cá nhân'} <span className="text-red-500">*</span></Label>
              <Input value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} />
            </div>
            
            {formData.businessType === 'COMPANY' ? (
              <div>
                <Label>Mã số thuế <span className="text-red-500">*</span></Label>
                <Input value={formData.taxCode} onChange={(e) => handleInputChange('taxCode', e.target.value)} />
              </div>
            ) : (
              <div>
                <Label>Số CCCD/CMND <span className="text-red-500">*</span></Label>
                <Input value={formData.nationalId} onChange={(e) => handleInputChange('nationalId', e.target.value)} />
              </div>
            )}
            
            <div>
              <Label>Địa chỉ <span className="text-red-500">*</span></Label>
              <Input value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tỉnh/Thành phố</Label>
                <Input value={formData.province} onChange={(e) => handleInputChange('province', e.target.value)} />
              </div>
              <div>
                <Label>Quận/Huyện</Label>
                <Input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
              </div>
            </div>
            
            <div>
              <Label>Người đại diện</Label>
              <Input value={formData.representativeName} onChange={(e) => handleInputChange('representativeName', e.target.value)} />
            </div>
            
            <div>
              <Label>Website</Label>
              <Input type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Tên kho <span className="text-red-500">*</span></Label>
              <Input value={formData.depotName} onChange={(e) => handleInputChange('depotName', e.target.value)} />
            </div>
            
            <div>
              <Label>Địa chỉ kho <span className="text-red-500">*</span></Label>
              <Input value={formData.depotAddress} onChange={(e) => handleInputChange('depotAddress', e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tỉnh/Thành phố</Label>
                <Input value={formData.depotProvince} onChange={(e) => handleInputChange('depotProvince', e.target.value)} />
              </div>
              <div>
                <Label>Quận/Huyện</Label>
                <Input value={formData.depotCity} onChange={(e) => handleInputChange('depotCity', e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Diện tích (m²)</Label>
                <Input type="number" value={formData.depotAreaSqm || ''} onChange={(e) => handleInputChange('depotAreaSqm', parseInt(e.target.value))} />
              </div>
              <div>
                <Label>Sức chứa (TEU)</Label>
                <Input type="number" value={formData.depotCapacityTeu || ''} onChange={(e) => handleInputChange('depotCapacityTeu', parseInt(e.target.value))} />
              </div>
            </div>
            
            <div>
              <Label>Ảnh kho bãi (tối thiểu 3 ảnh) <span className="text-red-500">*</span></Label>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {formData.depotImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={process.env.NEXT_PUBLIC_API_URL + url} alt={`Kho ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'image')}
                    disabled={uploadingImages}
                  />
                  <Upload className="h-5 w-5" />
                  <span>{uploadingImages ? 'Đang upload...' : 'Chọn ảnh'}</span>
                </label>
                
                <p className="text-sm text-gray-500">
                  Đã upload: {formData.depotImages.length}/3 (tối thiểu)
                </p>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Tên ngân hàng <span className="text-red-500">*</span></Label>
              <Input value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} />
            </div>
            
            <div>
              <Label>Chi nhánh</Label>
              <Input value={formData.bankBranch} onChange={(e) => handleInputChange('bankBranch', e.target.value)} />
            </div>
            
            <div>
              <Label>Số tài khoản <span className="text-red-500">*</span></Label>
              <Input value={formData.bankAccountNumber} onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)} />
            </div>
            
            <div>
              <Label>Tên chủ tài khoản <span className="text-red-500">*</span></Label>
              <Input value={formData.bankAccountHolder} onChange={(e) => handleInputChange('bankAccountHolder', e.target.value)} />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Số năm kinh nghiệm</Label>
              <Input type="number" value={formData.yearsExperience || ''} onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value))} />
            </div>
            
            <div>
              <Label>Loại container <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {CONTAINER_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.containerTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange('containerTypes', [...formData.containerTypes, type]);
                        } else {
                          handleInputChange('containerTypes', formData.containerTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <label htmlFor={type} className="text-sm cursor-pointer">{type}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Nguồn hàng <span className="text-red-500">*</span></Label>
              <Select value={formData.supplySource} onValueChange={(v: any) => handleInputChange('supplySource', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWN">Sở hữu</SelectItem>
                  <SelectItem value="AGENT">Đại lý</SelectItem>
                  <SelectItem value="BROKER">Trung gian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Số lượng container hiện có</Label>
              <Input type="number" value={formData.currentInventory || ''} onChange={(e) => handleInputChange('currentInventory', parseInt(e.target.value))} />
            </div>
            
            <div>
              <Label>Mô tả doanh nghiệp</Label>
              <Textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                rows={4}
                placeholder="Giới thiệu về doanh nghiệp, kinh nghiệm, khách hàng tiêu biểu..."
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>Tài liệu chứng minh <span className="text-red-500">*</span></Label>
              <p className="text-sm text-gray-500 mb-2">
                Upload CCCD/CMND (2 mặt), Giấy phép ĐKKD, Giấy chứng nhận kho, Hợp đồng đại lý (nếu có)
              </p>
              
              <div className="space-y-2">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{doc.filename}</p>
                        <p className="text-xs text-gray-500">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'document')}
                    disabled={uploadingDocs}
                  />
                  <Upload className="h-5 w-5" />
                  <span>{uploadingDocs ? 'Đang upload...' : 'Chọn tài liệu (PDF/JPG/PNG, max 10MB)'}</span>
                </label>
                
                <p className="text-sm text-gray-500">
                  Đã upload: {formData.documents.length} tài liệu
                </p>
              </div>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Xem lại thông tin trước khi gửi</h3>
              <p className="text-sm text-blue-700">
                Vui lòng kiểm tra kỹ tất cả thông tin. Sau khi gửi, bạn có thể cập nhật nếu admin yêu cầu bổ sung.
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Thông tin doanh nghiệp</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Loại hình:</strong> {formData.businessType === 'COMPANY' ? 'Doanh nghiệp' : 'Cá nhân'}</p>
                  <p><strong>Tên:</strong> {formData.businessName}</p>
                  <p><strong>{formData.businessType === 'COMPANY' ? 'MST' : 'CCCD'}:</strong> {formData.businessType === 'COMPANY' ? formData.taxCode : formData.nationalId}</p>
                  <p><strong>Địa chỉ:</strong> {formData.address}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Thông tin kho bãi</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Tên kho:</strong> {formData.depotName}</p>
                  <p><strong>Địa chỉ:</strong> {formData.depotAddress}</p>
                  <p><strong>Số ảnh:</strong> {formData.depotImages.length} ảnh</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Thông tin ngân hàng</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Ngân hàng:</strong> {formData.bankName}</p>
                  <p><strong>Số TK:</strong> {formData.bankAccountNumber}</p>
                  <p><strong>Chủ TK:</strong> {formData.bankAccountHolder}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Kinh nghiệm</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Loại container:</strong> {formData.containerTypes.join(', ')}</p>
                  <p><strong>Nguồn hàng:</strong> {formData.supplySource === 'OWN' ? 'Sở hữu' : formData.supplySource === 'AGENT' ? 'Đại lý' : 'Trung gian'}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Tài liệu</h4>
                <p className="text-sm"><strong>Số tài liệu:</strong> {formData.documents.length} file</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⏱️ Thời gian xử lý</h3>
              <p className="text-sm text-yellow-700">
                Đơn của bạn sẽ được xử lý trong vòng <strong>3-5 ngày làm việc</strong>. 
                Bạn sẽ nhận được email thông báo khi đơn được duyệt hoặc cần bổ sung thông tin.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Đăng ký trở thành Nhà Cung Cấp</h1>
        <p className="text-gray-600">
          Hoàn tất 6 bước để trở thành nhà cung cấp chính thức trên nền tảng
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <p className={`text-xs text-center ${isActive ? 'font-semibold' : ''}`}>
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            Bước {currentStep} / {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Tiếp theo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
