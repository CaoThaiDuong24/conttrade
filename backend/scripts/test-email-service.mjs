/**
 * TEST EMAIL SERVICE
 * Test script để verify email configuration
 * 
 * Usage:
 *   node backend/scripts/test-email-service.mjs
 * 
 * Requirements:
 *   1. SENDGRID_API_KEY phải được set trong .env
 *   2. EMAIL_FROM phải được verify trong SendGrid
 */

import { EmailService } from '../src/lib/notifications/notification-service.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

console.log('📂 Loading .env from:', envPath);
dotenv.config({ path: envPath });

/**
 * Test Cases
 */
async function testEmailService() {
  console.log('\n🧪 TESTING EMAIL SERVICE\n');
  console.log('=' .repeat(60));

  // Check configuration
  console.log('\n1️⃣  Configuration Check:');
  console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');
  console.log('   EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'ContTrade Platform');

  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
    console.log('\n⚠️  WARNING: SendGrid not configured!');
    console.log('   Emails will be logged to console only (DEV mode)');
    console.log('\n   To enable real emails:');
    console.log('   1. Sign up at https://sendgrid.com (FREE tier available)');
    console.log('   2. Get API key from https://app.sendgrid.com/settings/api_keys');
    console.log('   3. Add to .env: SENDGRID_API_KEY=SG.xxxxx');
    console.log('   4. Verify sender email in SendGrid dashboard');
    console.log('\n');
  }

  // Test 1: Simple email
  console.log('\n2️⃣  Test Simple Email:');
  console.log('=' .repeat(60));
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  const result1 = await EmailService.sendEmail({
    to: testEmail,
    subject: '✅ Test Email - ContTrade Platform',
    html: `
      <h1>Test Email</h1>
      <p>This is a test email from ContTrade platform.</p>
      <p>If you received this, email service is working! 🎉</p>
    `,
    priority: 'normal'
  });

  console.log('   Result:', result1 ? '✅ Success' : '❌ Failed');

  // Test 2: Rental Contract Created Email (Real template)
  console.log('\n3️⃣  Test Rental Contract Email:');
  console.log('=' .repeat(60));
  
  const result2 = await EmailService.sendRentalContractCreated({
    buyerEmail: testEmail,
    buyerName: 'Nguyễn Văn A',
    contractNumber: 'RC-2025-001',
    startDate: '14/11/2025',
    endDate: '14/05/2026',
    rentalPrice: 10000000,
    currency: 'VND',
    containerDetails: '40FT HC Container - ABCU1234567'
  });

  console.log('   Result:', result2 ? '✅ Success' : '❌ Failed');

  // Test 3: Payment Reminder Email
  console.log('\n4️⃣  Test Payment Reminder Email:');
  console.log('=' .repeat(60));
  
  const result3 = await EmailService.sendPaymentReminder({
    buyerEmail: testEmail,
    buyerName: 'Nguyễn Văn A',
    contractNumber: 'RC-2025-001',
    paymentDueDate: '20/11/2025',
    amount: 10000000,
    currency: 'VND',
    daysUntilDue: 3
  });

  console.log('   Result:', result3 ? '✅ Success' : '❌ Failed');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY:');
  console.log('   Test 1 (Simple):', result1 ? '✅' : '❌');
  console.log('   Test 2 (Contract):', result2 ? '✅' : '❌');
  console.log('   Test 3 (Reminder):', result3 ? '✅' : '❌');
  
  const allPassed = result1 && result2 && result3;
  console.log('\n   Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🎉 Email service is ready for production!');
  } else {
    console.log('\n⚠️  Please check error logs above');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Run tests
testEmailService().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
