# 🧪 HƯỚNG DẪN TEST SECURITY - QUOTE CREATION

## 📌 Mục đích
Kiểm tra logic bảo mật để đảm bảo:
- Người bán không được tạo RFQ trên tin của chính họ
- Người mua không được tạo báo giá cho RFQ của chính họ

---

## 🚀 CÁCH 1: Chạy file test tự động

```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy test script
node test-quote-security.mjs
```

### Kết quả mong đợi:

```
🔐 TESTING QUOTE SECURITY

1️⃣  Login as Buyer...
✅ Buyer logged in successfully

2️⃣  Login as Seller...
✅ Seller logged in successfully

3️⃣  Test Case 1: Buyer creates RFQ on Seller's listing
   Expected: ✅ SUCCESS
   ✅ PASS: Buyer can create RFQ on seller's listing

4️⃣  Test Case 2: Seller creates quote for Buyer's RFQ
   Expected: ✅ SUCCESS
   ✅ PASS: Seller can create quote for buyer's RFQ

5️⃣  Test Case 3: Buyer tries to create quote for their OWN RFQ
   Expected: ❌ FAIL with "Cannot create quote for your own RFQ"
   ✅ PASS: Security check working! Buyer blocked from creating quote
   Error message: "Cannot create quote for your own RFQ"

6️⃣  Test Case 4: Seller tries to create RFQ on their OWN listing
   Expected: ❌ FAIL with "Cannot create RFQ for your own listing"
   ✅ PASS: Security check working! Seller blocked from creating RFQ
   Error message: "Cannot create RFQ for your own listing"
```

---

## 🧪 CÁCH 2: Test thủ công bằng PowerShell

### Bước 1: Login as Buyer
```powershell
$buyerLogin = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"buyer@example.com","password":"buyer123"}' -UseBasicParsing
$buyerData = $buyerLogin.Content | ConvertFrom-Json
$buyerToken = $buyerData.data.token
Write-Host "Buyer Token: $buyerToken"
```

### Bước 2: Login as Seller
```powershell
$sellerLogin = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"seller@example.com","password":"seller123"}' -UseBasicParsing
$sellerData = $sellerLogin.Content | ConvertFrom-Json
$sellerToken = $sellerData.data.token
Write-Host "Seller Token: $sellerToken"
```

### Bước 3: Lấy listing của Seller
```powershell
$listings = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/listings?status=ACTIVE' -Method GET -Headers @{'Authorization'="Bearer $sellerToken"} -UseBasicParsing
$listingsData = $listings.Content | ConvertFrom-Json
$listingId = $listingsData.data.listings[0].id
Write-Host "Listing ID: $listingId"
```

### Bước 4: Buyer tạo RFQ (SHOULD WORK ✅)
```powershell
$rfq = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/rfqs' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $buyerToken"} -Body "{`"listing_id`":`"$listingId`",`"purpose`":`"purchase`",`"quantity`":1}" -UseBasicParsing
$rfqData = $rfq.Content | ConvertFrom-Json
$rfqId = $rfqData.data.rfq.id
Write-Host "RFQ ID: $rfqId"
Write-Host "Status: $($rfqData.success) - Message: $($rfqData.message)"
```

### Bước 5: Seller tạo Quote (SHOULD WORK ✅)
```powershell
$quote = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/quotes' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $sellerToken"} -Body "{`"rfq_id`":`"$rfqId`",`"total`":10000,`"currency`":`"VND`",`"valid_days`":7}" -UseBasicParsing
$quoteData = $quote.Content | ConvertFrom-Json
Write-Host "Quote created by Seller:"
Write-Host "Status: $($quoteData.success) - Message: $($quoteData.message)"
```

### Bước 6: Buyer tạo Quote cho RFQ của chính họ (SHOULD FAIL ❌)
```powershell
try {
    $buyerQuote = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/quotes' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $buyerToken"} -Body "{`"rfq_id`":`"$rfqId`",`"total`":10000,`"currency`":`"VND`",`"valid_days`":7}" -UseBasicParsing -ErrorAction Stop
    $buyerQuoteData = $buyerQuote.Content | ConvertFrom-Json
    Write-Host "❌ SECURITY ISSUE: Buyer can create quote!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message -like "*Cannot create quote for your own RFQ*") {
        Write-Host "✅ PASS: Security check working!" -ForegroundColor Green
        Write-Host "Error message: $($errorResponse.message)"
    } else {
        Write-Host "⚠️ Different error: $($errorResponse.message)" -ForegroundColor Yellow
    }
}
```

### Bước 7: Seller tạo RFQ trên listing của chính họ (SHOULD FAIL ❌)
```powershell
try {
    $sellerRfq = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/rfqs' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $sellerToken"} -Body "{`"listing_id`":`"$listingId`",`"purpose`":`"purchase`",`"quantity`":1}" -UseBasicParsing -ErrorAction Stop
    $sellerRfqData = $sellerRfq.Content | ConvertFrom-Json
    Write-Host "❌ SECURITY ISSUE: Seller can create RFQ on own listing!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message -like "*Cannot create RFQ for your own listing*") {
        Write-Host "✅ PASS: Security check working!" -ForegroundColor Green
        Write-Host "Error message: $($errorResponse.message)"
    } else {
        Write-Host "⚠️ Different error: $($errorResponse.message)" -ForegroundColor Yellow
    }
}
```

---

## 📊 Kết quả mong đợi

| Test Case | Hành động | Kết quả mong đợi | HTTP Code |
|-----------|-----------|------------------|-----------|
| 1 | Buyer tạo RFQ trên Seller's listing | ✅ Thành công | 200/201 |
| 2 | Seller tạo Quote cho Buyer's RFQ | ✅ Thành công | 200/201 |
| 3 | **Buyer tạo Quote cho RFQ của chính họ** | ❌ **Bị chặn** | **403** |
| 4 | **Seller tạo RFQ trên listing của chính họ** | ❌ **Bị chặn** | **400** |

---

## ✅ Kết luận

Nếu tất cả test cases pass, hệ thống đã có đầy đủ security checks:
- ✅ Ngăn Seller tạo RFQ trên tin của chính họ
- ✅ Ngăn Buyer tạo Quote cho RFQ của chính họ

---

**Ngày:** 28/10/2025
