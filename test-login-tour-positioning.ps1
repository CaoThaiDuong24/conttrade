# Test Login Tour Positioning
# Script để test và debug positioning của tour

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   TEST LOGIN TOUR POSITIONING" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 DANH SÁCH ELEMENTS CẦN KIỂM TRA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. #email - Email input field" -ForegroundColor White
Write-Host "  2. #password - Password input field" -ForegroundColor White
Write-Host "  3. #remember - Remember me checkbox" -ForegroundColor White
Write-Host "  4. #forgot-password-link - Forgot password link" -ForegroundColor White
Write-Host "  5. #login-submit-button - Login button" -ForegroundColor White
Write-Host "  6. #quick-login-section - Quick login container" -ForegroundColor White
Write-Host "  7. .quick-login-admin - Admin button" -ForegroundColor White
Write-Host "  8. .quick-login-buyer - Buyer button" -ForegroundColor White
Write-Host "  9. .quick-login-seller - Seller button" -ForegroundColor White
Write-Host " 10. .quick-login-manager - Manager button" -ForegroundColor White
Write-Host " 11. #social-login-section - Social login section" -ForegroundColor White
Write-Host " 12. #signup-link - Signup link" -ForegroundColor White
Write-Host ""

Write-Host "🎯 CẤU HÌNH POSITIONING MỚI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  - Email/Password fields: side = 'left', align = 'center'" -ForegroundColor Green
Write-Host "  - Remember/Forgot: side = 'bottom', align = 'start/end'" -ForegroundColor Green
Write-Host "  - Login button: side = 'left', align = 'center'" -ForegroundColor Green
Write-Host "  - Quick login section: side = 'left', align = 'start'" -ForegroundColor Green
Write-Host "  - Role buttons: side = 'bottom', align = 'center'" -ForegroundColor Green
Write-Host "  - Social/Signup: side = 'left', align = 'center'" -ForegroundColor Green
Write-Host ""

Write-Host "⚙️  CẤU HÌNH GLOBAL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  - smoothScroll: false (tắt smooth scroll)" -ForegroundColor Green
Write-Host "  - stagePadding: 10 (khoảng cách highlight)" -ForegroundColor Green
Write-Host "  - popoverOffset: 20 (khoảng cách popover)" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 HƯỚNG DẪN TEST:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Start dev server nếu chưa chạy:" -ForegroundColor White
Write-Host "     cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Mở browser: http://localhost:3000/vi/auth/login" -ForegroundColor White
Write-Host ""
Write-Host "  3. Click nút Help (?) ở góc dưới phải" -ForegroundColor White
Write-Host ""
Write-Host "  4. Kiểm tra từng bước:" -ForegroundColor White
Write-Host "     - Bước 1: Welcome message (center screen) ✓" -ForegroundColor Gray
Write-Host "     - Bước 2: Email field (popover bên TRÁI)" -ForegroundColor Gray
Write-Host "     - Bước 3: Password field (popover bên TRÁI)" -ForegroundColor Gray
Write-Host "     - Bước 4: Remember checkbox (popover bên DƯỚI-TRÁI)" -ForegroundColor Gray
Write-Host "     - Bước 5: Forgot link (popover bên DƯỚI-PHẢI)" -ForegroundColor Gray
Write-Host "     - Bước 6: Login button (popover bên TRÁI)" -ForegroundColor Gray
Write-Host "     - Bước 7: Quick login section (popover bên TRÁI)" -ForegroundColor Gray
Write-Host "     - Bước 8-11: Role buttons (popover bên DƯỚI)" -ForegroundColor Gray
Write-Host "     - Bước 12: Social login (popover bên TRÁI)" -ForegroundColor Gray
Write-Host "     - Bước 13: Signup link (popover bên TRÁI)" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Mở Console (F12) để xem logs:" -ForegroundColor White
Write-Host "     - 🎯 Tour started with X steps" -ForegroundColor Gray
Write-Host "     - Highlighting: [title]" -ForegroundColor Gray
Write-Host "     - ✅ NEXT/PREV/CLOSE button clicked" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 DEBUG TIPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Nếu popover KHÔNG hiển thị đúng vị trí:" -ForegroundColor White
Write-Host ""
Write-Host "  A. Kiểm tra element tồn tại:" -ForegroundColor Cyan
Write-Host "     - Mở Console (F12)" -ForegroundColor White
Write-Host "     - Gõ: document.querySelector('#email')" -ForegroundColor Gray
Write-Host "     - Nếu null → element không tồn tại" -ForegroundColor White
Write-Host ""
Write-Host "  B. Kiểm tra CSS conflicts:" -ForegroundColor Cyan
Write-Host "     - Inspect popover element (F12 → Elements)" -ForegroundColor White
Write-Host "     - Check computed styles của .driver-popover" -ForegroundColor White
Write-Host "     - Xem có CSS nào override position/z-index không" -ForegroundColor White
Write-Host ""
Write-Host "  C. Thử thay đổi 'side' value:" -ForegroundColor Cyan
Write-Host "     - 'left' → 'right'" -ForegroundColor White
Write-Host "     - 'top' → 'bottom'" -ForegroundColor White
Write-Host "     - 'bottom' → 'top'" -ForegroundColor White
Write-Host ""
Write-Host "  D. Điều chỉnh popoverOffset:" -ForegroundColor Cyan
Write-Host "     - Tăng lên: popoverOffset: 30 hoặc 40" -ForegroundColor White
Write-Host "     - Giảm xuống: popoverOffset: 10" -ForegroundColor White
Write-Host ""

Write-Host "📊 EXPECTED BEHAVIOR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✓ Popover hiển thị bên cạnh element được highlight" -ForegroundColor Green
Write-Host "  ✓ Không bị che khuất bởi element khác" -ForegroundColor Green
Write-Host "  ✓ Không bị tràn ra ngoài viewport" -ForegroundColor Green
Write-Host "  ✓ Arrow trỏ đúng vào element" -ForegroundColor Green
Write-Host "  ✓ Buttons (Next, Prev, Close) đều clickable" -ForegroundColor Green
Write-Host "  ✓ Scroll không làm tour biến mất" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 BẮT ĐẦU TEST:" -ForegroundColor Yellow
Write-Host ""
$startServer = Read-Host "Bạn có muốn start dev server không? (y/n)"

if ($startServer -eq 'y' -or $startServer -eq 'Y') {
    Write-Host ""
    Write-Host "Starting dev server..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check if already running
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    if ($port3000) {
        Write-Host "✓ Dev server đã chạy trên port 3000" -ForegroundColor Green
        Write-Host ""
        $openBrowser = Read-Host "Mở browser? (y/n)"
        if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
            Start-Process "http://localhost:3000/vi/auth/login"
        }
    } else {
        Write-Host "Starting dev server..." -ForegroundColor Yellow
        Set-Location -Path ".\frontend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
        Write-Host ""
        Write-Host "⏳ Đợi 10 giây để server khởi động..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Write-Host ""
        Write-Host "✓ Server đã start. Mở browser..." -ForegroundColor Green
        Start-Process "http://localhost:3000/vi/auth/login"
    }
} else {
    Write-Host ""
    Write-Host "OK. Vui lòng start server thủ công:" -ForegroundColor Yellow
    Write-Host "  cd frontend && npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sau đó truy cập: http://localhost:3000/vi/auth/login" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   CHÚC BẠN TEST THÀNH CÔNG!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
