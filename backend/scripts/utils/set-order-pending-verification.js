import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: [] });

(async () => {
  try {
    console.log('\n🔄 Updating order to PAYMENT_PENDING_VERIFICATION...\n');
    
    // Update the order by ID
    const order = await prisma.orders.update({
      where: { id: '72682c91-7499-4f0c-85a6-b2f78a75dbcd' },
      data: { 
        status: 'PAYMENT_PENDING_VERIFICATION',
        payment_verified_at: null
      }
    });
    
    // Update payment to PENDING
    await prisma.payments.updateMany({
      where: { order_id: order.id },
      data: { 
        status: 'PENDING',
        verified_at: null,
        verified_by: null
      }
    });
    
    console.log('✅ Order updated successfully!');
    console.log(`   Order: ${order.order_number}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: ${order.total} ${order.currency}`);
    console.log('\n💡 Now refresh the order detail page to see the alert!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
