#!/usr/bin/env node

/**
 * QUICK CHECK - Rental Orders Status
 * 
 * Kiểm tra nhanh xem có đơn RENTAL nào có containers trong sold_to_order_id không
 * 
 * Run: node backend/quick-check-rental.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickCheck() {
  try {
    console.log('🔍 KIỂM TRA NHANH ĐƠN THUÊ');
    console.log('='.repeat(80));
    
    const rentalOrders = await prisma.orders.findMany({
      where: {
        deal_type: 'RENTAL'
      },
      include: {
        listing_containers_sold: {
          select: {
            container_iso_code: true
          }
        },
        listing_containers_rented: {
          select: {
            container_iso_code: true
          }
        }
      }
    });
    
    console.log(`\n📦 Tìm thấy ${rentalOrders.length} đơn hàng RENTAL\n`);
    
    let errorCount = 0;
    let correctCount = 0;
    
    for (const order of rentalOrders) {
      const soldCount = order.listing_containers_sold?.length || 0;
      const rentedCount = order.listing_containers_rented?.length || 0;
      
      if (soldCount > 0 && rentedCount === 0) {
        console.log(`❌ ${order.order_number}:`);
        console.log(`   Containers trong "sold": ${soldCount}`);
        console.log(`   Containers trong "rented": ${rentedCount}`);
        console.log(`   → CẦN FIX!`);
        errorCount++;
      } else if (rentedCount > 0) {
        console.log(`✅ ${order.order_number}:`);
        console.log(`   Containers trong "rented": ${rentedCount}`);
        correctCount++;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 KẾT QUẢ:');
    console.log(`   ✅ Đơn đúng: ${correctCount}`);
    console.log(`   ❌ Đơn sai: ${errorCount}`);
    console.log('='.repeat(80));
    
    if (errorCount > 0) {
      console.log('\n⚠️  CÓ ĐƠN HÀNG CẦN FIX!');
      console.log('   Chạy lệnh: node backend/fix-rental-containers.mjs');
    } else {
      console.log('\n✅ TẤT CẢ ĐƠN HÀNG ĐÃ ĐÚNG!');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
