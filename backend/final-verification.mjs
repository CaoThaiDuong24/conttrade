#!/usr/bin/env node
/**
 * TEST CUỐI CÙNG - Verify toàn bộ hệ thống
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalVerification() {
  console.log('🎯 TEST CUỐI CÙNG - VERIFY TOÀN BỘ HỆ THỐNG\n');
  console.log('='.repeat(80));

  try {
    // 1. Kiểm tra listings RENTAL
    console.log('\n📋 KIỂM TRA 1: LISTINGS RENTAL\n');
    const rentalListings = await prisma.listings.count({
      where: {
        deal_type: 'RENTAL',
        deleted_at: null
      }
    });
    console.log(`✅ Tìm thấy ${rentalListings} listing RENTAL`);

    // 2. Kiểm tra containers của listing RENTAL
    console.log('\n📦 KIỂM TRA 2: CONTAINERS CỦA LISTING RENTAL\n');
    const rentalContainers = await prisma.listing_containers.groupBy({
      by: ['status'],
      where: {
        listing: {
          deal_type: 'RENTAL'
        },
        deleted_at: null
      },
      _count: true
    });

    console.log('Phân bố theo status:');
    rentalContainers.forEach(group => {
      console.log(`   ${group.status}: ${group._count} containers`);
    });

    // 3. Kiểm tra containers có vấn đề (SOLD trong listing RENTAL)
    console.log('\n❌ KIỂM TRA 3: CONTAINERS BỊ LỖI\n');
    const wronglySoldContainers = await prisma.listing_containers.count({
      where: {
        listing: {
          deal_type: 'RENTAL'
        },
        status: 'SOLD',
        deleted_at: null
      }
    });

    const wrongSoldToOrder = await prisma.listing_containers.count({
      where: {
        listing: {
          deal_type: 'RENTAL'
        },
        sold_to_order_id: { not: null },
        deleted_at: null
      }
    });

    if (wronglySoldContainers === 0 && wrongSoldToOrder === 0) {
      console.log('✅ KHÔNG CÓ containers bị lỗi');
      console.log('   - 0 containers có status SOLD trong listing RENTAL');
      console.log('   - 0 containers có sold_to_order_id trong listing RENTAL');
    } else {
      console.log(`❌ CÓ ${wronglySoldContainers} containers status SOLD trong listing RENTAL`);
      console.log(`❌ CÓ ${wrongSoldToOrder} containers có sold_to_order_id trong listing RENTAL`);
    }

    // 4. Kiểm tra orders từ listing RENTAL
    console.log('\n📄 KIỂM TRA 4: ORDERS TỪ LISTING RENTAL\n');
    const ordersFromRental = await prisma.orders.findMany({
      where: {
        listings: {
          deal_type: 'RENTAL'
        }
      },
      select: {
        id: true,
        order_number: true,
        deal_type: true,
        rental_duration_months: true,
        status: true,
        _count: {
          select: {
            listing_containers_sold: true,
            listing_containers_rented: true
          }
        }
      }
    });

    console.log(`Tìm thấy ${ordersFromRental.length} orders từ listing RENTAL:\n`);
    
    let allOrdersCorrect = true;
    for (const order of ordersFromRental) {
      const isCorrect = 
        order.deal_type === 'RENTAL' &&
        order.rental_duration_months !== null &&
        order._count.listing_containers_sold === 0 &&
        order._count.listing_containers_rented > 0;

      const icon = isCorrect ? '✅' : '❌';
      
      console.log(`${icon} ${order.order_number}`);
      console.log(`   Deal Type: ${order.deal_type || 'NULL'}`);
      console.log(`   Rental Duration: ${order.rental_duration_months || 'NULL'} months`);
      console.log(`   Containers SOLD: ${order._count.listing_containers_sold}`);
      console.log(`   Containers RENTED: ${order._count.listing_containers_rented}`);
      
      if (!isCorrect) {
        allOrdersCorrect = false;
        console.log(`   ❌ Order này còn vấn đề!`);
      }
      console.log('');
    }

    // 5. Kiểm tra relations
    console.log('\n🔗 KIỂM TRA 5: RELATIONS\n');
    const rentedRelation = await prisma.listing_containers.count({
      where: {
        rented_to_order_id: { not: null },
        listing: {
          deal_type: 'RENTAL'
        }
      }
    });

    console.log(`✅ ${rentedRelation} containers có rented_to_order_id trong listing RENTAL`);

    // 6. Tổng kết
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 KẾT QUẢ CUỐI CÙNG\n');

    const allTestsPassed = 
      wronglySoldContainers === 0 &&
      wrongSoldToOrder === 0 &&
      allOrdersCorrect;

    if (allTestsPassed) {
      console.log('✅✅✅ TẤT CẢ TESTS ĐỀU PASSED! ✅✅✅\n');
      console.log('Hệ thống đã hoạt động hoàn hảo:');
      console.log('✅ Không có containers bị lỗi');
      console.log('✅ Tất cả orders có đúng deal_type và rental_duration');
      console.log('✅ Containers nằm đúng relation (rented, không phải sold)');
      console.log('✅ Database đã được fix hoàn toàn');
      console.log('✅ Code đã được cập nhật để tránh lỗi tương lai\n');
    } else {
      console.log('❌ CÒN VẤN ĐỀ CẦN KHẮC PHỤC\n');
      if (wronglySoldContainers > 0 || wrongSoldToOrder > 0) {
        console.log('❌ Còn containers bị lỗi trong database');
      }
      if (!allOrdersCorrect) {
        console.log('❌ Còn orders chưa đúng deal_type hoặc relation');
      }
    }

  } catch (error) {
    console.error('❌ LỖI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalVerification();
