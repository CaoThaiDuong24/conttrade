import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function testRolePermissionCreate() {
  try {
    console.log('=== TEST CREATING ROLE_PERMISSIONS ===\n')
    
    // 1. Get a test role
    const role = await prisma.roles.findFirst({
      orderBy: { level: 'desc' }
    })
    
    if (!role) {
      console.error('❌ Không tìm thấy role nào')
      return
    }
    
    console.log('✅ Found role:', role.id, '-', role.name)
    
    // 2. Get some test permissions
    const permissions = await prisma.permissions.findMany({
      take: 3,
      orderBy: { code: 'asc' }
    })
    
    console.log(`✅ Found ${permissions.length} permissions`)
    permissions.forEach(p => console.log(`   - ${p.code}: ${p.name}`))
    
    // 3. Clear existing permissions for this role
    const deleted = await prisma.role_permissions.deleteMany({
      where: { role_id: role.id }
    })
    console.log(`\n✅ Deleted ${deleted.count} existing role_permissions`)
    
    // 4. Try to create new role_permissions
    console.log('\n📝 Attempting to create new role_permissions...\n')
    
    const assignments = []
    for (const permission of permissions) {
      const id = randomUUID()
      console.log(`Creating: ${id}`)
      console.log(`  role_id: ${role.id}`)
      console.log(`  permission_id: ${permission.id}`)
      console.log(`  scope: GLOBAL`)
      
      try {
        const assignment = await prisma.role_permissions.create({
          data: {
            id,
            role_id: role.id,
            permission_id: permission.id,
            scope: 'GLOBAL'
          }
        })
        console.log('✅ Created successfully!')
        assignments.push(assignment)
      } catch (error) {
        console.error('❌ Error creating role_permission:', error.message)
        console.error('Full error:', error)
        throw error
      }
    }
    
    console.log(`\n✅ Successfully created ${assignments.length} role_permissions`)
    
    // 5. Verify
    const verify = await prisma.role_permissions.findMany({
      where: { role_id: role.id }
    })
    console.log(`\n✅ Verification: Found ${verify.length} role_permissions for role ${role.code}`)
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRolePermissionCreate()
