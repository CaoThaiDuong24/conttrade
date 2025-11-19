import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findOriginalRentalDuration() {
  const order = await prisma.orders.findFirst({
    where: {
      order_number: 'ORD-1763372676782-RQH6P'
    }
  });
  
  console.log('\n📋 ORDER INFO:');
  console.log('Order ID:', order.id);
  console.log('Listing ID:', order.listing_id);
  console.log('Current rental_duration_months:', order.rental_duration_months);
  console.log('Created at:', order.created_at.toLocaleString());
  
  // Kiểm tra RFQ liên quan
  const rfqs = await prisma.rfqs.findMany({
    where: {
      listing_id: order.listing_id,
      buyer_user_id: order.buyer_user_id
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5
  });
  
  console.log('\n📝 RELATED RFQs:');
  rfqs.forEach((rfq, idx) => {
    console.log(`\n${idx + 1}. RFQ #${rfq.id.substring(0, 8)}...`);
    console.log(`   Status: ${rfq.status}`);
    console.log(`   Deal Type: ${rfq.deal_type}`);
    console.log(`   Rental Duration: ${rfq.rental_duration_months} month(s)`);
    console.log(`   Created: ${rfq.created_at.toLocaleString()}`);
  });
  
  // Kiểm tra cart items
  const cartItems = await prisma.cart_items.findMany({
    where: {
      listing_id: order.listing_id
    },
    orderBy: {
      added_at: 'desc'
    },
    take: 5
  });
  
  console.log('\n🛒 RELATED CART ITEMS:');
  cartItems.forEach((item, idx) => {
    console.log(`\n${idx + 1}. Cart Item #${item.id.substring(0, 8)}...`);
    console.log(`   Deal Type: ${item.deal_type}`);
    console.log(`   Rental Duration: ${item.rental_duration_months} month(s)`);
    console.log(`   Added at: ${item.added_at.toLocaleString()}`);
  });
  
  await prisma.$disconnect();
}

findOriginalRentalDuration().catch(console.error);
