"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { createListing } from '@/lib/api/listings';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Camera,
  DollarSign,
  MapPin,
  Eye,
  ArrowLeft,
  ArrowRight,
  Check,
  Container,
  FileText,
  Building2,
  CheckCircle2,
  Upload,
  X,
  Image as ImageIcon,
  Send
} from 'lucide-react';
import { useListingFormData } from '@/hooks/useMasterData';
import MasterDataAPI from '@/lib/api/master-data';
import { getDealTypeDisplayName, isRentalType } from '@/lib/utils/dealType';
import { getConditionDisplayName } from '@/lib/utils/condition';
import { generateListingTitle, generateListingDescription } from '@/lib/utils/listingTitle';
import { fetchDepots } from '@/lib/api/depot';
import { uploadMedia, addMediaToListing } from '@/lib/api/media';

type Step = 'specs' | 'media' | 'pricing' | 'depot' | 'review';

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('specs');
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<'validating' | 'creating' | 'uploading' | 'done'>('validating');
  const [error, setError] = useState('');

  const steps = [
    { key: 'specs', label: 'Thông số', icon: Package, description: 'Thông tin cơ bản về container' },
    { key: 'media', label: 'Hình ảnh', icon: Camera, description: 'Upload ảnh và video' },
    { key: 'pricing', label: 'Giá cả', icon: DollarSign, description: 'Thiết lập giá bán/thuê' },
    { key: 'depot', label: 'Vị trí', icon: MapPin, description: 'Chọn depot lưu trữ' },
    { key: 'review', label: 'Xem lại', icon: Eye, description: 'Kiểm tra thông tin cuối cùng' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Load master data
  const {
    dealTypes,
    containerSizes,
    containerTypes,
    qualityStandards,
    currencies,
    rentalUnits,
    isLoading: masterDataLoading,
    isError: masterDataError
  } = useListingFormData();

  // Additional data
  const [depots, setDepots] = useState<any[]>([]);
  const [depotsLoading, setDepotsLoading] = useState(true);

  // Form data
  const [dealType, setDealType] = useState<string>('SALE'); // Use API codes
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [ctype, setCtype] = useState('');
  const [standard, setStandard] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished' | 'damaged'>('new');
  const [priceAmount, setPriceAmount] = useState<number | ''>('');
  const [priceCurrency, setPriceCurrency] = useState(''); // Don't set default, let useEffect handle it
  const [depotId, setDepotId] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // Track uploaded media URLs
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>(''); // Track uploaded video URL
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [rentalUnit, setRentalUnit] = useState('');

  // Validation function for each step
  const validateStep = (stepKey: Step): boolean => {
    switch (stepKey) {
      case 'specs':
        return !!(dealType && size && ctype && standard && condition);
      case 'media':
        return (uploadedImages.length > 0 || uploadedVideo !== null) && !uploadingMedia; // Require at least 1 image OR 1 video AND not uploading
      case 'pricing':
        const hasPriceAmount = priceAmount && priceAmount > 0;
        const hasPriceCurrency = !!priceCurrency;
        const hasRentalUnit = !isRentalType(dealType) || !!rentalUnit;
        return !!(hasPriceAmount && hasPriceCurrency && hasRentalUnit);
      case 'depot':
        // Validate depot has available slots > 0
        const selectedDepot = depots.find(d => d.id.toString() === depotId);
        return !!(depotId && selectedDepot && (selectedDepot.availableSlots || 0) > 0);
      case 'review':
        return validateStep('specs') && validateStep('media') && validateStep('pricing') && validateStep('depot');
      default:
        return false;
    }
  };

  // Check if we can proceed to next step
  const canProceedToNext = (currentStep: Step): boolean => {
    return validateStep(currentStep);
  };

  // Load depots
  useEffect(() => {
    const loadDepots = async () => {
      setDepotsLoading(true);
      try {
        console.log('Fetching depots using fetchDepots function...');
        const response = await fetchDepots();
        
        console.log('API Response:', response);
        
        // Handle the response structure: {success: true, data: {depots: [...]}}
        let depotsArray: any[] = [];
        if (response.data?.depots) {
          depotsArray = response.data.depots;
        } else if (response.data && Array.isArray(response.data)) {
          depotsArray = response.data;
        } else if (Array.isArray(response)) {
          depotsArray = response;
        }
        
        console.log('Parsed depots array:', depotsArray);
        setDepots(depotsArray);
        
        if (depotsArray.length > 0) {
          console.log('Found', depotsArray.length, 'depots');
        } else {
          console.log('No depots found in response');
        }
      } catch (error) {
        console.error('Error loading depots:', error);
        toast({
          title: "Lỗi kết nối",
          description: "Không thể tải danh sách depot từ server",
          variant: "destructive",
        });
      } finally {
        setDepotsLoading(false);
      }
    };
    loadDepots();
  }, [toast]);

  // Set default dealType when master data loads
  useEffect(() => {
    if (dealTypes.data && dealTypes.data.length > 0 && !dealType) {
      setDealType(dealTypes.data[0].code);
    }
    if (containerSizes.data && containerSizes.data.length > 0 && !size) {
      setSize(containerSizes.data[0].size_ft.toString());
    }
    if (containerTypes.data && containerTypes.data.length > 0 && !ctype) {
      setCtype(containerTypes.data[0].code);
    }
    if (qualityStandards.data && qualityStandards.data.length > 0 && !standard) {
      setStandard(qualityStandards.data[0].code);
    }
    if (currencies.data && currencies.data.length > 0 && !priceCurrency) {
      // Try to find VND first, otherwise use first currency
      const vndCurrency = currencies.data.find(c => c.code === 'VND');
      setPriceCurrency(vndCurrency?.code || currencies.data[0].code);
    }
    if (rentalUnits.data && rentalUnits.data.length > 0 && !rentalUnit) {
      setRentalUnit(rentalUnits.data[0].code);
    }
  }, [dealTypes.data, containerSizes.data, containerTypes.data, qualityStandards.data, currencies.data, rentalUnits.data]);

  // Image upload handlers with real upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    newFiles.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi file",
          description: `${file.name} không phải là file ảnh hợp lệ`,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: `${file.name} vượt quá 5MB`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });

    // Check total number of images (max 10)
    if (uploadedImages.length + validFiles.length > 10) {
      toast({
        title: "Quá nhiều ảnh",
        description: "Tối đa 10 ảnh được phép upload",
        variant: "destructive",
      });
      return;
    }

    if (validFiles.length === 0) return;

    // FIRST: Show preview immediately using blob URLs (for instant feedback)
    setUploadedImages(prev => [...prev, ...validFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // THEN: Upload to server in background
    setUploadingMedia(true);
    const newUploadedUrls: string[] = [];

    try {
      // Upload each file to server
      for (const file of validFiles) {
        try {
          const response = await uploadMedia(file);
          if (response.success) {
            newUploadedUrls.push(response.data.media.url);
            console.log('=== IMAGE UPLOAD SUCCESS ===');
            console.log('Media URL:', response.data.media.url);
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast({
            title: "Lỗi upload",
            description: `Không thể upload ${file.name}`,
            variant: "destructive",
          });
          // Remove this image from preview if upload failed
          const fileIndex = uploadedImages.indexOf(file);
          if (fileIndex !== -1) {
            handleRemoveImage(fileIndex);
          }
        }
      }

      // Store uploaded URLs for later use when submitting
      if (newUploadedUrls.length > 0) {
        setUploadedImageUrls(prev => [...prev, ...newUploadedUrls]);
        
        toast({
          title: "Thành công",
          description: `Đã upload ${newUploadedUrls.length} ảnh lên server`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi upload",
        description: "Có lỗi xảy ra khi upload ảnh",
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }

    // Reset input
    event.target.value = '';
  };

  // Video upload handler with real upload
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Lỗi file",
        description: `${file.name} không phải là file video hợp lệ`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: `${file.name} vượt quá 100MB`,
        variant: "destructive",
      });
      return;
    }

    // Only allow MP4 format for now
    if (!file.type.includes('mp4')) {
      toast({
        title: "Format không hỗ trợ",
        description: "Chỉ hỗ trợ file MP4",
        variant: "destructive",
      });
      return;
    }

    // Remove old video if exists
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    // FIRST: Show preview immediately using blob URL
    const blobUrl = URL.createObjectURL(file);
    setUploadedVideo(file);
    setVideoPreviewUrl(blobUrl);

    // THEN: Upload to server in background
    setUploadingMedia(true);

    try {
      // Upload video to server
      const response = await uploadMedia(file);
      
      if (response.success) {
        setUploadedVideoUrl(response.data.media.url);

        toast({
          title: "Thành công",
          description: "Đã upload video lên server",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Lỗi upload",
        description: "Không thể upload video",
        variant: "destructive",
      });
      // Remove video from preview if upload failed
      handleRemoveVideo();
    } finally {
      setUploadingMedia(false);
    }

    // Reset input
    event.target.value = '';
  };  const handleRemoveImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setUploadedVideo(null);
    setVideoPreviewUrl('');
    setUploadedVideoUrl('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Separate images and videos
      const imageFiles: File[] = [];
      const videoFiles: File[] = [];
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        } else if (file.type.startsWith('video/')) {
          videoFiles.push(file);
        }
      });
      
      // Handle images
      if (imageFiles.length > 0) {
        const syntheticEvent = {
          target: { files: imageFiles, value: '' }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleImageUpload(syntheticEvent);
      }
      
      // Handle video (only first one)
      if (videoFiles.length > 0) {
        const syntheticEvent = {
          target: { files: [videoFiles[0]], value: '' }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleVideoUpload(syntheticEvent);
      }
    }
  };

  // Add a state to track if submit button was explicitly clicked
  const [submitClicked, setSubmitClicked] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit if we're in review step AND submit button was explicitly clicked
    if (step !== 'review') {
      console.log('Not in review step, submission blocked');
      return;
    }
    
    if (!submitClicked) {
      console.log('Submit not explicitly clicked, blocking auto-submit');
      return;
    }
    
    // Reset the submit flag
    setSubmitClicked(false);
    
    console.log('Submit button clicked - starting submission process...');
    
    // Debug current form data
    console.log('Current form state:', {
      dealType, size, ctype, standard, condition,
      priceAmount, priceCurrency, depotId,
      uploadedImages: uploadedImages.length,
      uploadedVideo: !!uploadedVideo,
      title, description
    });
    
    // Validation before submit
    const errors: string[] = [];
    
    if (!dealType) errors.push('Vui lòng chọn loại giao dịch');
    if (!size) errors.push('Vui lòng chọn kích thước container');
    if (!ctype) errors.push('Vui lòng chọn loại container');
    if (!standard) errors.push('Vui lòng chọn tiêu chuẩn chất lượng');
    if (!condition) errors.push('Vui lòng chọn tình trạng container');
    if (!priceAmount || priceAmount <= 0) errors.push('Vui lòng nhập giá hợp lệ');
    if (!priceCurrency) errors.push('Vui lòng chọn tiền tệ');
    if (!depotId) errors.push('Vui lòng chọn depot lưu trữ');
    
    // Validate depot has available slots
    const selectedDepot = depots.find(d => d.id.toString() === depotId);
    console.log('Selected depot:', selectedDepot, 'depotId:', depotId);
    
    if (!selectedDepot) {
      errors.push('Không tìm thấy depot đã chọn');
    } else if ((selectedDepot.availableSlots || 0) <= 0) {
      errors.push('Depot đã chọn không còn chỗ trống, vui lòng chọn depot khác');
    }
    if (isRentalType(dealType) && !rentalUnit) errors.push('Vui lòng chọn đơn vị thời gian thuê');
    if (uploadedImages.length === 0 && !uploadedVideo) errors.push('Vui lòng upload ít nhất 1 ảnh hoặc 1 video container');
    
    // Title validation (if provided)
    if (title && title.length < 10) errors.push('Tiêu đề phải có ít nhất 10 ký tự');
    if (title && title.length > 200) errors.push('Tiêu đề không được quá 200 ký tự');
    
    // Description validation (if provided) - more lenient for auto-generated content
    if (description && description.length > 2000) errors.push('Mô tả không được quá 2000 ký tự');
    
    if (errors.length > 0) {
      console.log('Validation errors found:', errors);
      setError(errors.join(', '));
      toast({
        title: "Lỗi validation",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    
    console.log('All validations passed, proceeding with submission...');
    
    setSubmitting(true);
    setSubmitProgress('validating');
    setError('');
    
    // Show initial toast
    toast({
      title: "Đang xử lý...",
      description: "Vui lòng đợi trong giây lát",
    });
    
    try {
      // Get dynamic names from master data
      const sizeData = containerSizes.data?.find(s => s.size_ft.toString() === size);
      const typeData = containerTypes.data?.find(t => t.code === ctype);
      const standardData = qualityStandards.data?.find(s => s.code === standard);
      const dealTypeData = dealTypes.data?.find(d => d.code === dealType);

      // Generate auto title and description using utilities
      const autoTitle = title || generateListingTitle({
        size,
        sizeData,
        type: ctype,
        typeData,
        standard,
        standardData,
        condition,
        dealType
      });
      
      const autoDescription = description || generateListingDescription({
        size,
        sizeData,
        type: ctype,
        typeData,
        standard,
        standardData,
        condition,
        dealType,
        dealTypeData
      });

      console.log('Auto-generated title:', autoTitle);
      console.log('Auto-generated description:', autoDescription);
      console.log('Description length:', autoDescription.length);

      const listingData = {
        dealType,
        title: autoTitle,
        description: autoDescription,
        locationDepotId: depotId,
        priceAmount: priceAmount as number,
        priceCurrency: priceCurrency,
        rentalUnit: dealType === 'RENTAL' || dealType === 'LEASE' ? rentalUnit : undefined,
        facets: {
          size: size,         // Use simple 'size' key for consistency
          type: ctype,
          standard,
          condition
        }
      };

      console.log('=== SUBMITTING LISTING DATA ===');
      console.log('Full listing data:', JSON.stringify(listingData, null, 2));
      console.log('Facets object:', listingData.facets);
      console.log('Size value:', size);
      console.log('Type value:', ctype);
      console.log('Standard value:', standard);
      console.log('Condition value:', condition);
      console.log('============================');

      // Show creating listing toast
      setSubmitProgress('creating');
      toast({
        title: "Bước 1/2",
        description: "Đang tạo tin đăng...",
      });

      // Create listing first
      const result = await createListing(listingData);
      console.log('Create listing result:', result);

      if (result.success) {
        const listingId = result.data.listing.id;
        
        // Add uploaded media to the listing
        const mediaPromises: Promise<any>[] = [];
        
        // Add images
        uploadedImageUrls.forEach((mediaUrl, index) => {
          mediaPromises.push(
            addMediaToListing(listingId, {
              mediaUrl: mediaUrl,
              mediaType: 'IMAGE',
              sortOrder: index
            })
          );
        });
        
        // Add video
        if (uploadedVideoUrl) {
          mediaPromises.push(
            addMediaToListing(listingId, {
              mediaUrl: uploadedVideoUrl,
              mediaType: 'VIDEO',
              sortOrder: uploadedImageUrls.length
            })
          );
        }
        
        // Wait for all media to be attached
        if (mediaPromises.length > 0) {
          console.log('Adding media to listing...');
          
          // Show uploading media toast
          setSubmitProgress('uploading');
          toast({
            title: "Bước 2/2",
            description: `Đang đính kèm ${uploadedImageUrls.length} ảnh${uploadedVideoUrl ? ' và 1 video' : ''}...`,
          });
          
          await Promise.all(mediaPromises);
          console.log('Media added successfully');
        }

        // Show success toast
        setSubmitProgress('done');
        toast({
          title: "✅ Thành công!",
          description: "Tin đăng đã được tạo và đang chờ duyệt. Bạn sẽ được chuyển đến trang quản lý tin đăng.",
        });
        
        // Wait a bit before redirect for user to see the success message
        setTimeout(() => {
          router.push('/sell/my-listings');
        }, 1500);
      } else {
        console.error('Create listing failed:', result);
        throw new Error('Không thể tạo tin đăng');
      }
    } catch (err: any) {
      console.error('Create listing error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Có lỗi xảy ra khi tạo tin đăng';
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (masterDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (masterDataError) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Không thể tải dữ liệu master data.</p>
              <p className="text-sm text-muted-foreground mt-2">Vui lòng kiểm tra kết nối API.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Thử lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng tin bán container</h1>
          <p className="text-gray-600">Tạo tin đăng chuyên nghiệp trong 5 bước đơn giản</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Bước {currentStepIndex + 1} / {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% hoàn thành</span>
          </div>
          <Progress value={progress} className="h-2 mb-6" />

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = stepItem.key === step;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={stepItem.key} className="flex flex-col items-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {stepItem.label}
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-12 w-full h-0.5 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                      }`} style={{ width: 'calc(100% - 48px)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div>
          {/* Main Form */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  {React.createElement(steps[currentStepIndex].icon, { className: "w-6 h-6 text-blue-500" })}
                  <div>
                    <CardTitle className="text-xl">{steps[currentStepIndex].label}</CardTitle>
                    <CardDescription className="mt-1">{steps[currentStepIndex].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Step: Specs */}
                  {step === 'specs' && (
                    <div className="space-y-6">
                      {/* Deal Type Selection */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <Label className="text-base font-semibold text-gray-900 mb-4 block">
                          Loại giao dịch *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {dealTypes.data?.map((dt: any) => (
                            <div
                              key={dt.code}
                              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-sm ${dealType === dt.code
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              onClick={() => setDealType(dt.code)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${dealType === dt.code ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                  }`}>
                                  {dealType === dt.code && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 text-sm">{dt.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{dt.description}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Container Specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Kích thước *</Label>
                          <Select 
                            value={size} 
                            onValueChange={(val) => {
                              console.log('Size selected:', val);
                              setSize(val);
                            }} 
                            required
                          >
                            <SelectTrigger className={`h-10 w-full ${!size ? 'border-red-300' : 'border-gray-300'}`}>
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {containerSizes.data?.map((s: any) => (
                                <SelectItem key={s.size_ft} value={s.size_ft.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <Container className="w-4 h-4 text-gray-500" />
                                    <span>{s.size_ft}ft</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Loại container *</Label>
                          <Select 
                            value={ctype} 
                            onValueChange={(val) => {
                              console.log('Container type selected:', val);
                              setCtype(val);
                            }} 
                            required
                          >
                            <SelectTrigger className={`h-10 w-full ${!ctype ? 'border-red-300' : 'border-gray-300'}`}>
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {containerTypes.data?.map((t: any) => (
                                <SelectItem key={t.code} value={t.code}>
                                  <div className="flex items-center space-x-2">
                                    <Package className="w-4 h-4 text-gray-500" />
                                    <span>{t.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Tiêu chuẩn *</Label>
                          <Select 
                            value={standard} 
                            onValueChange={(val) => {
                              console.log('Standard selected:', val);
                              setStandard(val);
                            }}
                          >
                            <SelectTrigger className="h-10 w-full border-gray-300">
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {qualityStandards.data?.map((qs: any) => (
                                <SelectItem key={qs.code} value={qs.code}>
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>{qs.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Tình trạng *</Label>
                          <Select 
                            value={condition} 
                            onValueChange={(v) => {
                              console.log('Condition selected:', v);
                              setCondition(v as any);
                            }}
                          >
                            <SelectTrigger className="h-10 w-full border-gray-300">
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span>Mới (New)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="used">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span>Đã sử dụng (Used)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="refurbished">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span>Tân trang (Refurbished)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="damaged">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span>Hư hỏng (Damaged)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Title and Description - Separate Rows */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Tiêu đề tin đăng</Label>
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề..."
                            className="h-10 w-full border-gray-300"
                          />
                          <p className="text-xs text-gray-500">
                            {title ? `${title.length}/200` : "Tự động tạo nếu để trống (tối thiểu 10 ký tự, tối đa 200 ký tự)"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Mô tả chi tiết</Label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả chi tiết về container..."
                            rows={3}
                            className="resize-none w-full border-gray-300"
                          />
                          <p className="text-xs text-gray-500">
                            {description ? `${description.length}/2000` : "Mô tả chi tiết để thu hút khách hàng (tối thiểu 20 ký tự, tối đa 2000 ký tự)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Media */}
                  {step === 'media' && (
                    <div className="space-y-6">
                      {/* Upload Area */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors hover:border-blue-400 hover:bg-blue-50"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="text-center py-12">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload hình ảnh và video container</h3>
                          <p className="text-gray-500 mb-4">Kéo thả file vào đây hoặc click để chọn</p>
                          
                          <div className="flex flex-col items-center space-y-2">
                            <div className="flex space-x-3">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={uploadingMedia}
                                />
                                <div className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingMedia ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                  <Camera className="w-4 h-4 mr-2" />
                                  {uploadingMedia ? 'Đang upload...' : 'Chọn ảnh'}
                                </div>
                              </label>
                              
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="video/mp4"
                                  onChange={handleVideoUpload}
                                  className="hidden"
                                  disabled={uploadingMedia}
                                />
                                <div className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingMedia ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadingMedia ? 'Đang upload...' : 'Chọn video'}
                                </div>
                              </label>
                            </div>
                            
                            <div className="text-xs text-gray-400 space-y-1 text-center">
                              <p>• <strong>Ảnh:</strong> Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
                              <p>• <strong>Video:</strong> Tối đa 1 video MP4, không quá 100MB</p>
                              <p>• Hỗ trợ: JPG, PNG, GIF, WebP, MP4</p>
                              <p>• Ảnh đầu tiên sẽ được làm ảnh đại diện</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Media Preview */}
                      {(uploadedImages.length > 0 || uploadedVideo) && (
                        <div className="space-y-6">
                          {/* Upload Progress Indicator */}
                          {uploadingMedia && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-blue-700 font-medium">Đang upload lên server...</p>
                              </div>
                            </div>
                          )}

                          {/* Images Section */}
                          {uploadedImages.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-gray-900">
                                  Ảnh đã chọn ({uploadedImages.length}/10)
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                                    setUploadedImages([]);
                                    setImagePreviewUrls([]);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Xóa tất cả ảnh
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {imagePreviewUrls.map((url, index) => (
                                  <div key={index} className="relative group">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                      <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    
                                    {/* Image Controls */}
                                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
                                    {/* Main Image Badge */}
                                    {index === 0 && (
                                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                        Ảnh chính
                                      </div>
                                    )}
                                    
                                    {/* Image Info */}
                                    <div className="absolute bottom-2 left-2 right-2">
                                      <div className="bg-opacity-60 text-white text-xs p-2 rounded">
                                        <p className="truncate">{uploadedImages[index]?.name}</p>
                                        <p>{(uploadedImages[index]?.size / 1024 / 1024).toFixed(1)}MB</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Upload More Images Button */}
                              {uploadedImages.length < 10 && (
                                <div className="flex justify-center pt-4">
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      className="hidden"
                                    />
                                    <div className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600">
                                      <Upload className="w-4 h-4 mr-2" />
                                      Thêm ảnh khác ({10 - uploadedImages.length} ảnh còn lại)
                                    </div>
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Video Section */}
                          {uploadedVideo && videoPreviewUrl && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-gray-900">
                                  Video đã chọn
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleRemoveVideo}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Xóa video
                                </Button>
                              </div>
                              
                              <div className="max-w-md mx-auto">
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                  <video
                                    src={videoPreviewUrl}
                                    controls
                                    className="w-full h-48 object-cover"
                                    preload="metadata"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                  
                                  {/* Video Info Overlay */}
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <div className="bg-opacity-60 text-white text-xs p-2 rounded">
                                      <p className="truncate">{uploadedVideo.name}</p>
                                      <p>{(uploadedVideo.size / 1024 / 1024).toFixed(1)}MB • MP4</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step: Pricing */}
                  {step === 'pricing' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Thiết lập giá {isRentalType(dealType) ? 'thuê' : 'bán'}</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              {isRentalType(dealType) ? 'Giá thuê *' : 'Giá bán *'}
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                type="number"
                                value={priceAmount}
                                onChange={(e) => setPriceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="0"
                                className={`h-10 pl-10 w-full ${!priceAmount || priceAmount <= 0 ? 'border-red-300' : 'border-gray-300'}`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">Tiền tệ *</Label>
                            <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                              <SelectTrigger className="h-10 w-full border-gray-300">
                                <SelectValue placeholder="Chọn" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.data?.map((cur: any) => (
                                  <SelectItem key={cur.code} value={cur.code}>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono text-sm">{cur.symbol}</span>
                                      <span>{cur.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {isRentalType(dealType) && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">Đơn vị thời gian *</Label>
                              <Select value={rentalUnit} onValueChange={setRentalUnit}>
                                <SelectTrigger className="h-10 w-full border-gray-300">
                                  <SelectValue placeholder="Chọn" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rentalUnits.data?.map((ru: any) => (
                                    <SelectItem key={ru.code} value={ru.code}>
                                      {ru.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Price Preview - Full width on next row */}
                          {priceAmount && (
                            <div className="space-y-2 col-span-3">
                              <Label className="text-sm font-medium text-gray-900">Xem trước giá</Label>
                              <div className="bg-green-50 border border-green-200 rounded-md p-3 h-10 flex items-center">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm font-semibold text-green-800">
                                    {Number(priceAmount).toLocaleString()} {priceCurrency}
                                    {isRentalType(dealType) && rentalUnit && ` / ${rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit}`}
                                  </span>
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Step: Depot */}
                  {step === 'depot' && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-blue-800">Thông tin vị trí</h3>
                        </div>
                        <p className="text-sm text-blue-700">
                          Chọn depot lưu trữ container và thêm thông tin vị trí chi tiết
                        </p>
                      </div>

                      {/* A. Depot/Kho Selection */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <Label className="text-base font-semibold text-gray-900 mb-4 block">
                         Depot/Kho *
                        </Label>
                        <div className="space-y-3">
                          <Select value={depotId} onValueChange={setDepotId} required disabled={depotsLoading}>
                            <SelectTrigger className={`h-12 w-full ${!depotId ? 'border-red-300' : 'border-gray-300'}`}>
                              <SelectValue placeholder={depotsLoading ? "Đang tải depot..." : "Chọn depot lưu trữ"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {depotsLoading ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang tải...</span>
                                  </div>
                                </SelectItem>
                              ) : depots.length === 0 ? (
                                <SelectItem value="empty" disabled>
                                  <div className="flex items-center space-x-2 text-gray-500">
                                    <Building2 className="w-4 h-4" />
                                    <span>Không có depot nào trong hệ thống</span>
                                  </div>
                                </SelectItem>
                              ) : (
                                depots.map((d: any) => {
                                  const isAvailable = (d.availableSlots || 0) > 0;
                                  const statusIcon = isAvailable ? '🟢' : '🔴';
                                  const statusText = isAvailable ? `${d.availableSlots || 0} chỗ trống` : 'Hết chỗ';
                                  
                                  return (
                                    <SelectItem 
                                      key={d.id} 
                                      value={d.id.toString()}
                                      disabled={!isAvailable}
                                    >
                                      {statusIcon} {d.name} - {d.address || d.province} ({statusText})
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-500">
                            {depotsLoading 
                              ? "Đang tải danh sách depot..." 
                              : depots.length === 0 
                                ? "Không có depot nào trong hệ thống." 
                                : (
                                  <div className="space-y-1">
                                    <p>Tìm thấy {depots.length} depot. Chỉ có thể chọn depot còn chỗ trống.</p>
                                    <div className="flex items-center space-x-4 text-xs">
                                      <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Còn chỗ trống</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Hết chỗ</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                            }
                          </div>
                        </div>
                      </div>

                      {/* B. Địa chỉ chi tiết (Tùy chọn) */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <Label className="text-base font-semibold text-gray-900 mb-4 block">
                          Địa chỉ chi tiết (Tùy chọn)
                        </Label>
                        <div className="space-y-3">
                          <Textarea
                            value={locationNotes}
                            onChange={(e) => setLocationNotes(e.target.value)}
                            placeholder="Nhập ghi chú thêm về vị trí container, hướng dẫn đến depot, điều kiện đặc biệt..."
                            className="min-h-[80px] resize-none"
                            rows={3}
                          />
                          <div className="flex items-start space-x-2 text-xs text-gray-500">
                            <div className="w-4 h-4 mt-0.5">
                              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                              </svg>
                            </div>
                            <div>
                              <p>Ví dụ: "Container đang ở kho số 3, phía sau nhà kho chính" hoặc "Liên hệ bảo vệ để được hướng dẫn vào khu vực lưu trữ"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Review */}
                  {step === 'review' && (
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <h3 className="font-medium text-green-800">Xem lại thông tin tin đăng</h3>
                        </div>
                        <p className="text-sm text-green-700">
                          Kiểm tra kỹ thông tin trước khi gửi duyệt
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Thông tin giao dịch</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Loại giao dịch:</span>
                              <p className="font-medium">{getDealTypeDisplayName(dealType)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Giá:</span>
                              <p className="font-medium text-green-600">
                                {priceAmount ? Number(priceAmount).toLocaleString() : '0'} {priceCurrency}
                                {isRentalType(dealType) && rentalUnit && ` / ${rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Thông số container</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Kích thước:</span>
                              <p className="font-medium">{containerSizes.data?.find(s => s.size_ft.toString() === size)?.size_ft || size}ft</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Loại:</span>
                              <p className="font-medium">{containerTypes.data?.find(t => t.code === ctype)?.name || ctype}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Tiêu chuẩn:</span>
                              <p className="font-medium">{qualityStandards.data?.find(s => s.code === standard)?.name || standard}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Tình trạng:</span>
                              <p className="font-medium">{getConditionDisplayName(condition)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Vị trí lưu trữ</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Depot:</span>
                              <p className="font-medium">{depots.find(d => d.id.toString() === depotId)?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Địa chỉ:</span>
                              <p className="text-gray-700">{depots.find(d => d.id.toString() === depotId)?.address || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Chỗ trống:</span>
                              <p className="text-gray-700">
                                {(() => {
                                  const selectedDepot = depots.find(d => d.id.toString() === depotId);
                                  if (selectedDepot) {
                                    return `${selectedDepot.availableSlots || 0} / ${selectedDepot.totalSlots || selectedDepot.capacityTeu || 'N/A'} TEU`;
                                  }
                                  return 'N/A';
                                })()}
                              </p>
                            </div>
                            {locationNotes && (
                              <div>
                                <span className="text-gray-500">Ghi chú vị trí:</span>
                                <p className="text-gray-700">{locationNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Nội dung tin đăng</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Tiêu đề:</span>
                              <p className="font-medium">
                                {title || generateListingTitle({
                                  size,
                                  sizeData: containerSizes.data?.find(s => s.size_ft.toString() === size),
                                  type: ctype,
                                  typeData: containerTypes.data?.find(t => t.code === ctype),
                                  standard,
                                  standardData: qualityStandards.data?.find(s => s.code === standard),
                                  condition,
                                  dealType
                                })}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Mô tả:</span>
                              <p className="text-gray-700 text-xs leading-relaxed">
                                {description || generateListingDescription({
                                  size,
                                  sizeData: containerSizes.data?.find(s => s.size_ft.toString() === size),
                                  type: ctype,
                                  typeData: containerTypes.data?.find(t => t.code === ctype),
                                  standard,
                                  standardData: qualityStandards.data?.find(s => s.code === standard),
                                  condition,
                                  dealType,
                                  dealTypeData: dealTypes.data?.find(d => d.code === dealType)
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Images Review Card */}
                        <div className="bg-white border rounded-lg p-4 lg:col-span-2">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Media ({uploadedImages.length} ảnh{uploadedVideo ? ', 1 video' : ''})
                          </h4>
                          {(uploadedImages.length > 0 || uploadedVideo) ? (
                            <div className="space-y-4">
                              {/* Images Preview */}
                              {uploadedImages.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-2">Ảnh ({uploadedImages.length})</p>
                                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                    {imagePreviewUrls.map((url, index) => (
                                      <div key={index} className="relative">
                                        <div className="aspect-square bg-gray-100 rounded overflow-hidden border">
                                          <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        {index === 0 && (
                                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                            Chính
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Video Preview */}
                              {uploadedVideo && videoPreviewUrl && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-2">Video</p>
                                  <div className="max-w-32">
                                    <div className="aspect-video bg-gray-100 rounded overflow-hidden border">
                                      <video
                                        src={videoPreviewUrl}
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                      >
                                      </video>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 truncate">
                                      {uploadedVideo.name} • {(uploadedVideo.size / 1024 / 1024).toFixed(1)}MB
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">Chưa có media nào</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-red-800 font-medium">Có lỗi xảy ra</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div>
                      {step !== 'specs' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const currentIndex = steps.findIndex(s => s.key === step);
                            if (currentIndex > 0) {
                              setStep(steps[currentIndex - 1].key as any);
                              // Reset submit flag when going back
                              setSubmitClicked(false);
                            }
                          }}
                          className="flex items-center space-x-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Quay lại</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button type="button" variant="ghost" onClick={() => router.back()}>
                        Hủy
                      </Button>

                      {step !== 'review' ? (
                        <Button
                          type="button"
                          disabled={!canProceedToNext(step)}
                          onClick={() => {
                            if (!canProceedToNext(step)) {
                              toast({
                                title: "Chưa đầy đủ thông tin",
                                description: "Vui lòng điền đầy đủ thông tin bắt buộc trước khi tiếp tục.",
                                variant: "destructive",
                              });
                              return;
                            }
                            const currentIndex = steps.findIndex(s => s.key === step);
                            if (currentIndex < steps.length - 1) {
                              setStep(steps[currentIndex + 1].key as any);
                              // Reset submit flag when changing steps
                              setSubmitClicked(false);
                            }
                          }}
                          className="flex items-center space-x-2"
                        >
                          <span>Tiếp tục</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={submitting} 
                          className="flex items-center space-x-2"
                          onClick={(e) => {
                            console.log('Gửi duyệt button clicked!');
                            setSubmitClicked(true);
                            // Let the form's onSubmit handle the submission
                          }}
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Đang tạo...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Gửi duyệt</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submitting Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex flex-col items-center space-y-6">
              {/* Animated Spinner */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              
              {/* Progress Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {submitProgress === 'done' ? 'Hoàn tất!' : 'Đang xử lý tin đăng...'}
                </h3>
                <p className="text-sm text-gray-600">
                  {submitProgress === 'done' 
                    ? 'Chuyển hướng đến trang quản lý...' 
                    : 'Vui lòng không tắt trang này'}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="w-full space-y-3 text-sm">
                {/* Step 1: Validation */}
                <div className={`flex items-center space-x-3 transition-colors ${
                  submitProgress === 'validating' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {submitProgress === 'validating' ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>Kiểm tra thông tin</span>
                </div>

                {/* Step 2: Creating */}
                <div className={`flex items-center space-x-3 transition-colors ${
                  submitProgress === 'validating' ? 'text-gray-400' :
                  submitProgress === 'creating' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {submitProgress === 'validating' ? (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  ) : submitProgress === 'creating' ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>Tạo tin đăng</span>
                </div>

                {/* Step 3: Uploading */}
                <div className={`flex items-center space-x-3 transition-colors ${
                  submitProgress === 'validating' || submitProgress === 'creating' ? 'text-gray-400' :
                  submitProgress === 'uploading' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {submitProgress === 'validating' || submitProgress === 'creating' ? (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  ) : submitProgress === 'uploading' ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>Đính kèm ảnh và video</span>
                </div>
              </div>

              {/* Success Icon - Show when done */}
              {submitProgress === 'done' && (
                <div className="pt-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


