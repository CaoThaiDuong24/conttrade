// Test login và lấy permissions
const testLogin = async () => {
  try {
    console.log('🔐 Testing login...');
    const response = await fetch('http://localhost:3006/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@i-contexchange.vn',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const token = data.data.token;
      console.log('✅ Login successful!');
      console.log('📋 Token:', token.substring(0, 50) + '...');
      
      // Test get roles
      console.log('\n📊 Testing GET /api/v1/admin/rbac/roles...');
      const rolesResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const rolesData = await rolesResponse.json();
      console.log('Status:', rolesResponse.status);
      console.log('Response:', JSON.stringify(rolesData, null, 2));
      
      if (rolesData.success) {
        console.log(`✅ Found ${rolesData.data.length} roles`);
        rolesData.data.forEach(role => {
          console.log(`  - ${role.code}: ${role.name} (${role.permissionCount} permissions, ${role.userCount} users)`);
        });
      }
      
      // Test get permission matrix
      console.log('\n🔲 Testing GET /api/v1/admin/rbac/permission-matrix...');
      const matrixResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/permission-matrix', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const matrixData = await matrixResponse.json();
      console.log('Status:', matrixResponse.status);
      
      if (matrixData.success) {
        console.log(`✅ Matrix loaded:`);
        console.log(`  - Roles: ${matrixData.data.roles.length}`);
        console.log(`  - Permissions: ${matrixData.data.permissions.length}`);
        console.log(`  - Matrix rows: ${matrixData.data.matrix.length}`);
        
        // Show first 5 permissions
        console.log('\n📝 First 5 permissions:');
        matrixData.data.permissions.slice(0, 5).forEach(p => {
          console.log(`  - ${p.code}: ${p.name} [${p.category || 'N/A'}]`);
        });
      } else {
        console.log('Response:', JSON.stringify(matrixData, null, 2));
      }
    } else {
      console.log('❌ Login failed:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testLogin();
