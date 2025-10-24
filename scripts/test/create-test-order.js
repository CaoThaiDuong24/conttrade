#!/usr/bin/env node

/**
 * Create test order directly in database for testing delivery API
 */

const { PrismaClient } = require('./backend/node_modules/@prisma/client');

async function createTestOrder() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Creating test order in database...\n');
    
    // Get test user
    const user = await prisma.users.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`✅ Found test user: ${user.email}`);
    
    // Create test order
    const order = await prisma.orders.create({
      data: {
        id: 'test-order-' + Date.now(),
        buyer_id: user.id,
        seller_id: user.id, // Same user for testing
        status: 'PAID',
        subtotal: 1000000,
        tax: 100000,
        fees: 0,
        total: 1100000,
        order_number: 'TEST-' + Date.now(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Created test order: ${order.id}`);
    console.log('Order details:', {
      id: order.id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      status: order.status,
      total: order.total
    });
    
    return order.id;
    
  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
