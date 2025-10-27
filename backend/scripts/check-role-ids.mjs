import prisma from '../src/lib/prisma.js'

async function checkRoles() {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        code: true,
        name: true
      },
      orderBy: { level: 'desc' }
    })
    
    console.log('📋 Roles in database:')
    console.log('ID → Code → Name')
    console.log('─'.repeat(60))
    roles.forEach(role => {
      console.log(`${role.id} → ${role.code} → ${role.name}`)
    })
    
    console.log('\n✅ URLs for each role:')
    roles.forEach(role => {
      console.log(`http://localhost:3000/vi/admin/rbac/roles/${role.id}`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkRoles()
