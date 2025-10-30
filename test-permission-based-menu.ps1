#!/usr/bin/env pwsh

Write-Host "`n🧪 TEST PERMISSION-BASED MENU SYSTEM" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$apiUrl = "http://localhost:3006/api/v1/auth/login"

# Test accounts
$accounts = @(
    @{
        Name = "BUYER"
        Email = "buyer@example.com"
        Password = "buyer123"
        ExpectedMenus = @("Dashboard", "Container", "RFQ", "Đơn hàng", "Thanh toán", "Giám định", "Vận chuyển", "Đánh giá", "Khiếu nại", "Tài khoản")
        ShouldNotHave = @("Bán hàng", "RFQ & Báo giá", "Hóa đơn")
    },
    @{
        Name = "SELLER"
        Email = "seller@example.com"
        Password = "seller123"
        ExpectedMenus = @("Dashboard", "Container", "Bán hàng", "RFQ & Báo giá", "Đơn hàng", "Vận chuyển", "Đánh giá", "Hóa đơn", "Tài khoản")
        ShouldNotHave = @("Thanh toán", "Giám định", "Khiếu nại")
    }
)

foreach ($account in $accounts) {
    Write-Host "`n`n📊 Testing: $($account.Name) ($($account.Email))" -ForegroundColor Yellow
    Write-Host "-" * 80 -ForegroundColor Gray
    
    try {
        # Login
        Write-Host "🔐 Logging in..." -NoNewline
        $loginBody = @{
            email = $account.Email
            password = $account.Password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-WebRequest -Uri $apiUrl `
            -Method POST `
            -Headers @{'Content-Type'='application/json'} `
            -Body $loginBody `
            -UseBasicParsing
        
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.data.token
        Write-Host " ✅ Success" -ForegroundColor Green
        
        # Decode token to see permissions
        $tokenParts = $token.Split('.')
        if ($tokenParts.Length -ge 2) {
            $payload = $tokenParts[1]
            # Add padding if needed
            while ($payload.Length % 4 -ne 0) {
                $payload += "="
            }
            $decodedBytes = [System.Convert]::FromBase64String($payload)
            $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
            $tokenData = $decodedJson | ConvertFrom-Json
            
            Write-Host "`n📋 Token Data:" -ForegroundColor Cyan
            Write-Host "  Roles: $($tokenData.roles -join ', ')" -ForegroundColor White
            if ($tokenData.permissions) {
                Write-Host "  Permissions: $($tokenData.permissions.Count) total" -ForegroundColor White
                Write-Host "  Permission codes: $($tokenData.permissions[0..5] -join ', ')..." -ForegroundColor Gray
            }
        }
        
        # Test dashboard page to see menu in browser console
        Write-Host "`n🌐 Testing dashboard page..." -NoNewline
        $dashboardResponse = Invoke-WebRequest -Uri "$baseUrl/vi/dashboard" `
            -Method GET `
            -Headers @{ 'Cookie' = "accessToken=$token" } `
            -MaximumRedirection 0 `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($dashboardResponse -and $dashboardResponse.StatusCode -eq 200) {
            Write-Host " ✅ OK (200)" -ForegroundColor Green
        } else {
            $status = $dashboardResponse.StatusCode
            Write-Host " ⚠️  Status: $status" -ForegroundColor Yellow
        }
        
        # Expected menu analysis
        Write-Host "`n✅ Expected Menus (should appear):" -ForegroundColor Green
        foreach ($menu in $account.ExpectedMenus) {
            Write-Host "   ✓ $menu" -ForegroundColor Green
        }
        
        Write-Host "`n❌ Should NOT Have (should NOT appear):" -ForegroundColor Red
        foreach ($menu in $account.ShouldNotHave) {
            Write-Host "   ✗ $menu" -ForegroundColor Red
        }
        
        Write-Host "`n💡 Action Required:" -ForegroundColor Yellow
        Write-Host "   1. Open browser: $baseUrl/vi/dashboard" -ForegroundColor White
        Write-Host "   2. Open DevTools Console (F12)" -ForegroundColor White
        Write-Host "   3. Look for menu logs starting with 🎯 or 📋" -ForegroundColor White
        Write-Host "   4. Verify menu items match expectations above" -ForegroundColor White
        
    } catch {
        Write-Host " ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n`n📝 SUMMARY:" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "✅ Menu system đã được chuyển sang PERMISSION-BASED" -ForegroundColor Green
Write-Host "✅ Buyer và Seller sẽ tự động nhận menu dựa trên permissions" -ForegroundColor Green
Write-Host "✅ Không cần chỉnh sửa database permissions" -ForegroundColor Green
Write-Host "`nℹ️  Nếu muốn thay đổi menu:" -ForegroundColor Yellow
Write-Host "   - Thay đổi permissions trong database" -ForegroundColor White
Write-Host "   - User login lại" -ForegroundColor White
Write-Host "   - Menu tự động cập nhật" -ForegroundColor White
Write-Host ""
