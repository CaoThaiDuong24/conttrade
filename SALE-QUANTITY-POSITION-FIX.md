# ✅ CHỈNH SỬA VỊ TRÍ SỐ LƯỢNG CONTAINER TRONG FORM TẠO LISTINGS

**Ngày thực hiện:** 6/11/2025  
**File thay đổi:** `frontend/app/[locale]/sell/new/page.tsx`

---

## 🎯 VẤN ĐỀ ĐÃ KHẮC PHỤC

### ❌ Trước khi sửa:
- Trường "Số lượng container" được đặt ở **BƯỚC 3 (Giá cả - Pricing)**
- Không hợp lý về mặt logic thông tin
- Không nhất quán với luồng RENTAL (có bước quản lý số lượng riêng)
- Dễ bị bỏ sót vì lẫn trong phần giá cả

### ✅ Sau khi sửa:
- Trường "Số lượng container" được di chuyển về **BƯỚC 1 (Thông số - Specs)**
- Đặt sau phần "Container Specifications" và trước phần "Title/Description"
- Hợp lý về mặt logic: Tất cả thông tin về container (loại + số lượng) ở cùng 1 bước
- Nhất quán với luồng RENTAL (đều có phần quản lý số lượng rõ ràng)

---

## 📝 CHI TIẾT THAY ĐỔI

### 1. **Xóa input số lượng từ Pricing Step (Bước 3)**

**Vị trí cũ:** Trong grid 3 cột của pricing section

```tsx
// ❌ ĐÃ XÓA
{dealType === 'SALE' && (
  <div className="space-y-2">
    <Label>Số lượng container *</Label>
    <Input type="number" min="1" value={saleQuantity} ... />
  </div>
)}
```

**Lý do:** Pricing step chỉ nên tập trung vào giá cả thuần túy (giá, tiền tệ, đơn vị thời gian)

---

### 2. **Thêm input số lượng vào Specs Step (Bước 1)**

**Vị trí mới:** Sau "Container Specifications", trước "Title and Description"

```tsx
// ✅ ĐÃ THÊM - Section độc lập với styling đẹp hơn
{dealType === 'SALE' && (
  <div id="sale-quantity-section" className="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <div className="flex items-center space-x-2 mb-4">
      <Package className="w-5 h-5 text-blue-600" />
      <h3 className="font-semibold text-gray-900">Số lượng tồn kho</h3>
    </div>
    <div className="max-w-md">
      <Label className="text-sm font-medium text-gray-900 mb-2 block">
        Số lượng container có sẵn *
      </Label>
      <div className="relative">
        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="number"
          min="1"
          value={saleQuantity}
          onChange={(e) => setSaleQuantity(e.target.value === '' ? 1 : Math.max(1, Number(e.target.value)))}
          placeholder="VD: 10"
          className={`h-12 pl-10 text-base ${saleQuantity <= 0 ? 'border-red-300' : 'border-gray-300'}`}
          required
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Tổng số container bạn có sẵn để bán. Số lượng này sẽ được hiển thị cho người mua.
      </p>
      {saleQuantity > 0 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              {saleQuantity} container có sẵn
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

**Cải tiến UI:**
- ✅ Section riêng biệt với background xanh dương nhạt
- ✅ Icon Package để nhận diện
- ✅ Tiêu đề rõ ràng: "Số lượng tồn kho"
- ✅ Input lớn hơn (h-12) để dễ nhìn và nhập
- ✅ Hiển thị preview số lượng với badge xanh lá khi nhập > 0
- ✅ Hướng dẫn chi tiết hơn

---

### 3. **Cập nhật Validation Logic**

**Thay đổi:** Di chuyển validation số lượng từ `pricing` sang `specs`

```tsx
// ✅ ĐÃ CẬP NHẬT
const validateStep = (stepKey: Step): boolean => {
  switch (stepKey) {
    case 'specs':
      const hasBasicSpecs = !!(dealType && size && ctype && standard && condition);
      const hasSaleQuantity = dealType === 'SALE' ? saleQuantity > 0 : true; // ✅ Validate ở đây
      return hasBasicSpecs && hasSaleQuantity;
      
    case 'pricing':
      const hasPriceAmount = priceAmount && priceAmount > 0;
      const hasPriceCurrency = !!priceCurrency;
      const hasRentalUnit = !isRentalType(dealType) || !!rentalUnit;
      return !!(hasPriceAmount && hasPriceCurrency && hasRentalUnit); // ✅ Đã xóa validation số lượng
    // ...
  }
};
```

**Kết quả:**
- ✅ User không thể qua bước 1 nếu chưa nhập số lượng container (với loại SALE)
- ✅ Bước 3 chỉ validate giá cả

---

### 4. **Review Step - Giữ nguyên**

Phần review step đã hiển thị số lượng đúng và không cần thay đổi:

```tsx
{/* Review step - Card "Thông tin giao dịch" */}
<div>
  <span className="text-gray-500">Giá:</span>
  <p>...</p>
