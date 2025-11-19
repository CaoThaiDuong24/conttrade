#!/usr/bin/env node
/**
 * Fix RENTAL listing quantities to match container status
 * 
 * Problem: available_quantity và reserved_quantity không đồng bộ với container status
 * Solution: Sync lại từ container status thực tế
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRentalListingQuantities() {
  console.log('🔧 FIX RENTAL LISTING QUANTITIES\n');
  console.log('='.repeat(80));

  try {
    // Find all RENTAL listings
    const rentalListings = await prisma.listings.findMany({
      where: {
        deal_type: 'RENTAL',
        deleted_at: null
      },
      select: {
        id: true,
        title: true,
        total_quantity: true,
        available_quantity: true,
        reserved_quantity: true,
        rented_quantity: true,
        listing_containers: {
          where: { deleted_at: null },
          select: {
            container_iso_code: true,
            status: true
          }
        }
      }
    });

    console.log(`\n📋 Tìm thấy ${rentalListings.length} RENTAL listings\n`);

    for (const listing of rentalListings) {
      console.log('─'.repeat(80));
      console.log(`\n📦 LISTING: ${listing.title}`);
      console.log(`   ID: ${listing.id}`);

      // Count containers by status
      const containersByStatus = listing.listing_containers.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});

      const actualAvailable = containersByStatus['AVAILABLE'] || 0;
      const actualReserved = containersByStatus['RESERVED'] || 0;
      const actualRented = containersByStatus['RENTED'] || 0;
      const actualMaintenance = containersByStatus['MAINTENANCE'] || 0;

      console.log('\n📊 BEFORE:');
      console.log(`   available_quantity: ${listing.available_quantity} (Actual: ${actualAvailable})`);
      console.log(`   reserved_quantity: ${listing.reserved_quantity} (Actual: ${actualReserved})`);
      console.log(`   rented_quantity: ${listing.rented_quantity} (Actual: ${actualRented})`);

      // Check if update needed
      const needsUpdate = 
        listing.available_quantity !== actualAvailable ||
        listing.reserved_quantity !== actualReserved ||
        listing.rented_quantity !== actualRented;

      if (needsUpdate) {
        console.log('\n❌ Phát hiện không đồng bộ! Đang fix...');

        // Update to match actual container status
        await prisma.listings.update({
          where: { id: listing.id },
          data: {
            available_quantity: actualAvailable,
            reserved_quantity: actualReserved,
            rented_quantity: actualRented,
            maintenance_quantity: actualMaintenance,
            updated_at: new Date()
          }
        });

        console.log('\n✅ AFTER:');
        console.log(`   available_quantity: ${actualAvailable}`);
        console.log(`   reserved_quantity: ${actualReserved}`);
        console.log(`   rented_quantity: ${actualRented}`);
        console.log(`   maintenance_quantity: ${actualMaintenance}`);

        // Verify total
        const sum = actualAvailable + actualReserved + actualRented + actualMaintenance;
        console.log(`\n   Verification: ${actualAvailable} + ${actualReserved} + ${actualRented} + ${actualMaintenance} = ${sum}`);
        console.log(`   Total: ${listing.total_quantity}`);
        console.log(`   ${sum === listing.total_quantity ? '✅ BALANCE OK' : '⚠️  BALANCE MISMATCH'}`);

      } else {
        console.log('\n✅ Số lượng đã đồng bộ, không cần fix');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ HOÀN TẤT FIX QUANTITIES\n');

  } catch (error) {
    console.error('❌ LỖI:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixRentalListingQuantities();
