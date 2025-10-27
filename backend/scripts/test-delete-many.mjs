import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testDeleteMany() {
  try {
    console.log('=== TESTING deleteMany ===\n')
    
    // First, get a role that has permissions
    const roleWithPerms = await prisma.role_permissions.findFirst({
      select: {
        role_id: true,
        roles: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    })
    
    if (!roleWithPerms) {
      console.log('No role_permissions found')
      return
    }
    
    console.log('Found role:', roleWithPerms.roles.code)
    console.log('Role ID:', roleWithPerms.role_id)
    
    // Count current permissions for this role
    const countBefore = await prisma.role_permissions.count({
      where: { role_id: roleWithPerms.role_id }
    })
    console.log(`\nCurrent permissions for this role: ${countBefore}`)
    
    // Try deleteMany
    console.log(`\nAttempting deleteMany...`)
    const result = await prisma.role_permissions.deleteMany({
      where: { role_id: roleWithPerms.role_id }
    })
    console.log(`✅ Deleted ${result.count} records`)
    
    // Verify
    const countAfter = await prisma.role_permissions.count({
      where: { role_id: roleWithPerms.role_id }
    })
    console.log(`After delete: ${countAfter} permissions remain`)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Code:', error.code)
    console.error('Meta:', error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

testDeleteMany()
