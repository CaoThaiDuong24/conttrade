# Script để push code lên GitHub trước khi deploy

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  PUSH CODE LÊN GITHUB" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra git status
Write-Host "[1/4] Kiểm tra git status..." -ForegroundColor Yellow
git status

Write-Host ""
$confirm = Read-Host "Bạn có muốn commit và push tất cả thay đổi không? (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    
    # Add all files
    Write-Host ""
    Write-Host "[2/4] Thêm tất cả files..." -ForegroundColor Yellow
    git add .
    
    # Commit
    Write-Host ""
    $commitMsg = Read-Host "Nhập commit message (hoặc Enter để dùng mặc định)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Update: Ready for production deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    
    Write-Host "[3/4] Commit với message: $commitMsg" -ForegroundColor Yellow
    git commit -m "$commitMsg"
    
    # Push
    Write-Host ""
    Write-Host "[4/4] Push lên GitHub..." -ForegroundColor Yellow
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ THÀNH CÔNG!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tiếp theo, SSH vào Ubuntu server và chạy:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  wget https://raw.githubusercontent.com/CaoThaiDuong24/conttrade/master/scripts/deployment/ubuntu-deploy.sh" -ForegroundColor White
        Write-Host "  chmod +x ubuntu-deploy.sh" -ForegroundColor White
        Write-Host "  sudo ./ubuntu-deploy.sh" -ForegroundColor White
        Write-Host ""
        Write-Host "Hoặc nếu đã deploy rồi, chỉ cần update:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  cd /var/www/lta" -ForegroundColor White
        Write-Host "  sudo ./scripts/deployment/update-app.sh" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Có lỗi xảy ra khi push!" -ForegroundColor Red
        Write-Host "Vui lòng kiểm tra lại git credentials hoặc network." -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "❌ Đã hủy!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
