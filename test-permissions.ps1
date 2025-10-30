$response = Invoke-RestMethod -Uri "http://localhost:3006/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"buyer@example.com","password":"buyer123"}'

Write-Host "`n=== BUYER PERMISSIONS TEST ===" -ForegroundColor Cyan
Write-Host "Email: $($response.data.user.email)"
Write-Host "Roles: $($response.data.user.roles -join ', ')"
Write-Host "Permissions Count: $($response.data.user.permissions.Count)" -ForegroundColor Yellow

if ($response.data.user.permissions.Count -gt 0) {
    Write-Host "`n✅ ALL PERMISSIONS:" -ForegroundColor Green
    $response.data.user.permissions | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host "`n🎯 LISTINGS PERMISSIONS:" -ForegroundColor Cyan
    $listingPerms = $response.data.user.permissions | Where-Object {$_ -match '^PM-0(10|11|12|13|14)$'}
    if ($listingPerms) {
        $listingPerms | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
        Write-Host "`n🎉 SUCCESS! Buyer has Listings permissions!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ No listing permissions found" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ NO PERMISSIONS IN JWT!" -ForegroundColor Red
}
