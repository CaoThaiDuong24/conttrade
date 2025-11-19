// @ts-nocheck
import cron from 'node-cron';
import { releaseExpiredRFQReservations } from './release-expired-rfq-reservations.js';

/**
 * RFQ Reservation Cron Scheduler
 * 
 * Runs background jobs for RFQ reservation management:
 * - Auto-release expired reservations every hour
 * 
 * Usage:
 *   node --loader ts-node/esm backend/src/jobs/rfq-cron-scheduler.ts
 * 
 * Or add to ecosystem.config.js:
 *   {
 *     name: "rfq-cron",
 *     script: "src/jobs/rfq-cron-scheduler.ts",
 *     interpreter: "node",
 *     interpreter_args: "--loader ts-node/esm"
 *   }
 */

console.log('🚀 [RFQ Cron Scheduler] Starting...');
console.log(`   Current time: ${new Date().toISOString()}`);
console.log('   Schedule: Every hour at :00 minutes\n');

// Schedule: Every hour at minute 0
// Cron format: minute hour day month weekday
// "0 * * * *" = At minute 0 of every hour
cron.schedule('0 * * * *', async () => {
  console.log('\n⏰ [Cron Trigger] Running scheduled task...');
  
  try {
    await releaseExpiredRFQReservations();
  } catch (error: any) {
    console.error('❌ [Cron Scheduler] Task failed:', error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh" // Vietnam timezone
});

console.log('✅ [RFQ Cron Scheduler] Active and waiting for next trigger...');
console.log('   Press Ctrl+C to stop\n');

// Keep process alive
process.on('SIGTERM', () => {
  console.log('\n⚠️  [RFQ Cron Scheduler] Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  [RFQ Cron Scheduler] Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});
