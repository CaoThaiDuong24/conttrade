import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExistingOrder() {
  try {
    const orderId = '8841cf40-7703-487f-85a0-01ee5c155064'; // Order gần nhất
    
    console.log('🔧 Migrating existing order to link containers...\n');
    console.log(`Order ID: ${orderId}\n`);
    
    // 1. Get order with RFQ data
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        quotes: {
          include: {
            rfqs: {
              select: {
                id: true,
                listing_id: true,
                selected_container_ids: true
              }
            }
          }
        },
        listings: {
          select: {
            id: true,
            deal_type: true
          }
        }
      }
    });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    if (!order.quotes || !order.quotes.rfqs) {
      console.log('❌ Order has no linked RFQ');
      return;
    }
    
    const rfq = order.quotes.rfqs;
    const selectedContainerIds = rfq.selected_container_ids || [];
    
    console.log(`RFQ ID: ${rfq.id}`);
    console.log(`Listing ID: ${rfq.listing_id || order.listing_id || 'N/A'}`);
    console.log(`Selected Containers: ${selectedContainerIds.length}`);
    console.log(`Container IDs: ${selectedContainerIds.join(', ')}\n`);
    
    if (selectedContainerIds.length === 0) {
      console.log('❌ RFQ has no selected containers');
      return;
    }
    
    const listingId = rfq.listing_id || order.listing_id;
    if (!listingId) {
      console.log('❌ No listing_id found');
      return;
    }
    
    // 2. Get listing deal type
    const listing = order.listings || await prisma.listings.findUnique({
      where: { id: listingId },
      select: { deal_type: true }
    });
    
    if (!listing) {
      console.log('❌ Listing not found');
      return;
    }
    
    console.log(`Deal Type: ${listing.deal_type}\n`);
    
    // 3. Update containers
    console.log('🔄 Updating containers...\n');
    
    if (listing.deal_type === 'SALE') {
      const result = await prisma.listing_containers.updateMany({
        where: {
          listing_id: listingId,
          container_iso_code: { in: selectedContainerIds },
          status: 'AVAILABLE'
        },
        data: {
          status: 'SOLD',
          sold_to_order_id: orderId,
          sold_at: order.created_at,
          updated_at: new Date()
        }
      });
      
      console.log(`✅ Updated ${result.count} containers to SOLD status`);
    } else if (listing.deal_type === 'RENTAL') {
      const result = await prisma.listing_containers.updateMany({
        where: {
          listing_id: listingId,
          container_iso_code: { in: selectedContainerIds },
          status: 'AVAILABLE'
        },
        data: {
          status: 'RENTED',
          rented_to_order_id: orderId,
          rented_at: order.created_at,
          updated_at: new Date()
        }
      });
      
      console.log(`✅ Updated ${result.count} containers to RENTED status`);
    }
    
    // 4. Verify the update
    console.log('\n🔍 Verifying update...\n');
    
    const updatedOrder = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        listing_containers_sold: {
          select: {
            id: true,
            container_iso_code: true,
            status: true,
            sold_at: true
          }
        },
        listing_containers_rented: {
          select: {
            id: true,
            container_iso_code: true,
            status: true,
            rented_at: true
          }
        }
      }
    });
    
    const totalContainers = 
      (updatedOrder.listing_containers_sold?.length || 0) + 
      (updatedOrder.listing_containers_rented?.length || 0);
    
    console.log(`Order now has ${totalContainers} linked containers:`);
    
    if (updatedOrder.listing_containers_sold && updatedOrder.listing_containers_sold.length > 0) {
      console.log(`\nSOLD (${updatedOrder.listing_containers_sold.length}):`);
      updatedOrder.listing_containers_sold.forEach((c, idx) => {
        console.log(`${idx + 1}. ${c.container_iso_code} - ${c.status} - ${c.sold_at ? new Date(c.sold_at).toLocaleString('vi-VN') : 'N/A'}`);
      });
    }
    
    if (updatedOrder.listing_containers_rented && updatedOrder.listing_containers_rented.length > 0) {
      console.log(`\nRENTED (${updatedOrder.listing_containers_rented.length}):`);
      updatedOrder.listing_containers_rented.forEach((c, idx) => {
        console.log(`${idx + 1}. ${c.container_iso_code} - ${c.status} - ${c.rented_at ? new Date(c.rented_at).toLocaleString('vi-VN') : 'N/A'}`);
      });
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`\n💡 Now you can view this order in the frontend and see the containers list.`);
    console.log(`Order URL: /orders/${orderId}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingOrder();
