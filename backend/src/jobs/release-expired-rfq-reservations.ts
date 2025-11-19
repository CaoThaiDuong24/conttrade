// @ts-nocheck
import prisma from '../lib/prisma.js';
import { getRFQReservationService } from '../lib/rfq/rfq-reservation-service.js';

/**
 * Background Job: Auto-release expired RFQ reservations
 * 
 * Schedule: Run every hour
 * Purpose: Release containers that have been reserved for >7 days
 * 
 * Usage:
 * 1. Manually: node --loader ts-node/esm backend/src/jobs/release-expired-rfq-reservations.ts
 * 2. Cron (production): Add to ecosystem.config.js or use node-cron
 */

async function releaseExpiredRFQReservations() {
  console.log('🕐 [Cron Job] Starting auto-release expired RFQ reservations...');
  console.log(`   Current time: ${new Date().toISOString()}`);
  
  try {
    const rfqService = getRFQReservationService(prisma);
    const releasedCount = await rfqService.releaseExpiredReservations();
    
    if (releasedCount > 0) {
      console.log(`✅ [Cron Job] Successfully released ${releasedCount} expired container reservations`);
      
      // Optional: Send notification to admins
      // await NotificationService.notifyAdmins({
      //   type: 'system_maintenance',
      //   message: `Auto-released ${releasedCount} expired RFQ reservations`
      // });
    } else {
      console.log('ℹ️  [Cron Job] No expired reservations found. All good!');
    }
    
    return releasedCount;
  } catch (error: any) {
    console.error('❌ [Cron Job] Failed to release expired reservations:', error);
    throw error;
  } finally {
    // Disconnect to allow process to exit
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  releaseExpiredRFQReservations()
    .then(count => {
      console.log(`\n📊 Job completed. Released ${count} containers.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Job failed:', error);
      process.exit(1);
    });
}

export { releaseExpiredRFQReservations };
