#!/usr/bin/env node

/**
 * Test the role-permissions/assign endpoint directly
 */

async function testEndpoint() {
  console.log('🧪 Testing /api/v1/admin/rbac/role-permissions/assign endpoint\n')

  // Step 1: Login to get token
  console.log('📝 Step 1: Login as admin...')
  const loginResponse = await fetch('http://localhost:3006/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@i-contexchange.vn',
      password: 'admin123'
    })
  })

  const loginData = await loginResponse.json()
  console.log('Login response:', JSON.stringify(loginData, null, 2))
  
  if (!loginData.success || !loginData.data || !loginData.data.accessToken) {
    console.error('❌ Login failed:', loginData)
    process.exit(1)
  }

  const token = loginData.data.accessToken
  console.log('✅ Login successful, token:', token.substring(0, 20) + '...\n')

  // Step 2: Get first role ID
  console.log('📝 Step 2: Getting roles...')
  const rolesResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/roles', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const rolesData = await rolesResponse.json()
  const roleId = rolesData.data[0].id
  const roleName = rolesData.data[0].name
  console.log(`✅ Using role: ${roleName} (${roleId})\n`)

  // Step 3: Get permissions
  console.log('📝 Step 3: Getting permissions...')
  const permsResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/permissions', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const permsData = await permsResponse.json()
  const permissionIds = permsData.data.slice(0, 3).map(p => p.id)
  console.log(`✅ Using ${permissionIds.length} permissions:`, permissionIds, '\n')

  // Step 4: Test assign endpoint
  console.log('📝 Step 4: Calling /role-permissions/assign...')
  
  const assignPayload = {
    roleId: roleId,
    permissionIds: permissionIds,
    scope: 'GLOBAL'
  }
  
  console.log('Request payload:', JSON.stringify(assignPayload, null, 2))
  
  const assignResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/role-permissions/assign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(assignPayload)
  })

  console.log(`\nResponse Status: ${assignResponse.status} ${assignResponse.statusText}`)
  
  const responseText = await assignResponse.text()
  console.log('\nResponse Body:')
  console.log(responseText)

  try {
    const responseData = JSON.parse(responseText)
    
    if (assignResponse.ok) {
      console.log('\n✅ TEST PASSED - Assignment successful!')
    } else {
      console.log('\n❌ TEST FAILED - Server returned error')
      console.log('Error details:', responseData)
    }
  } catch (e) {
    console.log('\n❌ Could not parse response as JSON')
  }
}

testEndpoint().catch(console.error)
