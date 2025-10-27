import fetch from 'node-fetch';

async function testRolesAPI() {
  try {
    console.log('🔐 Step 1: Login...');
    const loginResponse = await fetch('http://localhost:3006/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@i-contexchange.vn',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Token:', token.substring(0, 30) + '...');

    console.log('\n📋 Step 2: Fetch roles...');
    const rolesResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const rolesData = await rolesResponse.json();
    console.log('Roles response:', JSON.stringify(rolesData, null, 2));

    if (rolesData.success) {
      console.log(`\n✅ Found ${rolesData.data.length} roles:`);
      rolesData.data.forEach(role => {
        console.log(`  - ${role.code}: ${role.name} (Level ${role.level}, ${role.permissionCount} perms, ${role.userCount} users)`);
      });
    } else {
      console.error('❌ Failed to fetch roles:', rolesData.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRolesAPI();
