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
import { Switch } from '@/components/ui/switch';
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
  Send,
  Clock,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useListingFormData } from '@/hooks/useMasterData';
import MasterDataAPI from '@/lib/api/master-data';
import { getDealTypeDisplayName, isRentalType } from '@/lib/utils/dealType';
import { getConditionDisplayName } from '@/lib/utils/condition';
import { generateListingTitle, generateListingDescription } from '@/lib/utils/listingTitle';
import { fetchDepots } from '@/lib/api/depot';
import { uploadMedia, addMediaToListing } from '@/lib/api/media';
import { TourHelpButton } from '@/components/tour/tour-button';

type Step = 'specs' | 'media' | 'pricing' | 'rental' | 'depot' | 'review';

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('specs');
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<'validating' | 'creating' | 'uploading' | 'done'>('validating');
  const [error, setError] = useState('');

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

  // ============ 🆕 SALE QUANTITY STATE ============
  const [saleQuantity, setSaleQuantity] = useState<number>(1); // Số lượng container cho loại BÁN
  
  // ============ 🆕 CONTAINER IDS STATE ============
  type ContainerWithCarrier = { id: string; shippingLine: string; manufacturedYear?: number };
  const [containerIds, setContainerIds] = useState<ContainerWithCarrier[]>([]); // Danh sách ID container với hãng tàu và năm sản xuất
  const [containerIdInput, setContainerIdInput] = useState<string>(''); // Input tạm thời cho ID
  const [showContainerIdSection, setShowContainerIdSection] = useState<boolean>(false); // Toggle hiển thị phần nhập ID
  const [containerIdError, setContainerIdError] = useState<string>(''); // Lỗi validation container ID

  // ============ 🆕 RENTAL MANAGEMENT STATE ============
  const [totalQuantity, setTotalQuantity] = useState<number>(1);
  const [availableQuantity, setAvailableQuantity] = useState<number>(1);
  const [maintenanceQuantity, setMaintenanceQuantity] = useState<number>(0);
  const [rentedQuantity] = useState<number>(0); // Always 0 for new listings
  const [minRentalDuration, setMinRentalDuration] = useState<number | ''>('');
  const [maxRentalDuration, setMaxRentalDuration] = useState<number | ''>('');
  const [depositRequired, setDepositRequired] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [depositCurrency, setDepositCurrency] = useState<string>('');
  const [lateReturnFeeAmount, setLateReturnFeeAmount] = useState<number | ''>('');
  const [lateReturnFeeUnit, setLateReturnFeeUnit] = useState<string>('PER_DAY');
  const [earliestAvailableDate, setEarliestAvailableDate] = useState<string>('');
  const [latestReturnDate, setLatestReturnDate] = useState<string>('');
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState<boolean>(false);
  const [renewalNoticeDays, setRenewalNoticeDays] = useState<number>(7);
  const [renewalPriceAdjustment, setRenewalPriceAdjustment] = useState<number | ''>(0);

  // ✅ Dynamic steps: Chỉ thêm 'rental' step khi chọn RENTAL
  const steps = React.useMemo(() => {
    const baseSteps = [
      { key: 'specs' as Step, label: 'Thông số', icon: Package, description: 'Thông tin cơ bản về container' },
      { key: 'media' as Step, label: 'Hình ảnh', icon: Camera, description: 'Upload ảnh và video' },
      { key: 'pricing' as Step, label: 'Giá cả', icon: DollarSign, description: 'Thiết lập giá bán/thuê' },
    ];

    // Chỉ thêm 'rental' step khi chọn RENTAL
    if (isRentalType(dealType)) {
      baseSteps.push({ key: 'rental' as Step, label: 'Quản lý', icon: Container, description: 'Quản lý container cho thuê' });
    }

    baseSteps.push(
      { key: 'depot' as Step, label: 'Vị trí', icon: MapPin, description: 'Chọn depot lưu trữ' },
      { key: 'review' as Step, label: 'Xem lại', icon: Eye, description: 'Kiểm tra thông tin cuối cùng' }
    );

    return baseSteps;
  }, [dealType]);

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Validation function for each step
  const validateStep = (stepKey: Step): boolean => {
    switch (stepKey) {
      case 'specs':
        const hasBasicSpecs = !!(dealType && size && ctype && standard && condition);
        const hasQuantity = saleQuantity > 0; // Validate số lượng cho TẤT CẢ deal types
        // Validate container IDs nếu đã bật tính năng nhập ID
        const hasValidContainerIds = !showContainerIdSection || (containerIds.length === saleQuantity);
        return hasBasicSpecs && hasQuantity && hasValidContainerIds;
      case 'media':
        return (uploadedImages.length > 0 || uploadedVideo !== null) && !uploadingMedia; // Require at least 1 image OR 1 video AND not uploading
      case 'pricing':
        const hasPriceAmount = priceAmount && priceAmount > 0;
        const hasPriceCurrency = !!priceCurrency;
        const hasRentalUnit = !isRentalType(dealType) || !!rentalUnit;
        return !!(hasPriceAmount && hasPriceCurrency && hasRentalUnit);
      case 'rental':
        // Only validate for RENTAL type
        if (!isRentalType(dealType)) return true; // Skip validation for non-rental
        
        // Quantity validation
        if (!totalQuantity || totalQuantity < 1) return false;
        if (availableQuantity < 0) return false;
        if (maintenanceQuantity < 0) return false;
        
        // Validation: Tổng phải cân bằng chính xác
        const totalAccounted = availableQuantity + rentedQuantity + maintenanceQuantity;
        if (totalAccounted !== totalQuantity) return false;
        
        // Deposit validation - chỉ validate khi user bật depositRequired
        if (depositRequired) {
          if (!depositAmount || depositAmount <= 0) return false;
          if (!depositCurrency) return false;
        }
        
        return true;
      case 'depot':
        // Validate depot has available slots > 0
        const selectedDepot = depots.find(d => d.id.toString() === depotId);
        return !!(depotId && selectedDepot && (selectedDepot.availableSlots || 0) > 0);
      case 'review':
        return validateStep('specs') && validateStep('media') && validateStep('pricing') && validateStep('rental') && validateStep('depot');
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

  // Auto-set deposit currency when deposit is enabled
  useEffect(() => {
    if (depositRequired && !depositCurrency && priceCurrency) {
      setDepositCurrency(priceCurrency);
    }
  }, [depositRequired, priceCurrency]);

  // Auto-sync quantity from specs to rental management when switching to RENTAL
  useEffect(() => {
    if (isRentalType(dealType) && saleQuantity > 0) {
      // Initialize totalQuantity from saleQuantity if not set or if saleQuantity is larger
      if (totalQuantity < saleQuantity) {
        setTotalQuantity(saleQuantity);
        setAvailableQuantity(saleQuantity);
        setMaintenanceQuantity(0);
      }
    }
  }, [dealType, saleQuantity]);

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

  // ============ 🆕 CONTAINER ID HANDLERS ============
  
  // Validate ISO 6346 Container Number
  const validateISO6346 = (containerId: string): { valid: boolean; error?: string } => {
    // Remove spaces and convert to uppercase
    const cleanId = containerId.trim().toUpperCase().replace(/\s/g, '');
    
    // Check length (must be 11 characters)
    if (cleanId.length !== 11) {
      return {
        valid: false,
        error: `Mã container phải có 11 ký tự (hiện tại: ${cleanId.length})`
      };
    }
    
    // Check format: 4 letters + 7 digits
    const pattern = /^[A-Z]{3}[UJZ][0-9]{7}$/;
    if (!pattern.test(cleanId)) {
      return {
        valid: false,
        error: 'Format không đúng ISO 6346: phải có 3 chữ cái + U/J/Z + 6 số + 1 số kiểm tra'
      };
    }
    
    // Extract parts
    const ownerCode = cleanId.substring(0, 3);
    const equipmentCategoryId = cleanId.substring(3, 4);
    const serialNumber = cleanId.substring(4, 10);
    const checkDigit = parseInt(cleanId.substring(10, 11));
    
    // Calculate check digit according to ISO 6346
    const letterValues: { [key: string]: number } = {
      'A': 10, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17, 'H': 18, 'I': 19, 'J': 20,
      'K': 21, 'L': 23, 'M': 24, 'N': 25, 'O': 26, 'P': 27, 'Q': 28, 'R': 29, 'S': 30, 'T': 31,
      'U': 32, 'V': 34, 'W': 35, 'X': 36, 'Y': 37, 'Z': 38
    };
    
    let sum = 0;
    const fullCode = ownerCode + equipmentCategoryId + serialNumber;
    
    for (let i = 0; i < 10; i++) {
      const char = fullCode[i];
      let value: number;
      
      if (char >= 'A' && char <= 'Z') {
        value = letterValues[char];
      } else {
        value = parseInt(char);
      }
      
      // Multiply by 2^position
      sum += value * Math.pow(2, i);
    }
    
    // Calculate check digit: (sum mod 11) mod 10
    const calculatedCheckDigit = (sum % 11) % 10;
    
    if (calculatedCheckDigit !== checkDigit) {
      return {
        valid: false,
        error: `Số kiểm tra không đúng. Mong đợi: ${calculatedCheckDigit}, nhận được: ${checkDigit}`
      };
    }
    
    return { valid: true };
  };
  
  // Thêm 1 hoặc nhiều container ID cùng lúc (hỗ trợ paste nhiều dòng)
  const handleAddContainerId = (inputText?: string) => {
    // Clear previous error
    setContainerIdError('');
    
    // Sử dụng inputText từ parameter (khi paste) hoặc từ state (khi nhấn nút)
    const textToProcess = (inputText || containerIdInput || '').toString();
    
    if (!textToProcess.trim()) {
      setContainerIdError('Vui lòng nhập mã container');
      return;
    }
    
    console.log('Processing text:', textToProcess, 'Length:', textToProcess.length);
    
    // Tách input thành nhiều dòng (mỗi dòng có thể chứa Container ID và Shipping Line)
    // CHỈ tách theo xuống dòng, KHÔNG tách theo tab vì tab dùng để phân cách cột
    let inputLines = textToProcess
      .split(/[\n\r]+/) // CHỈ tách theo xuống dòng
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log('📋 Split into lines:', inputLines.length, 'lines');
    inputLines.forEach((line, idx) => console.log(`  Line ${idx + 1}:`, JSON.stringify(line)));
    
    if (inputLines.length === 0) {
      setContainerIdError('Vui lòng nhập mã container');
      return;
    }
    
    // Xử lý từng ID
    const newIds: ContainerWithCarrier[] = [];
    const invalidISO: string[] = [];
    const duplicates: string[] = [];
    const overLimit: string[] = [];
    
    inputLines.forEach((input) => {
      // Parse dòng để lấy cả Container ID và Shipping Line (nếu có)
      // Support formats:
      // 1. "SZLU9479129" (chỉ có ID)
      // 2. "SZLU9479129    CMA" (ID + multiple spaces + carrier)
      // 3. "SZLU9479129\tCMA" (ID + tab + carrier - Excel paste)
      // 4. "SZLU9479129,CMA" (CSV format)
      
      // Prioritize tab first (Excel format), then comma, then multiple spaces
      let parts: string[] = [];
      if (input.includes('\t')) {
        // Excel format with tab
        parts = input.split('\t').filter(p => p.trim());
      } else if (input.includes(',')) {
        // CSV format
        parts = input.split(',').filter(p => p.trim());
      } else if (input.match(/\s{2,}/)) {
        // Multiple spaces (2 or more)
        parts = input.split(/\s{2,}/).filter(p => p.trim());
      } else {
        // Single column - just the container ID
        parts = [input.trim()];
      }
      
      const containerId = parts[0]?.trim().toUpperCase().replace(/\s/g, '');
      const shippingLineFromPaste = parts[1]?.trim().toUpperCase() || '';
      
      console.log('📦 Parsing line:', JSON.stringify(input));
      console.log('  → Split into parts:', parts);
      console.log('  → Container ID:', containerId);
      console.log('  → Shipping Line from paste:', shippingLineFromPaste);
      
      // Validate ISO 6346 cho container ID
      const validation = validateISO6346(containerId);
      if (!validation.valid) {
        invalidISO.push(containerId);
        return;
      }
      
      // Normalize ID (uppercase, no spaces)
      const normalizedId = containerId;
      
      // Kiểm tra trùng lặp trong danh sách hiện có
      if (containerIds.some(c => c.id === normalizedId)) {
        duplicates.push(normalizedId);
        return;
      }
      
      // Kiểm tra trùng lặp trong batch đang thêm
      if (newIds.some(c => c.id === normalizedId)) {
        duplicates.push(normalizedId);
        return;
      }
      
      // Kiểm tra số lượng tối đa
      if (containerIds.length + newIds.length >= saleQuantity) {
        overLimit.push(normalizedId);
        return;
      }
      
      // Map shipping line abbreviations to full names
      const carrierMap: { [key: string]: string } = {
        'CMA': 'CMA CGM',
        'MSC': 'MSC',
        'MAERSK': 'Maersk',
        'COSCO': 'COSCO',
        'HAPAG': 'Hapag-Lloyd',
        'HLCU': 'Hapag-Lloyd',
        'EVERGREEN': 'Evergreen',
        'ONE': 'ONE',
        'YANG': 'Yang Ming',
        'YMLU': 'Yang Ming',
        'HMM': 'HMM',
        'PIL': 'PIL',
        'ZIM': 'ZIM',
        'WAN': 'Wan Hai',
        'WHLU': 'Wan Hai',
        'OOCL': 'OOCL',
        'CAI': 'CAI', // Special code
        'XCDX': 'XCDXC',
        'XCDXC': 'XCDXC',
        'CMAU': 'CMA CGM',
        'MSCU': 'MSC',
        'MAEU': 'Maersk',
      };
      
      // Tìm shipping line name từ abbreviation hoặc owner code
      let detectedShippingLine = shippingLineFromPaste;
      
      // Nếu có shipping line từ paste, thử map
      if (shippingLineFromPaste) {
        const upperCarrier = shippingLineFromPaste.toUpperCase();
        detectedShippingLine = carrierMap[upperCarrier] || shippingLineFromPaste;
      } else {
        // Nếu không có từ paste, thử detect từ owner code (3 ký tự đầu)
        const ownerCode = normalizedId.substring(0, 4).toUpperCase();
        detectedShippingLine = carrierMap[ownerCode] || '';
      }
      
      // Success - add to new list với shipping line detected
      newIds.push({ 
        id: normalizedId, 
        shippingLine: detectedShippingLine,
        manufacturedYear: undefined // Người dùng sẽ nhập sau
      });
    });
    
    // Xây dựng thông báo lỗi ngắn gọn
    const errorMessages: string[] = [];
    
    if (invalidISO.length > 0) {
      errorMessages.push(`${invalidISO.slice(0, 3).join(', ')}${invalidISO.length > 3 ? ` (+${invalidISO.length - 3} mã)` : ''}`);
    }
    
    if (duplicates.length > 0) {
      errorMessages.push(`Trùng: ${duplicates.slice(0, 2).join(', ')}${duplicates.length > 2 ? ` (+${duplicates.length - 2})` : ''}`);
    }
    
    if (overLimit.length > 0) {
      errorMessages.push(`Vượt giới hạn: ${overLimit.slice(0, 2).join(', ')}${overLimit.length > 2 ? ` (+${overLimit.length - 2})` : ''}`);
    }
    
    // Thêm các IDs hợp lệ vào danh sách
    if (newIds.length > 0) {
      setContainerIds([...containerIds, ...newIds]);
      setContainerIdInput('');
      
      // Count how many have shipping line auto-filled
      const withShippingLine = newIds.filter(c => c.shippingLine).length;
      
      toast({
        title: "Thành công",
        description: withShippingLine > 0 
          ? `Đã thêm ${newIds.length} container${newIds.length > 1 ? 's' : ''} • ${withShippingLine} đã tự động nhận diện hãng tàu` 
          : `Đã thêm ${newIds.length} container${newIds.length > 1 ? 's' : ''} vào danh sách`,
      });
    }
    
    // Hiển thị tất cả lỗi nếu có
    if (errorMessages.length > 0) {
      setContainerIdError(errorMessages.join('\n'));
      
      // Chỉ toast nếu không có ID nào hợp lệ
      if (newIds.length === 0) {
        toast({
          title: "Lỗi",
          description: errorMessages[0],
          variant: "destructive",
        });
      }
    } else if (newIds.length > 0) {
      // Clear error nếu thành công hoàn toàn
      setContainerIdError('');
    }
  };

  // Xóa 1 container ID
  const handleRemoveContainerId = (index: number) => {
    setContainerIds(containerIds.filter((_, i) => i !== index));
  };

  // Import container IDs từ file CSV/TXT
  const handleImportContainerIds = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Parse file: mỗi dòng là 1 ID, hoặc CSV với ID ở cột đầu tiên
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      const newIds: ContainerWithCarrier[] = [];
      const errors: string[] = [];
      
      lines.forEach((line, index) => {
        // Skip header line in CSV
        if (index === 0 && (line.toLowerCase().includes('container') || line.toLowerCase().includes('id'))) {
          return;
        }
        
        // Nếu là CSV, lấy cột đầu tiên
        const id = line.split(',')[0].trim();
        
        if (!id) return;
        
        // Validate ISO 6346
        const validation = validateISO6346(id);
        if (!validation.valid) {
          errors.push(`Dòng ${index + 1}: ${id} - ${validation.error}`);
          return;
        }
        
        // Normalize ID
        const normalizedId = id.toUpperCase().replace(/\s/g, '');
        
        // Check duplicate
        if (!containerIds.some(c => c.id === normalizedId) && !newIds.some(c => c.id === normalizedId)) {
          newIds.push({ id: normalizedId, shippingLine: '' });
        }
      });

      // Show errors if any
      if (errors.length > 0) {
        const errorMsg = errors.slice(0, 3).join('\n');
        toast({
          title: `Phát hiện ${errors.length} lỗi`,
          description: errorMsg + (errors.length > 3 ? '\n...' : ''),
          variant: "destructive",
        });
      }

      // Add valid IDs
      if (newIds.length > 0) {
        // Kiểm tra số lượng
        if (containerIds.length + newIds.length > saleQuantity) {
          const canAdd = saleQuantity - containerIds.length;
          toast({
            title: "Cảnh báo",
            description: `File có ${newIds.length} IDs hợp lệ, chỉ nhập được ${canAdd} IDs còn lại`,
          });
          setContainerIds([...containerIds, ...newIds.slice(0, canAdd)]);
        } else {
          setContainerIds([...containerIds, ...newIds]);
          toast({
            title: "Thành công",
            description: `Đã import ${newIds.length} container IDs hợp lệ`,
          });
        }
      } else if (errors.length === 0) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy ID hợp lệ trong file",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Lỗi",
        description: "Không thể đọc file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

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
    
    // Validate rental management fields for RENTAL
    if (isRentalType(dealType)) {
      if (depositRequired) {
        if (depositAmount === '' || !depositAmount || Number(depositAmount) <= 0) {
          errors.push('Số tiền đặt cọc phải lớn hơn 0 khi bật yêu cầu đặt cọc');
        }
        if (!depositCurrency) {
          errors.push('Vui lòng chọn đơn vị tiền tệ cho tiền đặt cọc');
        }
      }
    }
    
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
        priceAmount: Number(priceAmount),
        priceCurrency: priceCurrency,
        rentalUnit: isRentalType(dealType) ? rentalUnit : undefined,
        facets: {
          size: size,         // Use simple 'size' key for consistency
          type: ctype,
          standard,
          condition
        },
        
        // ✅ ALWAYS send quantity fields (required by Prisma schema as non-nullable Int)
        // For NON-RENTAL (SALE): use user-provided quantity from specs step (stored in saleQuantity)
        // For RENTAL: use user-provided values from the rental management step (totalQuantity, availableQuantity, etc.)
        totalQuantity: Number(isRentalType(dealType) ? totalQuantity : saleQuantity),
        availableQuantity: Number(isRentalType(dealType) ? availableQuantity : saleQuantity),
        maintenanceQuantity: Number(isRentalType(dealType) ? maintenanceQuantity : 0),
        
        // ============ 🆕 CONTAINER IDs với Shipping Line và Manufactured Year (if provided) ============
        ...(containerIds && containerIds.length > 0 && {
          containerIds: containerIds.map(c => ({
            id: c.id,
            ...(c.shippingLine && c.shippingLine.trim() && { shippingLine: c.shippingLine.trim() }),
            ...(c.manufacturedYear && { manufacturedYear: c.manufacturedYear })
          }))
        }),
        
        // ✅ Rental-specific fields (only for RENTAL)
        ...(isRentalType(dealType) && {
          minRentalDuration: minRentalDuration && Number(minRentalDuration) > 0 ? Number(minRentalDuration) : undefined,
          maxRentalDuration: maxRentalDuration && Number(maxRentalDuration) > 0 ? Number(maxRentalDuration) : undefined,
          depositRequired,
          // Only send deposit info if depositRequired is true
          ...(depositRequired && {
            depositAmount: depositAmount && Number(depositAmount) > 0 ? Number(depositAmount) : undefined,
            depositCurrency: depositCurrency || undefined,
          }),
          // Only send late fee if amount is provided
          ...(lateReturnFeeAmount && Number(lateReturnFeeAmount) > 0 && {
            lateReturnFeeAmount: Number(lateReturnFeeAmount),
            lateReturnFeeUnit: lateReturnFeeUnit || 'PER_DAY',
          }),
          earliestAvailableDate: earliestAvailableDate || undefined,
          latestReturnDate: latestReturnDate || undefined,
          autoRenewalEnabled,
          renewalNoticeDays: Number(renewalNoticeDays),
          renewalPriceAdjustment: renewalPriceAdjustment && Number(renewalPriceAdjustment) !== 0 ? Number(renewalPriceAdjustment) : 0
        })
      };

      console.log('=== SUBMITTING LISTING DATA ===');
      console.log('Full listing data:', JSON.stringify(listingData, null, 2));
      console.log('Deal Type:', dealType);
      console.log('Is Rental Type:', isRentalType(dealType));
      console.log('Quantity fields:', {
        totalQuantity: listingData.totalQuantity,
        availableQuantity: listingData.availableQuantity,
        maintenanceQuantity: listingData.maintenanceQuantity
      });
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

      if (result.success && result.data?.listing?.id) {
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
        throw new Error('Không thể tạo tin đăng - Phản hồi từ server không hợp lệ');
      }
    } catch (err: any) {
      console.error('=== CREATE LISTING ERROR ===');
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('============================');
      
      // Extract detailed error message
      let errorMessage = 'Có lỗi xảy ra khi tạo tin đăng';
      
      if (err.response?.data) {
        const data = err.response.data;
        errorMessage = data.error || data.message || errorMessage;
        
        // If there are validation details, show them
        if (data.details) {
          console.error('Error details:', data.details);
          errorMessage += ` (Chi tiết: ${JSON.stringify(data.details)})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Lỗi tạo tin đăng",
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
    <div className="min-h-screen ">
      {/* Tour Help Button - Fixed position */}
      <div className="fixed bottom-6 right-6 z-50">
        <TourHelpButton tourName="sellNew" />
      </div>
      
      <div className="w-full px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Đăng tin bán container</h1>
          <p className="text-lg text-muted-foreground">
            Tạo tin đăng chuyên nghiệp trong {isRentalType(dealType) ? '6' : '5'} bước đơn giản
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 bg-white rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">
              Bước {currentStepIndex + 1} / {steps.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}% hoàn thành</span>
          </div>
          <Progress value={progress} className="h-2.5 mb-8" />

          {/* Step Indicators */}
          <div id="progress-steps-indicator" className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = stepItem.key === step;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={stepItem.key} className="flex flex-col items-center relative flex-1">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white shadow-green-200'
                      : isActive
                        ? 'bg-primary border-primary text-primary-foreground shadow-primary/20'
                        : 'bg-background border-border text-muted-foreground'
                    }`}>
                    {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <StepIcon className="w-7 h-7" />}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-xs font-semibold ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {stepItem.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                      {stepItem.description}
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-7 left-[calc(50%+28px)] h-0.5 transition-colors ${index < currentStepIndex ? 'bg-green-500' : 'bg-border'
                      }`} style={{ width: 'calc(100% - 56px)' }} />
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
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    {React.createElement(steps[currentStepIndex].icon, { className: "w-6 h-6 text-primary" })}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-1">{steps[currentStepIndex].label}</CardTitle>
                    <CardDescription className="text-base">{steps[currentStepIndex].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-8">{/* Form content */}
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Step: Specs */}
                  {step === 'specs' && (
                    <div className="space-y-8">
                      {/* Deal Type Selection */}
                      <div id="deal-type-section" className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                        <Label className="text-lg font-bold text-foreground mb-5 block flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          Loại giao dịch *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {dealTypes.data?.map((dt: any) => (
                            <div
                              key={dt.code}
                              className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${dealType === dt.code
                                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 scale-[1.02]'
                                  : 'border-border bg-background hover:border-primary/50 hover:shadow-sm'
                                }`}
                              onClick={() => setDealType(dt.code)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${dealType === dt.code ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                  }`}>
                                  {dealType === dt.code && (
                                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-foreground text-sm mb-0.5">{dt.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{dt.description}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Container Specifications */}
                      <div className="bg-background rounded-xl p-6 border border-border">
                        <Label className="text-lg font-bold text-foreground mb-5 block flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          Thông số container *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="space-y-2.5">
                          <Label className="text-sm font-semibold text-foreground">Kích thước *</Label>
                          <Select 
                            value={size} 
                            onValueChange={(val) => {
                              console.log('Size selected:', val);
                              setSize(val);
                            }} 
                            required
                          >
                            <SelectTrigger id="container-size-select" className={`h-11 w-full rounded-lg ${!size ? 'border-destructive' : 'border-input'}`}>
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {containerSizes.data?.map((s: any) => (
                                <SelectItem key={s.size_ft} value={s.size_ft.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <Container className="w-4 h-4 text-muted-foreground" />
                                    <span>{s.size_ft}ft</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2.5">
                          <Label className="text-sm font-semibold text-foreground">Loại container *</Label>
                          <Select 
                            value={ctype} 
                            onValueChange={(val) => {
                              console.log('Container type selected:', val);
                              setCtype(val);
                            }} 
                            required
                          >
                            <SelectTrigger id="container-type-select" className={`h-11 w-full rounded-lg ${!ctype ? 'border-destructive' : 'border-input'}`}>
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {containerTypes.data?.map((t: any) => (
                                <SelectItem key={t.code} value={t.code}>
                                  <div className="flex items-center space-x-2">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    <span>{t.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2.5">
                          <Label className="text-sm font-semibold text-foreground">Tiêu chuẩn *</Label>
                          <Select 
                            value={standard} 
                            onValueChange={(val) => {
                              console.log('Standard selected:', val);
                              setStandard(val);
                            }}
                          >
                            <SelectTrigger id="quality-standard-select" className="h-11 w-full rounded-lg border-input">
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

                        <div className="space-y-2.5">
                          <Label className="text-sm font-semibold text-foreground">Tình trạng *</Label>
                          <Select 
                            value={condition} 
                            onValueChange={(v) => {
                              console.log('Condition selected:', v);
                              setCondition(v as any);
                            }}
                          >
                            <SelectTrigger id="condition-select" className="h-11 w-full rounded-lg border-input">
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
                      </div>

                      {/* ============ ✅ QUANTITY FOR ALL DEAL TYPES - ĐẶT Ở SPECS STEP ============ */}
                      <div id="quantity-section" className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Số lượng tồn kho</h3>
                          </div>
                          {saleQuantity > 0 && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 text-sm font-semibold shadow-sm">
                              {saleQuantity} container{saleQuantity > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-5">
                          <div className="flex-1">
                            <Label className="text-sm font-semibold text-foreground mb-2.5 block">
                              Số lượng container có sẵn *
                            </Label>
                            <div className="relative">
                              <Package className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                type="number"
                                min="1"
                                value={saleQuantity}
                                onChange={(e) => {
                                  const newQty = e.target.value === '' ? 1 : Math.max(1, Number(e.target.value));
                                  setSaleQuantity(newQty);
                                  if (newQty < containerIds.length) {
                                    setContainerIds(containerIds.slice(0, newQty));
                                  }
                                }}
                                placeholder="VD: 10"
                                className={`h-12 pl-11 bg-white rounded-lg font-medium ${saleQuantity <= 0 ? 'border-destructive' : 'border-input'}`}
                                required
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {isRentalType(dealType) ? 'Số lượng container có sẵn để cho thuê' : 'Số lượng container có sẵn để bán'}
                            </p>
                          </div>
                          
                          {saleQuantity > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 text-center min-w-[160px] shadow-sm">
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <div className="text-3xl font-bold text-green-700">{saleQuantity}</div>
                              <div className="text-xs text-muted-foreground mt-1 font-medium">Có sẵn</div>
                            </div>
                          )}
                        </div>

                        {/* ============ 🆕 CONTAINER IDs SECTION ============ */}
                        <Separator className="my-6" />
                        
                        <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 w-full shadow-sm">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-1.5">
                                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-foreground text-base">Danh sách ID Container</h4>
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 mt-1">Tùy chọn</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground ml-13">Nhập mã ISO 6346 để quản lý từng container</p>
                            </div>
                            <Switch
                              checked={showContainerIdSection}
                              onCheckedChange={(checked) => {
                                setShowContainerIdSection(checked);
                                if (!checked) setContainerIds([]);
                              }}
                              className="flex-shrink-0 ml-4"
                            />
                          </div>

                          {showContainerIdSection && (
                            <div className="space-y-5 pt-5 border-t-2 border-purple-200 w-full">
                              {/* Progress Bar */}
                              <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-sm w-full">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Package className="w-5 h-5 text-purple-600" />
                                      <span className="text-base font-bold text-foreground">{containerIds.length} / {saleQuantity}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Còn lại: {saleQuantity - containerIds.length}</span>
                                  </div>
                                  {containerIds.length === saleQuantity ? (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs shadow-sm">
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                      Hoàn thành
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50">
                                      Chưa đủ
                                    </Badge>
                                  )}
                                </div>
                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${Math.min((containerIds.length / saleQuantity) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Input Area with improved layout */}
                              <div className="bg-white rounded-xl p-5 border-2 border-input shadow-sm">
                                <Label className="text-sm font-semibold text-foreground mb-3 block">
                                  Nhập hoặc paste nhiều mã ISO 6346 (VD: ABCU1234560)
                                </Label>
                                <div className="flex gap-3">
                                  <Input
                                    type="text"
                                    value={containerIdInput}
                                    onChange={(e) => {
                                      const value = e.target.value.toUpperCase();
                                      setContainerIdInput(value);
                                      if (containerIdError) setContainerIdError('');
                                      console.log('Input changed, length:', value.length);
                                    }}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddContainerId();
                                      }
                                    }}
                                    onPaste={(e) => {
                                      // Vẫn hỗ trợ paste nhiều dòng
                                      e.preventDefault();
                                      const pastedText = e.clipboardData.getData('text');
                                      const upperText = pastedText.toUpperCase().trim();
                                      setContainerIdInput(upperText);
                                      console.log('✅ Pasted text length:', upperText.length);
                                      console.log('✅ Pasted text:', upperText);
                                      
                                      // Truyền text trực tiếp vào function để không phụ thuộc vào state update
                                      setTimeout(() => {
                                        handleAddContainerId(upperText);
                                      }, 100);
                                    }}
                                    placeholder="ABCU1234560"
                                    className={`flex-1 h-12 font-mono text-sm rounded-lg ${containerIdError ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                                    disabled={containerIds.length >= saleQuantity}
                                  />
                                  <label className="cursor-pointer flex-shrink-0">
                                    <input
                                      type="file"
                                      accept=".txt,.csv"
                                      onChange={handleImportContainerIds}
                                      className="hidden"
                                      disabled={containerIds.length >= saleQuantity}
                                    />
                                    <Button
                                      type="button"
                                      size="default"
                                      variant="outline"
                                      className="h-12 px-5 border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50 rounded-lg font-semibold"
                                      disabled={containerIds.length >= saleQuantity}
                                      asChild
                                    >
                                      <span className="inline-flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Import
                                      </span>
                                    </Button>
                                  </label>
                                  <Button
                                    type="button"
                                    onClick={() => handleAddContainerId()}
                                    disabled={containerIds.length >= saleQuantity}
                                    size="default"
                                    className="h-12 px-7 flex-shrink-0 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold shadow-sm"
                                  >
                                    Thêm
                                  </Button>
                                </div>
                                <div className="flex items-start gap-2 mt-3 bg-amber-50 rounded-lg p-3 border border-amber-200">
                                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                    <strong>Mẹo:</strong> Bạn có thể copy nhiều mã từ Excel/CSV và paste trực tiếp vào ô nhập liệu!
                                  </p>
                                </div>
                              </div>
                              
                              {containerIdError && (
                                <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg flex items-start gap-2">
                                  <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                  <span className="leading-snug">{containerIdError}</span>
                                </div>
                              )}

                              {/* List */}
                              {containerIds.length > 0 && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-foreground">
                                      Danh sách đã nhập ({containerIds.length})
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setContainerIds([]);
                                        toast({ title: "Đã xóa tất cả container IDs" });
                                      }}
                                      className="text-sm text-destructive hover:text-destructive hover:bg-destructive/10 h-9 rounded-lg font-medium"
                                    >
                                      <X className="w-4 h-4 mr-1.5" />
                                      Xóa tất cả
                                    </Button>
                                  </div>
                                  <div className="bg-white border-2 border-input rounded-xl overflow-hidden shadow-sm">
                                    {/* Table Header */}
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-5 py-3 border-b-2 border-purple-200">
                                      <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-foreground">
                                        <div className="col-span-1">#</div>
                                        <div className="col-span-4">Mã Container</div>
                                        <div className="col-span-3">Hãng tàu</div>
                                        <div className="col-span-3">Năm sản xuất</div>
                                        <div className="col-span-1"></div>
                                      </div>
                                    </div>
                                    
                                    {/* Table Body */}
                                    <div className="max-h-[400px] overflow-y-auto">
                                      {containerIds.map((container, index) => (
                                        <div
                                          key={index}
                                          className="grid grid-cols-12 gap-4 items-center px-5 py-3.5 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                                        >
                                          {/* Index */}
                                          <div className="col-span-1">
                                            <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700 font-semibold">
                                              #{index + 1}
                                            </Badge>
                                          </div>
                                          
                                          {/* Container ID */}
                                          <div className="col-span-4">
                                            <span className="font-mono text-sm font-semibold text-foreground">{container.id}</span>
                                          </div>
                                          
                                          {/* Shipping Line Input with Autocomplete */}
                                          <div className="col-span-3">
                                            <Input
                                              value={container.shippingLine}
                                              onChange={(e) => {
                                                const updatedIds = [...containerIds];
                                                updatedIds[index].shippingLine = e.target.value;
                                                setContainerIds(updatedIds);
                                              }}
                                              placeholder="Chọn hoặc nhập..."
                                              className="h-9 text-xs"
                                              list={`shipping-line-datalist-${index}`}
                                            />
                                            <datalist id={`shipping-line-datalist-${index}`}>
                                              <option value="Maersk">Maersk Line</option>
                                              <option value="MSC">Mediterranean Shipping Company (MSC)</option>
                                              <option value="CMA CGM">CMA CGM</option>
                                              <option value="COSCO">COSCO Shipping</option>
                                              <option value="Hapag-Lloyd">Hapag-Lloyd</option>
                                              <option value="Evergreen">Evergreen Marine</option>
                                              <option value="ONE">Ocean Network Express (ONE)</option>
                                              <option value="Yang Ming">Yang Ming Marine Transport</option>
                                              <option value="HMM">HMM (Hyundai Merchant Marine)</option>
                                              <option value="PIL">Pacific International Lines (PIL)</option>
                                              <option value="ZIM">ZIM Integrated Shipping</option>
                                              <option value="Wan Hai">Wan Hai Lines</option>
                                              <option value="OOCL">OOCL (Orient Overseas Container Line)</option>
                                              <option value="XCDXC">XCDXC</option>
                                            </datalist>
                                          </div>
                                          
                                          {/* Manufactured Year Input */}
                                          <div className="col-span-3">
                                            <Input
                                              type="number"
                                              min="1970"
                                              max={new Date().getFullYear()}
                                              value={container.manufacturedYear || ''}
                                              onChange={(e) => {
                                                const updatedIds = [...containerIds];
                                                const value = e.target.value;
                                                updatedIds[index].manufacturedYear = value ? Number(value) : undefined;
                                                setContainerIds(updatedIds);
                                              }}
                                              placeholder={`VD: ${new Date().getFullYear() - 2}`}
                                              className="h-9 text-xs"
                                            />
                                          </div>
                                          
                                          {/* Remove Button */}
                                          <div className="col-span-1 flex justify-end">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveContainerId(index)}
                                              className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="my-8" />

                      {/* Title and Description - Separate Rows */}
                      <div id="title-description-section" className="space-y-6 bg-background rounded-xl p-6 border border-border">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Tiêu đề tin đăng
                          </Label>
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề..."
                            className="h-11 w-full border-input rounded-lg"
                          />
                          <p className="text-xs text-muted-foreground">
                            {title ? `${title.length}/200 ký tự` : "Tự động tạo nếu để trống (tối thiểu 10 ký tự, tối đa 200 ký tự)"}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Mô tả chi tiết
                          </Label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả chi tiết về container..."
                            rows={4}
                            className="resize-none w-full border-input rounded-lg"
                          />
                          <p className="text-xs text-muted-foreground">
                            {description ? `${description.length}/2000 ký tự` : "Mô tả chi tiết để thu hút khách hàng (tối thiểu 20 ký tự, tối đa 2000 ký tự)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step: Media */}
                  {step === 'media' && (
                    <div className="space-y-8">
                      {/* Upload Area */}
                      <div 
                        id="media-upload-section"
                        className="border-2 border-dashed border-primary/30 rounded-2xl bg-gradient-to-br from-primary/5 to-background transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-md"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="text-center py-16">
                          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Upload className="w-10 h-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-3">Upload hình ảnh và video container</h3>
                          <p className="text-muted-foreground mb-6 text-base">Kéo thả file vào đây hoặc click để chọn</p>
                          
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex space-x-4">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={uploadingMedia}
                                />
                                <div className={`inline-flex items-center px-6 py-3 border-2 border-input rounded-xl shadow-sm bg-background text-base font-semibold text-foreground hover:bg-muted transition-all ${uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                                  <Camera className="w-5 h-5 mr-2" />
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
                                <div className={`inline-flex items-center px-6 py-3 border-2 border-input rounded-xl shadow-sm bg-background text-base font-semibold text-foreground hover:bg-muted transition-all ${uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                                  <Upload className="w-5 h-5 mr-2" />
                                  {uploadingMedia ? 'Đang upload...' : 'Chọn video'}
                                </div>
                              </label>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1.5 text-center max-w-xl bg-muted/30 rounded-lg p-4">
                              <p className="font-medium">• <strong>Ảnh:</strong> Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
                              <p className="font-medium">• <strong>Video:</strong> Tối đa 1 video MP4, không quá 100MB</p>
                              <p className="font-medium">• Hỗ trợ: JPG, PNG, GIF, WebP, MP4</p>
                              <p className="font-medium">• Ảnh đầu tiên sẽ được làm ảnh đại diện</p>
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
                      <div id="pricing-section" className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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

                  {/* ============ 🆕 Step: Rental Management (Chỉ cho RENTAL) ============ */}
                  {step === 'rental' && isRentalType(dealType) && (
                    <div id="rental-management-section" className="space-y-6">
                      {/* Info Notice */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-800">
                              Quản lý số lượng chi tiết cho container cho thuê
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Bạn đã nhập <strong>{saleQuantity} container</strong> ở bước trước. Bây giờ hãy phân chia chi tiết số lượng này thành: có sẵn, đang thuê, và đang bảo trì.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* A. Inventory Management */}
                      <div id="quantity-inventory-section" className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Package className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Quản lý số lượng container</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {/* Total Quantity */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Tổng số container có sẵn *
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              value={totalQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setTotalQuantity(val);
                                // Auto-adjust available quantity to maintain balance
                                const newAvailable = Math.max(0, val - maintenanceQuantity - rentedQuantity);
                                setAvailableQuantity(newAvailable);
                              }}
                              placeholder="VD: 10"
                              className="h-10"
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Tổng số container bạn có thể cho thuê đồng thời
                            </p>
                          </div>

                          {/* Available Quantity */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Số lượng hiện có sẵn *
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max={totalQuantity - maintenanceQuantity - rentedQuantity}
                              value={availableQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const maxAvailable = totalQuantity - maintenanceQuantity - rentedQuantity;
                                setAvailableQuantity(Math.min(val, maxAvailable));
                              }}
                              placeholder="VD: 8"
                              className="h-10"
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Số container đang sẵn sàng cho thuê ngay
                            </p>
                          </div>

                          {/* In Maintenance */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Đang bảo trì
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max={totalQuantity - availableQuantity - rentedQuantity}
                              value={maintenanceQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const maxMaintenance = totalQuantity - availableQuantity - rentedQuantity;
                                setMaintenanceQuantity(Math.min(val, maxMaintenance));
                              }}
                              placeholder="VD: 2"
                              className="h-10"
                            />
                            <p className="text-xs text-gray-500">
                              Số container đang trong quá trình bảo trì/sửa chữa
                            </p>
                          </div>

                          {/* Summary Display */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-3">Tổng quan</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tổng số:</span>
                                <span className="font-semibold">{totalQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Có sẵn:</span>
                                <span className="font-semibold text-green-600">{availableQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Đang thuê:</span>
                                <span className="font-semibold">{rentedQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Bảo trì:</span>
                                <span className="font-semibold text-yellow-600">{maintenanceQuantity}</span>
                              </div>
                              {(availableQuantity + rentedQuantity + maintenanceQuantity !== totalQuantity) && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                  <p className="text-xs text-red-700">
                                    ⚠️ Tổng không khớp! Cần: {totalQuantity}, Có: {availableQuantity + rentedQuantity + maintenanceQuantity}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* B. Rental Duration Constraints */}
                      <div id="rental-duration-section" className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Thời gian thuê</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {/* Min Duration */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Thời gian thuê tối thiểu
                            </Label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                min="1"
                                value={minRentalDuration}
                                onChange={(e) => setMinRentalDuration(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="VD: 3"
                                className="h-10 flex-1"
                              />
                              <div className="h-10 min-w-[120px] flex items-center justify-center bg-gray-100 rounded-md text-sm text-gray-600 px-3">
                                {rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit || 'Chọn đơn vị'}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              VD: Tối thiểu 3 tháng
                            </p>
                          </div>

                          {/* Max Duration */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Thời gian thuê tối đa
                            </Label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                min={minRentalDuration || 1}
                                value={maxRentalDuration}
                                onChange={(e) => setMaxRentalDuration(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="VD: 12"
                                className="h-10 flex-1"
                              />
                              <div className="h-10 min-w-[120px] flex items-center justify-center bg-gray-100 rounded-md text-sm text-gray-600 px-3">
                                {rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit || 'Chọn đơn vị'}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              VD: Tối đa 12 tháng (để trống = không giới hạn)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* C. Deposit & Fee Policy */}
                      <div id="deposit-policy-section" className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <DollarSign className="w-5 h-5 text-yellow-600" />
                          <h3 className="font-semibold text-gray-900">Chính sách đặt cọc & phí</h3>
                        </div>
                        
                        {/* Deposit Required Toggle */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-gray-900">
                              Yêu cầu đặt cọc
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Khách hàng phải đặt cọc trước khi thuê
                            </p>
                          </div>
                          <Switch
                            checked={depositRequired}
                            onCheckedChange={setDepositRequired}
                          />
                        </div>

                        {depositRequired && (
                          <div className="grid grid-cols-2 gap-6 mt-4">
                            {/* Deposit Amount */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Số tiền đặt cọc *
                              </Label>
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="VD: 5000000"
                                  className="h-10 flex-1"
                                  required={depositRequired}
                                />
                                <Select 
                                  value={depositCurrency || priceCurrency} 
                                  onValueChange={setDepositCurrency}
                                >
                                  <SelectTrigger className="h-10 w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {currencies.data?.map((cur: any) => (
                                      <SelectItem key={cur.code} value={cur.code}>
                                        {cur.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {depositAmount !== '' && depositAmount > 0 && (
                                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700">
                                    {new Intl.NumberFormat('vi-VN').format(Number(depositAmount))} {depositCurrency || priceCurrency}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                Thường bằng 20-50% giá thuê 1 kỳ
                              </p>
                            </div>

                            {/* Late Return Fee */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Phí trả muộn (tùy chọn)
                              </Label>
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={lateReturnFeeAmount}
                                  onChange={(e) => setLateReturnFeeAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="VD: 100000"
                                  className="h-10 flex-1"
                                />
                                <Select 
                                  value={lateReturnFeeUnit} 
                                  onValueChange={setLateReturnFeeUnit}
                                >
                                  <SelectTrigger className="h-10 w-32">
                                    <SelectValue placeholder="Đơn vị" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PER_DAY">/ Ngày</SelectItem>
                                    <SelectItem value="PER_WEEK">/ Tuần</SelectItem>
                                    <SelectItem value="PERCENTAGE">% Giá thuê</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {lateReturnFeeAmount !== '' && lateReturnFeeAmount > 0 && (
                                <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded border border-amber-200">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-semibold text-amber-700">
                                    {new Intl.NumberFormat('vi-VN').format(Number(lateReturnFeeAmount))} {depositCurrency || priceCurrency}
                                    {lateReturnFeeUnit === 'PER_DAY' && ' / Ngày'}
                                    {lateReturnFeeUnit === 'PER_WEEK' && ' / Tuần'}
                                    {lateReturnFeeUnit === 'PERCENTAGE' && '%'}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                Phí phạt khi khách hàng trả container muộn hạn
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* D. Availability Dates */}
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Ngày có thể thuê</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {/* Earliest Available Date */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Sớm nhất có thể giao (tùy chọn)
                            </Label>
                            <Input
                              type="date"
                              value={earliestAvailableDate}
                              onChange={(e) => setEarliestAvailableDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="h-10"
                            />
                            <p className="text-xs text-gray-500">
                              Ngày sớm nhất khách có thể nhận container
                            </p>
                          </div>

                          {/* Latest Return Date */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Muộn nhất phải trả (tùy chọn)
                            </Label>
                            <Input
                              type="date"
                              value={latestReturnDate}
                              onChange={(e) => setLatestReturnDate(e.target.value)}
                              min={earliestAvailableDate || new Date().toISOString().split('T')[0]}
                              className="h-10"
                            />
                            <p className="text-xs text-gray-500">
                              Chỉ dùng cho thuê ngắn hạn có thời hạn cố định
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* E. Renewal Policy */}
                      <div id="renewal-policy-section" className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <RefreshCw className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Chính sách gia hạn</h3>
                        </div>
                        
                        {/* Auto Renewal Toggle */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-gray-900">
                              Cho phép gia hạn tự động
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Khách hàng có thể gia hạn hợp đồng thuê
                            </p>
                          </div>
                          <Switch
                            checked={autoRenewalEnabled}
                            onCheckedChange={setAutoRenewalEnabled}
                          />
                        </div>

                        {autoRenewalEnabled && (
                          <div className="grid grid-cols-2 gap-6 mt-4">
                            {/* Notice Days */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Thông báo trước (ngày)
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max="30"
                                value={renewalNoticeDays}
                                onChange={(e) => setRenewalNoticeDays(Number(e.target.value))}
                                placeholder="VD: 7"
                                className="h-10"
                              />
                              <p className="text-xs text-gray-500">
                                Thông báo khách hàng trước X ngày hết hạn
                              </p>
                            </div>

                            {/* Price Adjustment */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Điều chỉnh giá khi gia hạn (%)
                              </Label>
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={renewalPriceAdjustment}
                                  onChange={(e) => setRenewalPriceAdjustment(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="VD: 5"
                                  className="h-10 flex-1"
                                />
                                <div className="h-10 w-16 flex items-center justify-center bg-gray-100 rounded-md text-sm text-gray-600">
                                  %
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                (+) tăng giá, (-) giảm giá, (0) giữ nguyên
                              </p>
                            </div>
                          </div>
                        )}
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
                            <SelectTrigger id="depot-select" className={`h-12 w-full ${!depotId ? 'border-red-300' : 'border-gray-300'}`}>
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
                            id="location-notes-textarea"
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
                    <div id="review-section" className="space-y-6">
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
                            {/* ============ ✅ DISPLAY QUANTITY FOR ALL DEAL TYPES ============ */}
                            <div>
                              <span className="text-gray-500">Số lượng:</span>
                              <p className="font-medium text-blue-600">{saleQuantity} container</p>
                            </div>
                            {/* ============ 🆕 DISPLAY CONTAINER IDs IF PROVIDED ============ */}
                            {showContainerIdSection && containerIds.length > 0 && (
                              <div>
                                <span className="text-gray-500">Container IDs:</span>
                                <p className="font-medium text-green-600">
                                  {containerIds.length} IDs đã nhập
                                </p>
                              </div>
                            )}
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

                        {/* Rental Management Review Card - Chỉ hiển thị khi chọn RENTAL */}
                        {isRentalType(dealType) && (
                          <div className="bg-white border rounded-lg p-4 lg:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-3">Thông tin quản lý cho thuê</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Quantity Management */}
                              <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-700">📦 Quản lý số lượng</p>
                                <div className="ml-4 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Tổng số:</span>
                                    <span className="font-medium">{totalQuantity} container</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Có sẵn:</span>
                                    <span className="font-medium text-green-600">{availableQuantity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Bảo trì:</span>
                                    <span className="font-medium text-orange-600">{maintenanceQuantity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Đang thuê:</span>
                                    <span className="font-medium text-blue-600">{rentedQuantity}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Duration Constraints */}
                              <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-700">⏱️ Thời gian thuê</p>
                                <div className="ml-4 space-y-1">
                                  {minRentalDuration && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Tối thiểu:</span>
                                      <span className="font-medium">{minRentalDuration} {rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit}</span>
                                    </div>
                                  )}
                                  {maxRentalDuration && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Tối đa:</span>
                                      <span className="font-medium">{maxRentalDuration} {rentalUnits.data?.find(ru => ru.code === rentalUnit)?.name || rentalUnit}</span>
                                    </div>
                                  )}
                                  {!minRentalDuration && !maxRentalDuration && (
                                    <p className="text-gray-400 text-xs">Không giới hạn</p>
                                  )}
                                </div>
                              </div>

                              {/* Deposit Policy */}
                              <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-700">💰 Chính sách đặt cọc</p>
                                <div className="ml-4 space-y-1">
                                  {depositRequired ? (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Yêu cầu:</span>
                                        <span className="font-medium text-green-600">Có</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Số tiền:</span>
                                        <span className="font-medium">{depositAmount ? Number(depositAmount).toLocaleString() : '0'} {depositCurrency}</span>
                                      </div>
                                      {lateReturnFeeAmount && lateReturnFeeAmount > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Phí trả muộn:</span>
                                          <span className="font-medium text-red-600">
                                            {Number(lateReturnFeeAmount).toLocaleString()} {depositCurrency}
                                            {lateReturnFeeUnit && ` / ${lateReturnFeeUnit === 'PER_DAY' ? 'ngày' : lateReturnFeeUnit === 'PER_WEEK' ? 'tuần' : '%'}`}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-gray-400 text-xs">Không yêu cầu đặt cọc</p>
                                  )}
                                </div>
                              </div>

                              {/* Availability & Renewal */}
                              <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-700">📅 Thời gian & Gia hạn</p>
                                <div className="ml-4 space-y-1">
                                  {earliestAvailableDate && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Ngày sớm nhất:</span>
                                      <span className="font-medium">{new Date(earliestAvailableDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                  )}
                                  {latestReturnDate && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Ngày trả muộn nhất:</span>
                                      <span className="font-medium">{new Date(latestReturnDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Tự động gia hạn:</span>
                                    <span className={`font-medium ${autoRenewalEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                      {autoRenewalEnabled ? 'Có' : 'Không'}
                                    </span>
                                  </div>
                                  {autoRenewalEnabled && renewalNoticeDays && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Thông báo trước:</span>
                                      <span className="font-medium">{renewalNoticeDays} ngày</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

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

                        {/* ============ 🆕 Container IDs Review Card ============ */}
                        {showContainerIdSection && containerIds.length > 0 && (
                          <div className="bg-white border rounded-lg p-4 lg:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                Danh sách Container IDs ({containerIds.length})
                              </h4>
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Đã hoàn thành
                              </Badge>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                              {/* Header */}
                              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 border-b border-purple-200">
                                <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-700">
                                  <div className="col-span-1">#</div>
                                  <div className="col-span-5">Mã Container</div>
                                  <div className="col-span-4">Hãng tàu</div>
                                  <div className="col-span-2">Năm sản xuất</div>
                                </div>
                              </div>
                              
                              {/* Body */}
                              <div className="max-h-56 overflow-y-auto">
                                {containerIds.map((container, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-12 gap-3 items-center px-4 py-2.5 bg-white border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="col-span-1">
                                      <Badge variant="outline" className="text-xs">
                                        #{index + 1}
                                      </Badge>
                                    </div>
                                    <div className="col-span-5">
                                      <span className="font-mono text-sm font-medium truncate">{container.id}</span>
                                    </div>
                                    <div className="col-span-4">
                                      <span className="text-sm text-cyan-600 font-medium truncate">
                                        {container.shippingLine?.trim() || <span className="text-gray-400 italic">Chưa nhập</span>}
                                      </span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        {container.manufacturedYear || <span className="text-gray-400 italic text-xs">N/A</span>}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                              <Package className="w-4 h-4" />
                              <span>
                                Tổng cộng <strong>{containerIds.length}</strong> container IDs
                                {containerIds.filter(c => c.shippingLine).length > 0 && (
                                  <> • <strong>{containerIds.filter(c => c.shippingLine).length}</strong> đã chọn hãng tàu</>
                                )}
                                {containerIds.filter(c => c.manufacturedYear).length > 0 && (
                                  <> • <strong>{containerIds.filter(c => c.manufacturedYear).length}</strong> có năm sản xuất</>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </div>
                        <span className="text-destructive font-semibold">Có lỗi xảy ra</span>
                      </div>
                      <p className="text-sm text-destructive/90 mt-2 ml-8">{error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-8 border-t-2 border-border">
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
                          className="flex items-center space-x-2 h-11 px-6 rounded-xl border-2 hover:bg-muted font-semibold"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span>Quay lại</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="h-11 px-6 rounded-xl font-semibold hover:bg-muted"
                      >
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
                          className="flex items-center space-x-2 h-11 px-8 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <span>Tiếp tục</span>
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      ) : (
                        <Button 
                          id="submit-listing-button"
                          type="submit" 
                          disabled={submitting} 
                          className="flex items-center space-x-2 h-11 px-8 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-primary/90"
                          onClick={(e) => {
                            console.log('Gửi duyệt button clicked!');
                            setSubmitClicked(true);
                            // Let the form's onSubmit handle the submission
                          }}
                        >
                          {submitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Đang tạo...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 transform transition-all">
            <div className="flex flex-col items-center space-y-8">
              {/* Animated Spinner */}
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>
              
              {/* Progress Text */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-foreground">
                  {submitProgress === 'done' ? 'Hoàn tất! 🎉' : 'Đang xử lý tin đăng...'}
                </h3>
                <p className="text-base text-muted-foreground">
                  {submitProgress === 'done' 
                    ? 'Chuyển hướng đến trang quản lý...' 
                    : 'Vui lòng không tắt trang này'}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="w-full space-y-4 text-sm">
                {/* Step 1: Validation */}
                <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  submitProgress === 'validating' ? 'bg-primary/10 border-2 border-primary' : 'bg-green-50 border-2 border-green-200'
                }`}>
                  {submitProgress === 'validating' ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600" />
                  )}
                  <span className={`font-semibold ${submitProgress === 'validating' ? 'text-primary' : 'text-green-700'}`}>
                    Kiểm tra thông tin
                  </span>
                </div>

                {/* Step 2: Creating */}
                <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  submitProgress === 'validating' ? 'bg-muted/30 border-2 border-border' :
                  submitProgress === 'creating' ? 'bg-primary/10 border-2 border-primary' : 'bg-green-50 border-2 border-green-200'
                }`}>
                  {submitProgress === 'validating' ? (
                    <div className="w-6 h-6 border-2 border-border rounded-full flex-shrink-0"></div>
                  ) : submitProgress === 'creating' ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600" />
                  )}
                  <span className={`font-semibold ${
                    submitProgress === 'validating' ? 'text-muted-foreground' :
                    submitProgress === 'creating' ? 'text-primary' : 'text-green-700'
                  }`}>
                    Tạo tin đăng
                  </span>
                </div>

                {/* Step 3: Uploading */}
                <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  submitProgress === 'validating' || submitProgress === 'creating' ? 'bg-muted/30 border-2 border-border' :
                  submitProgress === 'uploading' ? 'bg-primary/10 border-2 border-primary' : 'bg-green-50 border-2 border-green-200'
                }`}>
                  {submitProgress === 'validating' || submitProgress === 'creating' ? (
                    <div className="w-6 h-6 border-2 border-border rounded-full flex-shrink-0"></div>
                  ) : submitProgress === 'uploading' ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600" />
                  )}
                  <span className={`font-semibold ${
                    submitProgress === 'validating' || submitProgress === 'creating' ? 'text-muted-foreground' :
                    submitProgress === 'uploading' ? 'text-primary' : 'text-green-700'
                  }`}>
                    Đính kèm ảnh và video
                  </span>
                </div>
              </div>

              {/* Success Icon - Show when done */}
              {submitProgress === 'done' && (
                <div className="pt-4 animate-bounce">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-12 h-12 text-white" />
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


