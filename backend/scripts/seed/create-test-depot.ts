// Create test depot for testing
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createTestDepot() {
  try {
    // Check if depot already exists
    const existingDepot = await prisma.depots.findFirst({
      where: { code: 'TEST_DEPOT' }
    });
    
    if (existingDepot) {
      console.log('Test depot already exists:', existingDepot.id);
      return existingDepot.id;
    }
    
    // Create depot
    const depotId = randomUUID();
    const depot = await prisma.depots.create({
      data: {
        id: depotId,
        name: 'Test Depot',
        code: 'TEST_DEPOT',
        address: '123 Test Street',
        province: 'Ho Chi Minh',
        city: 'Ho Chi Minh City',
        capacity_teu: 1000,
        status: 'ACTIVE',
        updated_at: new Date()
      }
    });
    
    console.log('Test depot created successfully:');
    console.log('Depot ID:', depot.id);
    console.log('Depot Code:', depot.code);
    console.log('Depot Name:', depot.name);
    
    return depot.id;
    
  } catch (error) {
    console.error('Error creating test depot:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

createTestDepot();