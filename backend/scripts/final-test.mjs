#!/usr/bin/env node

/**
 * FINAL TEST - Verify role-permissions assignment works
 */

async function finalTest() {
  console.log('🎯 FINAL TEST - Role Permissions Assignment\n')

  // Step 1: Login
  const loginRes = await fetch('http://localhost:3006/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@i-contexchange.vn',
      password: 'admin123'
    })
  })
  const loginData = await loginRes.json()
  
  if (!loginData.success) {
    console.error('❌ Login failed')
    process.exit(1)
  }
  
  const token = loginData.data.accessToken
  console.log('✅ Login successful\n')

  // Step 2: Get roles
  const rolesRes = await fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!rolesRes.ok) {
    console.error('❌ Failed to get roles:', rolesRes.status)
    process.exit(1)
  }
  
  const rolesData = await rolesRes.json()
  const testRole = rolesData.data[0]
  console.log(`✅ Got roles, testing with: ${testRole.name} (${testRole.id})\n`)

  // Step 3: Get permissions
  const permsRes = await fetch('http://localhost:3006/api/v1/admin/rbac/permissions', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const permsData = await permsRes.json()
  const testPermissions = permsData.data.slice(0, 5).map(p => p.id)
  console.log(`✅ Got permissions, using ${testPermissions.length} for test\n`)

  // Step 4: THE CRITICAL TEST - Assign permissions
  console.log('🧪 TESTING ASSIGNMENT ENDPOINT...\n')
  
  const assignRes = await fetch('http://localhost:3006/api/v1/admin/rbac/role-permissions/assign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roleId: testRole.id,
      permissionIds: testPermissions,
      scope: 'GLOBAL'
    })
  })

  console.log(`Response Status: ${assignRes.status} ${assignRes.statusText}\n`)
  
  const assignText = await assignRes.text()
  console.log('Response Body:', assignText, '\n')

  const assignData = JSON.parse(assignText)

  if (assignRes.ok && assignData.success) {
    console.log('✅✅✅ SUCCESS! Assignment worked perfectly! ✅✅✅')
    console.log(`Assigned ${assignData.data.length} permissions to role: ${testRole.name}`)
    console.log('\n🎉 FIX HOÀN TẤT! Permissions can now be saved successfully!')
  } else {
    console.log('❌ TEST FAILED')
    console.log('Error:', assignData.error || assignData.message)
    console.log('Details:', assignData.details || 'N/A')
    process.exit(1)
  }
}

finalTest().catch(err => {
  console.error('❌ Test crashed:', err.message)
  process.exit(1)
})
