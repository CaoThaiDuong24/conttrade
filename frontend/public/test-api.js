// Quick test API with curl
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from localStorage

fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ API Response:', data);
  if (data.success) {
    console.log(`Found ${data.data.length} roles`);
    data.data.forEach(role => {
      console.log(`  - ${role.code}: ${role.name} (${role.permissionCount} perms, ${role.userCount} users)`);
    });
  } else {
    console.error('❌ Error:', data.message);
  }
})
.catch(err => console.error('❌ Fetch error:', err));
