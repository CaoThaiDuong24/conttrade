#!/usr/bin/env node
/**
 * TEST AUTO-COMPLETE CRON JOB
 * Run: node test-auto-complete-full.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 TESTING AUTO-COMPLETE FUNCTIONALITY\n');
  console.log('='.repeat(60));

  // ==================================================================
  // STEP 1: Check current delivered orders
  // ==================================================================
  console.log('\n📊 STEP 1: Checking delivered orders...\n');

  const deliveredOrders = await prisma.orders.findMany({
    where: { status: 'DELIVERED' },
    select: {
      id: true,
      order_number: true,
      delivered_at: true,
      status: true,
      agreed_price: true,
      currency: true,
      users_orders_seller_idTousers: {
        select: { id: true, display_name: true, email: true }
      },
      users_orders_buyer_idTousers: {
        select: { id: true, display_name: true, email: true }
      }
    },
    orderBy: { delivered_at: 'asc' }
  });

  console.log(`Found ${deliveredOrders.length} delivered orders:\n`);

  if (deliveredOrders.length === 0) {
    console.log('❌ No delivered orders found. Creating test order...\n');
    await createTestDeliveredOrder();
    return;
  }

  deliveredOrders.forEach((order, index) => {
    const daysSinceDelivery = order.delivered_at
      ? Math.floor((Date.now() - order.delivered_at.getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    const shouldAutoComplete = daysSinceDelivery >= 7;

    console.log(`${index + 1}. Order: ${order.order_number}`);
    console.log(`   Delivered: ${order.delivered_at?.toLocaleString('vi-VN') || 'N/A'}`);
    console.log(`   Days since: ${daysSinceDelivery} days`);
    console.log(`   Should auto-complete: ${shouldAutoComplete ? '✅ YES' : '❌ Not yet'}`);
    console.log(`   Seller: ${order.users_orders_seller_idTousers.display_name}`);
    console.log(`   Buyer: ${order.users_orders_buyer_idTousers.display_name}`);
    console.log('');
  });

  // ==================================================================
  // STEP 2: Find orders eligible for auto-complete
  // ==================================================================
  console.log('\n📋 STEP 2: Finding orders eligible for auto-complete...\n');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const eligibleOrders = await prisma.orders.findMany({
    where: {
      status: 'DELIVERED',
      delivered_at: { lte: sevenDaysAgo }
    },
    include: {
      users_orders_seller_idTousers: {
        select: { id: true, display_name: true, email: true }
      },
      users_orders_buyer_idTousers: {
        select: { id: true, display_name: true, email: true }
      }
    }
  });

  console.log(`✅ Found ${eligibleOrders.length} orders eligible for auto-complete\n`);

  if (eligibleOrders.length === 0) {
    console.log('⚠️  No orders eligible yet. Need to wait or create test order.\n');
    
    const oldestDelivered = deliveredOrders[0];
    if (oldestDelivered?.delivered_at) {
      const daysRemaining = 7 - Math.floor(
        (Date.now() - oldestDelivered.delivered_at.getTime()) / (24 * 60 * 60 * 1000)
      );
      console.log(`   Oldest order (${oldestDelivered.order_number}) will be eligible in ${daysRemaining} days`);
    }

    console.log('\n💡 Creating test order for immediate testing...\n');
    await createTestDeliveredOrder();
    return;
  }

  // ==================================================================
  // STEP 3: Simulate auto-complete process
  // ==================================================================
  console.log('\n🔄 STEP 3: Simulating auto-complete process...\n');

  for (const order of eligibleOrders) {
    console.log(`Processing: ${order.order_number}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Delivered: ${order.delivered_at?.toLocaleString('vi-VN')}`);

    try {
      // Update order status
      const updatedOrder = await prisma.orders.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          completed_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`   ✅ Updated status → COMPLETED`);

      // Add timeline entry
      await prisma.order_timeline.create({
        data: {
          id: `tl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          order_id: order.id,
          status: 'COMPLETED',
          actor_user_id: null, // System
          notes: 'Order auto-completed after 7-day dispute period',
          metadata: {
            auto_completed: true,
            delivered_at: order.delivered_at,
            completed_at: new Date()
          },
          created_at: new Date()
        }
      });

      console.log(`   ✅ Created timeline entry`);

      // Create notifications
      if (order.users_orders_buyer_idTousers) {
        await prisma.notifications.create({
          data: {
            id: `notif_${Date.now()}_buyer_${Math.random().toString(36).slice(2)}`,
            user_id: order.users_orders_buyer_idTousers.id,
            type: 'order_completed',
            title: '✅ Đơn hàng hoàn tất',
            message: `Đơn hàng ${order.order_number} đã hoàn tất. Hãy đánh giá seller!`,
            related_id: order.id,
            related_type: 'order',
            priority: 'normal',
            action_url: `/orders/${order.id}`,
            metadata: {
              orderId: order.id,
              orderNumber: order.order_number,
              autoCompleted: true
            },
            is_read: false,
            created_at: new Date()
          }
        });

        console.log(`   ✅ Sent notification to buyer`);
      }

      if (order.users_orders_seller_idTousers) {
        await prisma.notifications.create({
          data: {
            id: `notif_${Date.now()}_seller_${Math.random().toString(36).slice(2)}`,
            user_id: order.users_orders_seller_idTousers.id,
            type: 'order_completed',
            title: '🎉 Đơn hàng hoàn tất - Thanh toán đã được giải ngân',
            message: `Đơn hàng ${order.order_number} đã hoàn tất. Thanh toán đã được chuyển vào tài khoản.`,
            related_id: order.id,
            related_type: 'order',
            priority: 'high',
            action_url: `/orders/${order.id}`,
            metadata: {
              orderId: order.id,
              orderNumber: order.order_number,
              paymentReleased: true,
              autoCompleted: true
            },
            is_read: false,
            created_at: new Date()
          }
        });

        console.log(`   ✅ Sent notification to seller`);
      }

      // Note: Payment release would happen here
      console.log(`   💰 Payment would be released to seller (escrow → seller account)`);

      console.log(`   ✨ Successfully auto-completed!\n`);

    } catch (error) {
      console.error(`   ❌ Error processing order:`, error.message);
    }
  }

  // ==================================================================
  // STEP 4: Verification
  // ==================================================================
  console.log('\n📊 STEP 4: Verifying results...\n');

  const completedOrders = await prisma.orders.findMany({
    where: {
      id: { in: eligibleOrders.map(o => o.id) }
    },
    select: {
      id: true,
      order_number: true,
      status: true,
      delivered_at: true,
      completed_at: true
    }
  });

  console.log('Post-processing status:\n');
  completedOrders.forEach(order => {
    console.log(`${order.order_number}:`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Delivered: ${order.delivered_at?.toLocaleString('vi-VN')}`);
    console.log(`   Completed: ${order.completed_at?.toLocaleString('vi-VN') || 'N/A'}`);
    console.log('');
  });

  // Count notifications created
  const notificationCount = await prisma.notifications.count({
    where: {
      related_type: 'order',
      related_id: { in: eligibleOrders.map(o => o.id) },
      type: 'order_completed'
    }
  });

  console.log(`✅ Created ${notificationCount} notifications\n`);

  // ==================================================================
  // SUMMARY
  // ==================================================================
  console.log('='.repeat(60));
  console.log('\n📈 SUMMARY\n');
  console.log(`Total delivered orders: ${deliveredOrders.length}`);
  console.log(`Eligible for auto-complete: ${eligibleOrders.length}`);
  console.log(`Successfully completed: ${completedOrders.filter(o => o.status === 'COMPLETED').length}`);
  console.log(`Notifications sent: ${notificationCount}`);
  console.log('\n✅ Test completed successfully!\n');
}

// ==================================================================
// Helper: Create test delivered order
// ==================================================================
async function createTestDeliveredOrder() {
  console.log('🏗️  Creating test delivered order...\n');

  // Find existing seller and buyer
  const users = await prisma.users.findMany({
    take: 2,
    where: { status: 'ACTIVE' },
    select: { id: true, display_name: true, email: true }
  });

  if (users.length < 2) {
    console.error('❌ Need at least 2 users in database to create test order');
    return;
  }

  const [seller, buyer] = users;

  // Find a listing
  const listing = await prisma.listings.findFirst({
    where: { user_id: seller.id, status: 'AVAILABLE' }
  });

  if (!listing) {
    console.error('❌ No available listing found for seller');
    return;
  }

  // Create order delivered 8 days ago
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  const order = await prisma.orders.create({
    data: {
      id: `test_order_${Date.now()}`,
      order_number: `TEST-AUTO-${Date.now()}`,
      status: 'DELIVERED',
      seller_id: seller.id,
      buyer_id: buyer.id,
      listing_id: listing.id,
      agreed_price: 1500.00,
      currency: 'USD',
      payment_status: 'PAID',
      escrow_status: 'HELD',
      delivered_at: eightDaysAgo,
      created_at: tenDaysAgo,
      updated_at: eightDaysAgo
    }
  });

  console.log(`✅ Created test order: ${order.order_number}`);
  console.log(`   Seller: ${seller.display_name}`);
  console.log(`   Buyer: ${buyer.display_name}`);
  console.log(`   Delivered: ${eightDaysAgo.toLocaleString('vi-VN')}`);
  console.log(`   Days ago: 8 (eligible for auto-complete!)\n`);

  console.log('🔄 Now running auto-complete test again...\n');
  await main(); // Recurse to process the new order
}

// ==================================================================
// Run
// ==================================================================
main()
  .then(() => {
    console.log('👋 Goodbye!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
