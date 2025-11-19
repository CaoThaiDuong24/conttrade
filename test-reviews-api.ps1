# Test Reviews API

$userId = "user-seller"
$apiUrl = "http://localhost:3006/api/v1/delivery-reviews/user/${userId}?filter=all&type=all"

Write-Host "Testing API: $apiUrl" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -ContentType "application/json"
    
    Write-Host "`nAPI Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "`nAPI Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.Response.StatusCode
}
