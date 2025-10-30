# 🔧 Fix: ReferenceError dealType Before Initialization

## 📋 Vấn đề (Problem)

**Lỗi:** `ReferenceError: Cannot access 'dealType' before initialization`

**Vị trí:** `frontend/app/[locale]/sell/new/page.tsx` line 75

**Nguyên nhân:** 
- `useMemo` hook định nghĩa `steps` array (lines 57-75) đang cố gắng sử dụng biến `dealType`
- Nhưng `dealType` state chưa được khai báo (khai báo sau ở line 104)
- JavaScript không cho phép tham chiếu đến biến trước khi nó được khai báo

## ✅ Giải pháp (Solution)

Di chuyển khối code định nghĩa `steps` xuống **SAU** tất cả các state variables.

### Trước khi sửa:

```typescript
export default function NewListingPage() {
  const [step, setStep] = useState<Step>('specs');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ❌ LỖI: Sử dụng dealType trước khi khai báo
  const steps = React.useMemo(() => {
    if (isRentalType(dealType)) { // dealType chưa tồn tại!
      // ...
    }
  }, [dealType]);

  // ... các state khác ...
  
  const [dealType, setDealType] = useState<string>('SALE'); // Khai báo sau!
}
```

### Sau khi sửa:

```typescript
export default function NewListingPage() {
  const [step, setStep] = useState<Step>('specs');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ... load master data ...
  
  // Khai báo TẤT CẢ state variables TRƯỚC
  const [dealType, setDealType] = useState<string>('SALE');
  const [title, setTitle] = useState('');
  // ... các state khác ...
  
  // ✅ ĐÚNG: Sử dụng dealType SAU khi đã khai báo
  const steps = React.useMemo(() => {
    const baseSteps = [
      { key: 'specs' as Step, label: 'Thông số', icon: Package, description: 'Thông tin cơ bản về container' },
      { key: 'media' as Step, label: 'Hình ảnh', icon: Camera, description: 'Upload ảnh và video' },
      { key: 'pricing' as Step, label: 'Giá cả', icon: DollarSign, description: 'Thiết lập giá bán/thuê' },
    ];

    // Chỉ thêm 'rental' step khi chọn RENTAL/LEASE
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
}
```

## 🎯 Kết quả (Result)

✅ **Lỗi đã được fix hoàn toàn**
- `dealType` được khai báo trước khi sử dụng trong `useMemo`
- Dynamic steps vẫn hoạt động bình thường
- SALE/AUCTION: Hiển thị 5 bước (không có rental step)
- RENTAL/LEASE: Hiển thị 6 bước (có rental step)

## 📝 Bài học (Lessons Learned)

### 1. **Thứ tự khai báo quan trọng**
- Trong JavaScript/TypeScript, bạn KHÔNG thể tham chiếu biến trước khi khai báo
- Đặc biệt với `const` và `let`, có "Temporal Dead Zone" (TDZ)

### 2. **React hooks phụ thuộc vào closure**
- `useMemo`, `useEffect`, `useCallback` đều tạo closure
- Closure capture các biến từ scope bên ngoài
- Các biến này phải được khai báo TRƯỚC khi hook được định nghĩa

### 3. **Best practice cho React components**
Thứ tự khuyến nghị:
```typescript
export default function Component() {
  // 1. Router/Toast/Context hooks
  const router = useRouter();
  const { toast } = useToast();
  
  // 2. State variables (useState)
  const [state1, setState1] = useState(...);
  const [state2, setState2] = useState(...);
  
  // 3. Custom hooks sử dụng state
  const { data } = useCustomHook();
  
  // 4. Derived state (useMemo) - phụ thuộc state
  const derivedValue = useMemo(() => {
    return calculateFromState(state1, state2);
  }, [state1, state2]);
  
  // 5. Side effects (useEffect)
  useEffect(() => {
    // ...
  }, [dependencies]);
  
  // 6. Event handlers
  const handleClick = () => { ... };
  
  // 7. JSX return
  return <div>...</div>;
}
```

## 🧪 Testing

Sau khi fix, test các scenarios:

1. **Load trang lần đầu**
   - ✅ Không có lỗi ReferenceError
   - ✅ Hiển thị 5 steps mặc định (SALE)

2. **Chọn RENTAL/LEASE**
   - ✅ Steps tự động thêm "Quản lý" (6 steps)
   - ✅ UI render đúng rental management sections

3. **Chọn lại SALE**
   - ✅ Steps tự động xóa "Quản lý" (5 steps)
   - ✅ Không hiển thị rental sections

4. **Submit form**
   - ✅ Validation hoạt động đúng
   - ✅ API call thành công

## 📌 Related Files

- `frontend/app/[locale]/sell/new/page.tsx` - Main file được sửa
- `frontend/lib/utils/dealType.ts` - isRentalType() helper
- `UX-OPTIMIZATION-DYNAMIC-STEPS.md` - Documentation về dynamic steps

---

**Fixed Date:** 2025-10-30  
**Fixed By:** AI Assistant  
**Status:** ✅ Resolved