</div>
{dealType === 'SALE' && (
  <div>
    <span className="text-gray-500">Số lượng:</span>
    <p className="font-medium text-blue-600">{saleQuantity} container</p>
  </div>
)}
```

---

## 🎨 SO SÁNH UI

### Trước:
```
BƯỚC 1: Thông số
├── Loại giao dịch
├── Container Specifications (4 trường)
├── Title & Description
└── [không có số lượng]

BƯỚC 3: Giá cả
├── Giá bán
├── Tiền tệ
└── Số lượng ← ❌ Đặt sai chỗ
```

### Sau:
```
BƯỚC 1: Thông số
├── Loại giao dịch
├── Container Specifications (4 trường)
├── ✅ Số lượng tồn kho (section riêng, chỉ cho SALE)
├── Separator
└── Title & Description

BƯỚC 3: Giá cả
├── Giá bán
├── Tiền tệ
└── [chỉ tập trung vào giá]
```

---

## 📊 LỢI ÍCH

### 1. **Logic hợp lý hơn**
- ✅ Thông số container = Loại + Tình trạng + Số lượng (tất cả ở bước 1)
- ✅ Giá cả = Giá + Tiền tệ + Đơn vị (tất cả ở bước 3)

### 2. **Nhất quán giữa SALE và RENTAL**
- ✅ SALE: Số lượng ở bước 1 (specs)
- ✅ RENTAL: Số lượng ở bước 4 (rental management)
- ✅ Cả 2 đều có section quản lý số lượng rõ ràng

### 3. **UX tốt hơn**
- ✅ Dễ tìm thấy trường số lượng
- ✅ Không bị nhầm lẫn với thông tin giá cả
- ✅ Section riêng biệt với styling nổi bật
- ✅ Preview số lượng trực quan

### 4. **Validation chính xác**
- ✅ Không thể qua bước 1 nếu thiếu số lượng
- ✅ Lỗi hiển thị ngay tại bước nhập liệu

---

## ✅ TRẠNG THÁI

- [x] Xóa input số lượng từ Pricing step (bước 3)
- [x] Thêm section số lượng vào Specs step (bước 1)
- [x] Cập nhật validation logic
- [x] Kiểm tra Review step
- [x] Kiểm tra không có lỗi compile

**Kết quả:** ✅ **HOÀN TẤT** - Không có lỗi, logic đúng, UI đẹp hơn

---

## 🧪 KIỂM TRA

Để kiểm tra thay đổi:

1. Vào trang tạo listings: `/sell/new`
2. Chọn loại giao dịch = **SALE**
3. Kiểm tra **BƯỚC 1**:
   - ✅ Có section "Số lượng tồn kho" sau phần thông số container
   - ✅ Input số lượng với icon, placeholder, validation
   - ✅ Preview badge hiển thị khi nhập số > 0
   - ✅ Không thể next nếu số lượng = 0 hoặc trống
4. Kiểm tra **BƯỚC 3**:
   - ✅ Chỉ có: Giá, Tiền tệ, Preview giá
   - ✅ KHÔNG còn trường số lượng
5. Kiểm tra **BƯỚC REVIEW**:
   - ✅ Hiển thị số lượng trong card "Thông tin giao dịch"
6. Submit và kiểm tra:
   - ✅ API nhận đúng `saleQuantity` từ state
   - ✅ Listing được tạo với số lượng đúng

---

## 📌 LƯU Ý

- Chỉ áp dụng cho loại giao dịch **SALE**
- Loại **RENTAL/LEASE** vẫn có bước riêng để quản lý số lượng chi tiết (bước 4)
- State `saleQuantity` và validation logic vẫn hoạt động bình thường
- Submit logic không thay đổi (vẫn gửi đúng số lượng lên API)
