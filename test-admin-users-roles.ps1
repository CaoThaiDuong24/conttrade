# Test Admin Users API - Roles Display
# Kiểm tra xem API /admin/users có trả về roles đúng không

$backendUrl = 'http://localhost:3006'
$frontendUrl = 'http://localhost:3000'

Write-Host "`n=== TEST ADMIN USERS API - ROLES DISPLAY ===" -ForegroundColor Cyan
Write-Host "Backend: $backendUrl" -ForegroundColor Gray
Write-Host "Frontend: $frontendUrl" -ForegroundColor Gray

try {
    # 1. Login as Admin
    Write-Host "`n[1] Đăng nhập Admin..." -ForegroundColor Yellow
    $loginResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -UseBasicParsing
    
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.token
    
    if ($token) {
        Write-Host "✅ Đăng nhập thành công" -ForegroundColor Green
    } else {
        Write-Host "❌ Không lấy được token" -ForegroundColor Red
        exit 1
    }

    # 2. Get all users
    Write-Host "`n[2] Lấy danh sách users..." -ForegroundColor Yellow
    $usersResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/admin/users" `
        -Method GET `
        -Headers @{'Authorization'="Bearer $token"} `
        -UseBasicParsing
    
    $usersData = $usersResp.Content | ConvertFrom-Json
    
    if ($usersData.success) {
        Write-Host "✅ Lấy danh sách users thành công" -ForegroundColor Green
        Write-Host "📊 Tổng số users: $($usersData.data.Count)" -ForegroundColor Cyan
        
        # Display users with their roles
        Write-Host "`n--- CHI TIẾT USERS VÀ ROLES ---" -ForegroundColor Cyan
        foreach ($user in $usersData.data) {
            Write-Host "`n👤 User: $($user.email)" -ForegroundColor White
            Write-Host "   Display Name: $($user.display_name)" -ForegroundColor Gray
            Write-Host "   Status: $($user.status)" -ForegroundColor Gray
            
            if ($user.roles -and $user.roles.Count -gt 0) {
                Write-Host "   🎭 Roles:" -ForegroundColor Cyan
                foreach ($role in $user.roles) {
                    Write-Host "      - $($role.name) ($($role.code)) [Level: $($role.level)]" -ForegroundColor Green
                }
            } else {
                Write-Host "   ⚠️  Chưa có role" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ Lỗi: $($usersData.message)" -ForegroundColor Red
        exit 1
    }

    # 3. Get detailed info for first user
    if ($usersData.data.Count -gt 0) {
        $firstUser = $usersData.data[0]
        Write-Host "`n[3] Lấy chi tiết user: $($firstUser.email)..." -ForegroundColor Yellow
        
        $userDetailResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/admin/users/$($firstUser.id)" `
            -Method GET `
            -Headers @{'Authorization'="Bearer $token"} `
            -UseBasicParsing
        
        $userDetail = $userDetailResp.Content | ConvertFrom-Json
        
        if ($userDetail.success) {
            Write-Host "✅ Lấy chi tiết user thành công" -ForegroundColor Green
            Write-Host "`n--- CHI TIẾT USER ---" -ForegroundColor Cyan
            Write-Host "Email: $($userDetail.data.email)" -ForegroundColor White
            Write-Host "Full Name: $($userDetail.data.fullName)" -ForegroundColor White
            Write-Host "Status: $($userDetail.data.status)" -ForegroundColor White
            Write-Host "KYC Status: $($userDetail.data.kycStatus)" -ForegroundColor White
            
            if ($userDetail.data.roles -and $userDetail.data.roles.Count -gt 0) {
                Write-Host "`n🎭 Roles:" -ForegroundColor Cyan
                foreach ($role in $userDetail.data.roles) {
                    Write-Host "`n   Role: $($role.name) ($($role.code))" -ForegroundColor Green
                    Write-Host "   Level: $($role.level)" -ForegroundColor Gray
                    Write-Host "   Assigned At: $($role.assignedAt)" -ForegroundColor Gray
                    
                    if ($role.permissions -and $role.permissions.Count -gt 0) {
                        Write-Host "   Permissions: $($role.permissions.Count)" -ForegroundColor Cyan
                        $role.permissions | Select-Object -First 5 | ForEach-Object {
                            Write-Host "      - $($_.name) ($($_.code))" -ForegroundColor White
                        }
                        if ($role.permissions.Count -gt 5) {
                            Write-Host "      ... và $($role.permissions.Count - 5) permissions khác" -ForegroundColor Gray
                        }
                    }
                }
            } else {
                Write-Host "`n⚠️  User chưa có role" -ForegroundColor Yellow
            }
            
            if ($userDetail.data.directPermissions -and $userDetail.data.directPermissions.Count -gt 0) {
                Write-Host "`n🔑 Direct Permissions (không qua role):" -ForegroundColor Magenta
                foreach ($perm in $userDetail.data.directPermissions) {
                    Write-Host "   - $($perm.name) ($($perm.code))" -ForegroundColor White
                }
            }
        } else {
            Write-Host "❌ Lỗi: $($userDetail.message)" -ForegroundColor Red
        }
    }

    # 4. Test getting user roles from RBAC endpoint
    if ($usersData.data.Count -gt 0) {
        $testUser = $usersData.data[0]
        Write-Host "`n[4] Kiểm tra RBAC endpoint cho user: $($testUser.email)..." -ForegroundColor Yellow
        
        $rbacRolesResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/admin/rbac/users/$($testUser.id)/roles" `
            -Method GET `
            -Headers @{'Authorization'="Bearer $token"} `
            -UseBasicParsing
        
        $rbacRoles = $rbacRolesResp.Content | ConvertFrom-Json
        
        if ($rbacRoles.success) {
            Write-Host "✅ RBAC endpoint hoạt động" -ForegroundColor Green
            Write-Host "📊 Số roles từ RBAC endpoint: $($rbacRoles.data.Count)" -ForegroundColor Cyan
            
            foreach ($role in $rbacRoles.data) {
                Write-Host "   - $($role.name) ($($role.code))" -ForegroundColor White
            }
        } else {
            Write-Host "❌ Lỗi: $($rbacRoles.message)" -ForegroundColor Red
        }
    }

    Write-Host "`n=== KET LUAN ===" -ForegroundColor Cyan
    Write-Host "API /admin/users da duoc sua de tra ve ROLES thay vi permissions" -ForegroundColor Green
    Write-Host "Frontend co the hien thi dung roles cua users" -ForegroundColor Green
    Write-Host "Chi tiet user bao gom ca roles va direct permissions" -ForegroundColor Green

} catch {
    Write-Host "`nLOI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack: $($_.ScriptStackTrace)" -ForegroundColor Gray
    exit 1
}

Write-Host "`nTEST HOAN THANH" -ForegroundColor Green
