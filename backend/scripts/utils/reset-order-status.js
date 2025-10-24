import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetOrderToReadyForPickup() {
  try {
    const orderId = 'b0a8e8d1-624d-4f38-9cef-419d5ad49be2';
    
    console.log('🔄 Resetting order to READY_FOR_PICKUP for testing...\n');
    
    // Reset order back to READY_FOR_PICKUP
    const updated = await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'READY_FOR_PICKUP',
        updated_at: new Date()
      },
      select: {
        status: true,
        order_number: true,
        updated_at: true
      }
    });
    
    console.log('✅ Order reset successful!');
    console.log(`   Order: ${updated.order_number}`);
    console.log(`   Status: ${updated.status}`);
    console.log(`   Updated At: ${updated.updated_at}`);
    console.log('\n📝 Now you can test the "Bắt đầu vận chuyển" button on the UI!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetOrderToReadyForPickup();
