#!/usr/bin/env node
/**
 * Test RBAC API endpoints
 */

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3006/api/v1'

async function login() {
  console.log('🔐 Logging in as admin...')
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@i-contexchange.vn',
      password: 'admin123'
    })
  })
  
  const data = await response.json()
  if (!data.success) {
    throw new Error('Login failed: ' + data.message)
  }
  
  console.log('✅ Login successful')
  return data.data.token
}

async function testRolesAPI(token) {
  console.log('\n📋 Testing GET /admin/rbac/roles...')
  const response = await fetch(`${API_BASE}/admin/rbac/roles`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  
  console.log('Response status:', response.status)
  console.log('Success:', data.success)
  
  if (data.success) {
    console.log(`✅ Found ${data.data.length} roles`)
    console.log('\nRoles:')
    data.data.forEach(role => {
      console.log(`  - ${role.code}: ${role.name} (Level ${role.level})`)
      console.log(`    └ ${role.permissionCount} permissions, ${role.userCount} users`)
    })
  } else {
    console.log('❌ Error:', data.message)
  }
  
  return data
}

async function testPermissionsAPI(token) {
  console.log('\n🔑 Testing GET /admin/rbac/permissions...')
  const response = await fetch(`${API_BASE}/admin/rbac/permissions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  
  if (data.success) {
    console.log(`✅ Found ${data.data.all.length} permissions`)
    console.log('Categories:', Object.keys(data.data.byCategory).join(', '))
  } else {
    console.log('❌ Error:', data.message)
  }
  
  return data
}

async function testMatrixAPI(token) {
  console.log('\n🔲 Testing GET /admin/rbac/permission-matrix...')
  const response = await fetch(`${API_BASE}/admin/rbac/permission-matrix`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  
  if (data.success) {
    console.log(`✅ Matrix loaded:`)
    console.log(`   ${data.data.roles.length} roles × ${data.data.permissions.length} permissions`)
    console.log(`   ${data.data.categories.length} categories`)
  } else {
    console.log('❌ Error:', data.message)
  }
  
  return data
}

async function main() {
  try {
    const token = await login()
    await testRolesAPI(token)
    await testPermissionsAPI(token)
    await testMatrixAPI(token)
    
    console.log('\n✅ All tests completed!')
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

main()
