#!/usr/bin/env node

/**
 * Verify Prisma Client can access role_permissions with correct field names
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Verifying Prisma Client...\n')

  try {
    // Test 1: Check database columns
    const cols = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'role_permissions' 
      ORDER BY ordinal_position
    `
    console.log('✅ Database columns:', cols.map(c => c.column_name).join(', '))

    // Test 2: Count role_permissions
    const count = await prisma.role_permissions.count()
    console.log(`✅ Can count role_permissions: ${count} records`)

    // Test 3: Try deleteMany with role_id
    console.log('\n🧪 Testing deleteMany with role_id field...')
    const testRoleId = '00000000-0000-0000-0000-000000000000' // fake UUID
    
    // This should NOT throw error even if no records match
    await prisma.role_permissions.deleteMany({
      where: { role_id: testRoleId }
    })
    console.log('✅ deleteMany with role_id works!')

    // Test 4: Try create with role_id and permission_id
    console.log('\n🧪 Testing create with role_id and permission_id...')
    const testPermId = '00000000-0000-0000-0000-000000000001'
    
    try {
      await prisma.role_permissions.create({
        data: {
          id: '00000000-0000-0000-0000-000000000099',
          role_id: testRoleId,
          permission_id: testPermId,
          scope: 'GLOBAL'
        }
      })
      console.log('✅ create with role_id/permission_id works!')
      
      // Cleanup
      await prisma.role_permissions.delete({
        where: { id: '00000000-0000-0000-0000-000000000099' }
      })
    } catch (e) {
      if (e.code === 'P2003') {
        console.log('✅ create syntax correct (foreign key constraint expected)')
      } else {
        throw e
      }
    }

    console.log('\n✅ ALL TESTS PASSED! Prisma Client is working correctly.\n')
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED!')
    console.error('Error:', error.message)
    console.error('\nDetails:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
