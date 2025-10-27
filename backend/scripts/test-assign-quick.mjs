#!/usr/bin/env node

/**
 * Quick test of role-permissions assignment after Prisma regeneration
 */

async function testAssignment() {
  console.log('🧪 Testing role-permissions assignment endpoint\n')

  // Login
  const loginRes = await fetch('http://localhost:3006/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@i-contexchange.vn',
      password: 'admin123'
    })
  })

  const loginData = await loginRes.json()
  const token = loginData.data.accessToken
  console.log('✅ Logged in\n')

  // Get first role
  const rolesRes = await fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const rolesData = await rolesRes.json()
  const roleId = rolesData.data[0].id
  console.log(`📋 Testing with role: ${rolesData.data[0].name} (${roleId})\n`)

  // Get permissions
  const permsRes = await fetch('http://localhost:3006/api/v1/admin/rbac/permissions', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const permsData = await permsRes.json()
  const permissionIds = permsData.data.slice(0, 5).map(p => p.id)
  console.log(`📝 Assigning ${permissionIds.length} permissions\n`)

  // Test assignment
  const assignRes = await fetch('http://localhost:3006/api/v1/admin/rbac/role-permissions/assign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roleId,
      permissionIds,
      scope: 'GLOBAL'
    })
  })

  console.log(`Response: ${assignRes.status} ${assignRes.statusText}`)
  const assignData = await assignRes.json()
  console.log('Response data:', JSON.stringify(assignData, null, 2))

  if (assignData.success) {
    console.log('\n✅ TEST PASSED! Assignment successful!')
  } else {
    console.log('\n❌ TEST FAILED!')
    console.log('Error:', assignData.error || assignData.message)
  }
}

testAssignment().catch(console.error)
