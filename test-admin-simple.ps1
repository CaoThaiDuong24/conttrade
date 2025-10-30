# Test admin login
Write-Host "Testing admin login..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
        Write-Host "SUCCESS: Admin logged in" -ForegroundColor Green
        Write-Host "Token: $($data.data.token.Substring(0,50))..." -ForegroundColor Gray
        
        # Test RBAC endpoint
        Write-Host "`nTesting RBAC endpoint..." -ForegroundColor Cyan
        $rbacResponse = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/admin/rbac/roles" `
            -Method GET `
            -Headers @{
                'Authorization' = "Bearer $($data.data.token)"
                'Content-Type' = 'application/json'
            } `
            -UseBasicParsing
        
        Write-Host "RBAC Status: $($rbacResponse.StatusCode)" -ForegroundColor Green
        
    } else {
        Write-Host "FAILED: $($data.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
}
