# ISO 6346 Test Cases

## Mã container HỢP LỆ ✅

```
ABCU1234560
MSKU9876543
MAEU2468135
CSLU5555551
TEMU7777774
HLCU3692581
TCLU9999998
CMAU1111116
OOLU8642097
COSU4567893
```

## Mã container KHÔNG HỢP LỆ ❌

### Lỗi độ dài
```
ABC123456      → Chỉ 9 ký tự (thiếu 2)
ABCU12345      → Chỉ 9 ký tự (thiếu 2)
ABCU12345678   → 12 ký tự (thừa 1)
```

### Lỗi Equipment Category ID (vị trí 4)
```
ABCA1234560    → 'A' không phải U/J/Z
ABCB1234560    → 'B' không phải U/J/Z
ABCC1234560    → 'C' không phải U/J/Z
ABC11234560    → '1' không phải chữ cái
```

### Lỗi Owner Code (3 ký tự đầu)
```
1BCU1234560    → Bắt đầu bằng số
AB2U1234560    → Có số ở vị trí 3
A2CU1234560    → Có số ở vị trí 2
```

### Lỗi Serial Number (6 ký tự giữa)
```
ABCUA23456     → Có chữ cái trong serial
ABCU12345A     → Có chữ cái trong serial
ABCU12X456     → Có chữ cái trong serial
```

### Lỗi Check Digit (ký tự cuối)
```
ABCU1234569    → Check digit sai (đúng phải là 0)
MSKU9876542    → Check digit sai (đúng phải là 3)
MAEU2468136    → Check digit sai (đúng phải là 5)
```

### Lỗi format chữ thường
```
abcu1234560    → Phải viết HOA (hệ thống tự chuyển)
Abcu1234560    → Phải viết HOA (hệ thống tự chuyển)
ABCU1234560    → ✅ Đúng
```

### Lỗi có khoảng trắng
```
ABCU 1234560   → Có khoảng trắng (hệ thống tự xóa)
ABCU123456 0   → Có khoảng trắng (hệ thống tự xóa)
 ABCU1234560   → Có khoảng trắng đầu (hệ thống tự xóa)
```

## Test Scenarios

### Scenario 1: Nhập thủ công
1. Nhập: `ABCU1234560` → ✅ Thành công
2. Nhập: `abcu1234560` → ✅ Tự động chuyển thành `ABCU1234560`
3. Nhập: `ABCU123456` → ❌ "Mã container phải có 11 ký tự"
4. Nhập: `ABCA1234560` → ❌ "Format không đúng ISO 6346"
5. Nhập: `ABCU1234569` → ❌ "Số kiểm tra không đúng"

### Scenario 2: Import từ file TXT
**File: valid-containers.txt**
```
ABCU1234560
MSKU9876543
MAEU2468135
```
→ ✅ Import thành công 3 mã

**File: mixed-containers.txt**
```
ABCU1234560
INVALID123
MSKU9876543
ABC123
```
→ ✅ Import 2 mã hợp lệ, bỏ qua 2 mã không hợp lệ
→ 🔔 Hiển thị chi tiết lỗi

### Scenario 3: Import từ file CSV
**File: containers.csv**
```csv
Container_ID,Description,Notes
ABCU1234560,20ft Standard,Good
MSKU9876543,40ft HC,Excellent
INVALID,Test,Bad
```
→ ✅ Import 2 mã hợp lệ, bỏ qua header và dòng lỗi
→ 🔔 Hiển thị chi tiết lỗi

## Expected Error Messages

| Lỗi | Thông báo |
|-----|-----------|
| Độ dài sai | "Mã container phải có 11 ký tự (hiện tại: X)" |
| Format sai | "Format không đúng ISO 6346: phải có 3 chữ cái + U/J/Z + 6 số + 1 số kiểm tra" |
| Check digit sai | "Số kiểm tra không đúng. Mong đợi: X, nhận được: Y" |
| Trùng lặp | "ID container đã tồn tại" |
| Đủ số lượng | "Đã đủ X container ID" |

## Performance Test

- ✅ Validate 1 mã: < 10ms
- ✅ Validate 100 mã: < 500ms
- ✅ Import file 1000 mã: < 3s

## Integration Test

### API Request
```json
{
  "dealType": "SALE",
  "title": "Container 20ft Standard",
  "containerIds": [
    "ABCU1234560",
    "MSKU9876543",
    "MAEU2468135"
  ]
}
```

### API Response (Success)
```json
{
  "success": true,
  "data": {
    "listing": {
      "id": 123,
      "containerIds": ["ABCU1234560", "MSKU9876543", "MAEU2468135"]
    }
  }
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Error message announcements
- ✅ Focus management
