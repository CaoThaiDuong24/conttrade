import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient({
  log: ['query', 'error'],
})

async function testRawSQLApproach() {
  try {
    console.log('=== TESTING RAW SQL APPROACH ===\n')
    
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
    
    console.log(`✅ Will assign ${permissions.length} permissions\n`)
    
    const roleId = role.id
    const permissionIds = permissions.map(p => p.id)
    const scope = 'GLOBAL'
    
    console.log('📝 Starting transaction with RAW SQL...\n')
    
    // Use transaction with raw SQL
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Delete using $executeRawUnsafe
      console.log('  → Deleting old permissions...')
      const deleteCount = await tx.$executeRawUnsafe(
        'DELETE FROM role_permissions WHERE role_id = $1',
        roleId
      )
      console.log(`  ✅ Deleted ${deleteCount} old permissions`)

      // Step 2: Insert using $executeRawUnsafe
      console.log('  → Inserting new permissions...')
      const insertedIds = []
      
      for (const permissionId of permissionIds) {
        const id = randomUUID()
        await tx.$executeRawUnsafe(
          `INSERT INTO role_permissions (id, role_id, permission_id, scope, created_at) 
           VALUES ($1, $2, $3, $4::"PermissionScope", CURRENT_TIMESTAMP)`,
          id,
          roleId,
          permissionId,
          scope
        )
        insertedIds.push(id)
      }
      console.log(`  ✅ Inserted ${insertedIds.length} new permissions`)

      // Step 3: Fetch using Prisma ORM (read works fine)
      console.log('  → Fetching created records...')
      const newAssignments = await tx.role_permissions.findMany({
        where: {
          id: {
            in: insertedIds
          }
        },
        include: {
          permissions: {
            select: {
              code: true,
              name: true
            }
          }
        }
      })
      console.log(`  ✅ Fetched ${newAssignments.length} records`)

      return newAssignments
    })
    
    console.log(`\n✅ TRANSACTION SUCCESS!`)
    console.log(`   Assigned ${result.length} permissions to role ${role.code}\n`)
    
    // Display results
    console.log('📊 Assigned Permissions:')
    result.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.permissions.code} - ${r.permissions.name}`)
    })
    
    // Final verification
    const verify = await prisma.role_permissions.count({
      where: { role_id: roleId }
    })
    
    console.log(`\n✅ Final verification: ${verify} total permissions for ${role.code}`)
    console.log(`\n🎉 ALL TESTS PASSED! RAW SQL APPROACH WORKS!`)
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    if (error.code) console.error('Error code:', error.code)
    if (error.meta) console.error('Meta:', error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

testRawSQLApproach()
