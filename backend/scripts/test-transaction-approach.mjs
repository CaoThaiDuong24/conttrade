import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient({
  log: ['query', 'error'],
})

async function testTransactionApproach() {
  try {
    console.log('=== TESTING TRANSACTION APPROACH ===\n')
    
    // Get a test role
    const role = await prisma.roles.findFirst({
      orderBy: { level: 'desc' }
    })
    
    console.log(`✅ Testing with role: ${role.code} (${role.name})`)
    
    // Get some test permissions
    const permissions = await prisma.permissions.findMany({
      take: 5,
      orderBy: { code: 'asc' }
    })
    
    console.log(`✅ Will assign ${permissions.length} permissions`)
    
    const roleId = role.id
    const permissionIds = permissions.map(p => p.id)
    const scope = 'GLOBAL'
    
    console.log('\n📝 Starting transaction...\n')
    
    // Use transaction approach (same as in the API)
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Get existing role_permissions to delete
      const existingPerms = await tx.role_permissions.findMany({
        where: { role_id: roleId },
        select: { id: true }
      })
      
      console.log(`  → Found ${existingPerms.length} existing permissions to delete`)

      // Step 2: Delete them one by one
      for (const perm of existingPerms) {
        await tx.role_permissions.delete({
          where: { id: perm.id }
        })
      }
      
      console.log(`  ✅ Deleted ${existingPerms.length} old permissions`)

      // Step 3: Create new assignments
      const newAssignments = []
      
      for (const permissionId of permissionIds) {
        const id = randomUUID()
        const assignment = await tx.role_permissions.create({
          data: {
            id,
            role_id: roleId,
            permission_id: permissionId,
            scope
          },
          include: {
            permissions: true
          }
        })
        newAssignments.push(assignment)
      }
      
      console.log(`  ✅ Created ${newAssignments.length} new permissions`)

      return newAssignments
    })
    
    console.log(`\n✅ TRANSACTION SUCCESS!`)
    console.log(`   Assigned ${result.length} permissions to role ${role.code}`)
    
    // Verify
    const verify = await prisma.role_permissions.findMany({
      where: { role_id: roleId },
      include: {
        permissions: {
          select: { code: true, name: true }
        }
      }
    })
    
    console.log(`\n📊 Verification:`)
    console.log(`   Total permissions for ${role.code}: ${verify.length}`)
    verify.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.permissions.code} - ${v.permissions.name}`)
    })
    
    console.log(`\n✅ ALL TESTS PASSED!`)
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error('Details:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTransactionApproach()
