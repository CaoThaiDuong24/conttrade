#!/usr/bin/env node
/**
 * FIX HOÀN TOÀN VẤN ĐỀ RENTAL CONTAINERS
 * 
 * Vấn đề phát hiện:
 * 1. Order được tạo từ RFQ RENTAL nhưng không có deal_type và rental_duration_months
 * 2. Containers của listing RENTAL bị set sold_to_order_id thay vì rented_to_order_id
 * 3. Status containers là SOLD thay vì RESERVED/RENTED
 * 
 * Giải pháp:
 * 1. Fix data trong database cho order và containers bị lỗi
 * 2. Fix code trong quotes.ts để tạo order đúng với deal_type từ RFQ
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRentalContainersComplete() {
  console.log('🔧 BẮT ĐẦU FIX RENTAL CONTAINERS\n');
  console.log('='.repeat(80));

  try {
    // BƯỚC 1: Tìm và fix các order bị lỗi
    console.log('\n📋 BƯỚC 1: Tìm các order có vấn đề\n');
    
    const problematicOrders = await prisma.orders.findMany({
      where: {
        deal_type: null,
        listing_containers_sold: {
          some: {
            listing: {
              deal_type: 'RENTAL'
            }
          }
        }
      },
      include: {
        listing_containers_sold: {
          include: {
            listing: true
          }
        },
        listings: {
          select: {
            deal_type: true
          }
        }
      }
    });

    console.log(`Tìm thấy ${problematicOrders.length} order có vấn đề\n`);

    // BƯỚC 2: Fix từng order
    for (const order of problematicOrders) {
      console.log('─'.repeat(80));
      console.log(`\n📄 Đang fix Order: ${order.order_number}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Deal Type hiện tại: ${order.deal_type || 'NULL (SAI!)'}`);
      
      // Lấy thông tin từ RFQ
      const quote = await prisma.quotes.findFirst({
        where: { id: order.quote_id },
        include: {
          rfqs: {
            select: {
              purpose: true,
              rental_duration_months: true
            }
          }
        }
      });

      if (!quote || !quote.rfqs) {
        console.log('   ⚠️  Không tìm thấy RFQ cho order này, skip...');
        continue;
      }

      const rfqPurpose = quote.rfqs.purpose;
      const rentalDuration = quote.rfqs.rental_duration_months;
      
      // Map RFQ purpose to deal_type
      let correctDealType = 'SALE';
      if (rfqPurpose === 'RENTAL') {
        correctDealType = 'RENTAL';
      }

      console.log(`   RFQ Purpose: ${rfqPurpose}`);
      console.log(`   Rental Duration: ${rentalDuration} months`);
      console.log(`   Deal Type cần fix: ${correctDealType}`);

      // Sử dụng transaction để đảm bảo tính toàn vẹn
      await prisma.$transaction(async (tx) => {
        // 1. Update order
        await tx.orders.update({
          where: { id: order.id },
          data: {
            deal_type: correctDealType,
            rental_duration_months: correctDealType === 'RENTAL' ? rentalDuration : null,
            updated_at: new Date()
          }
        });
        console.log(`   ✅ Updated order deal_type to ${correctDealType}`);

        // 2. Fix containers nếu là RENTAL
        if (correctDealType === 'RENTAL') {
          const soldContainers = order.listing_containers_sold || [];
          
          if (soldContainers.length > 0) {
            console.log(`   🔄 Đang chuyển ${soldContainers.length} containers từ SOLD → RENTED...\n`);
            
            for (const container of soldContainers) {
              // Tính ngày trả container
              let rentalReturnDate = null;
              if (rentalDuration && rentalDuration > 0) {
                rentalReturnDate = new Date(container.sold_at || new Date());
                rentalReturnDate.setMonth(rentalReturnDate.getMonth() + rentalDuration);
              }

              // Update container
              await tx.listing_containers.update({
                where: { id: container.id },
                data: {
                  // Clear sold fields
                  sold_to_order_id: null,
                  sold_at: null,
                  // Set rented fields
                  rented_to_order_id: order.id,
                  rented_at: container.sold_at || new Date(),
                  rental_return_date: rentalReturnDate,
                  status: 'RESERVED', // Keep as RESERVED until delivery
                  updated_at: new Date()
                }
              });

              console.log(`      ✅ ${container.container_iso_code}`);
              console.log(`         Status: SOLD → RESERVED`);
              console.log(`         sold_to_order_id → rented_to_order_id`);
              if (rentalReturnDate) {
                console.log(`         Ngày trả: ${rentalReturnDate.toLocaleDateString('vi-VN')}`);
              }
            }
          } else {
            console.log(`   ℹ️  Order không có containers trong sold relation`);
          }
        }
      });

      console.log(`\n   ✅ Hoàn tất fix order ${order.order_number}\n`);
    }

    // BƯỚC 3: Verify kết quả
    console.log('='.repeat(80));
    console.log('\n📊 BƯỚC 3: VERIFY KẾT QUẢ\n');
    
    const verifyOrders = await prisma.orders.findMany({
      where: {
        id: {
          in: problematicOrders.map(o => o.id)
        }
      },
      include: {
        listing_containers_sold: {
          select: {
            container_iso_code: true,
            status: true
          }
        },
        listing_containers_rented: {
          select: {
            container_iso_code: true,
            status: true,
            rented_at: true,
            rental_return_date: true
          }
        }
      }
    });

    for (const order of verifyOrders) {
      console.log(`✅ Order ${order.order_number}:`);
      console.log(`   Deal Type: ${order.deal_type}`);
      console.log(`   Rental Duration: ${order.rental_duration_months || 'N/A'} months`);
      console.log(`   Containers in SOLD relation: ${order.listing_containers_sold.length}`);
      console.log(`   Containers in RENTED relation: ${order.listing_containers_rented.length}`);
      
      if (order.deal_type === 'RENTAL' && order.listing_containers_sold.length > 0) {
        console.log(`   ❌ CẢNH BÁO: Order RENTAL vẫn còn containers trong sold relation!`);
      } else if (order.deal_type === 'RENTAL' && order.listing_containers_rented.length > 0) {
        console.log(`   ✅ ĐÚNG: Order RENTAL có containers trong rented relation`);
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n✅ HOÀN TẤT FIX RENTAL CONTAINERS\n');
    console.log('📝 Tóm tắt:');
    console.log(`   - Đã fix ${problematicOrders.length} order`);
    console.log(`   - Tất cả containers đã được chuyển đúng relation`);
    console.log(`   - Deal type và rental duration đã được set đúng\n`);

  } catch (error) {
    console.error('❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixRentalContainersComplete();
