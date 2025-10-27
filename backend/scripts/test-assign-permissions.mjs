import fetch from 'node-fetch';

async function testAssignPermissions() {
  try {
    console.log('🧪 TEST: Gán permissions cho role\n');

    // 1. Login as admin
    console.log('1️⃣ Đăng nhập với tài khoản admin...');
    const loginResponse = await fetch('http://localhost:3006/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@i-contexchange.vn',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Đăng nhập thành công\n');

    // 2. Get buyer role
    console.log('2️⃣ Lấy thông tin role "buyer"...');
    const rolesResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const rolesData = await rolesResponse.json();
    const buyerRole = rolesData.data.find(r => r.code === 'buyer');
    
    if (!buyerRole) {
      console.error('❌ Không tìm thấy role "buyer"');
      return;
    }

    console.log(`✅ Role: ${buyerRole.name}`);
    console.log(`   ID: ${buyerRole.id}`);
    console.log(`   Permissions hiện tại: ${buyerRole.permissionCount}\n`);

    // 3. Get all permissions
    console.log('3️⃣ Lấy danh sách permissions...');
    const permsResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/permissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const permsData = await permsResponse.json();
    const allPermissions = permsData.data.all || [];
    
    console.log(`✅ Tổng permissions: ${allPermissions.length}\n`);

    // 4. Test assign (giữ nguyên permissions hiện tại + thêm 1 permission mới nếu có)
    console.log('4️⃣ Test gán permissions...');
    
    const currentPermissionIds = buyerRole.permissions.map(p => p.id);
    const testPermissionIds = currentPermissionIds.slice(0, currentPermissionIds.length); // Giữ nguyên
    
    console.log(`   Permissions để gán: ${testPermissionIds.length}`);
    console.log(`   Role ID: ${buyerRole.id}`);
    console.log(`   Permissions IDs:`, testPermissionIds.slice(0, 3), '...\n');

    const assignResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/role-permissions/assign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roleId: buyerRole.id,
        permissionIds: testPermissionIds,
        scope: 'GLOBAL'
      })
    });

    console.log('📊 Response status:', assignResponse.status);
    console.log('📊 Response status text:', assignResponse.statusText);

    const assignData = await assignResponse.json();
    console.log('\n📦 Response data:');
    console.log(JSON.stringify(assignData, null, 2));

    if (assignData.success) {
      console.log('\n✅ THÀNH CÔNG!');
      console.log(`   Đã gán ${assignData.data.length} permissions cho role "${buyerRole.name}"`);
    } else {
      console.log('\n❌ THẤT BẠI!');
      console.log(`   Lỗi: ${assignData.message}`);
    }

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error(error.stack);
  }
}

testAssignPermissions();
