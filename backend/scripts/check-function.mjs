import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFunction() {
  try {
    const func = await prisma.$queryRaw`
      SELECT pg_get_functiondef('increment_role_version'::regproc) as definition
    `
    console.log('=== FUNCTION increment_role_version ===\n')
    console.log(func[0].definition)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkFunction()
