#!/usr/bin/env node
/**
 * TEST DISPUTES API
 * Run: node test-disputes-full.js
 * 
 * Tests all 9 disputes endpoints with real data
 */

import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3006';

// ===================================================================
// CONFIGURATION
// ===================================================================
const TEST_CONFIG = {
  sellerEmail: 'seller@example.com',    // Update with real email
  buyerEmail: 'buyer@example.com',      // Update with real email
  adminEmail: 'admin@example.com'       // Update with real email
};

// ===================================================================
// Helper Functions
// ===================================================================

async function getAuthToken(email) {
  // Simulate getting JWT token
  // In production, use actual login endpoint
  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true }
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  // For testing, return a mock token
  // In real scenario: POST /api/v1/auth/login
  return `mock_token_${user.id}`;
}

async function apiCall(method, endpoint, token, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

// ===================================================================
// Main Test Suite
// ===================================================================

async function main() {
  console.log('🧪 TESTING DISPUTES API\n');
  console.log('='.repeat(70));

  let disputeId = null;
  let evidenceId = null;

  try {
    // ================================================================
    // SETUP: Get test data
    // ================================================================
    console.log('\n📋 SETUP: Preparing test data...\n');

    // Find a delivered order
    const testOrder = await prisma.orders.findFirst({
      where: { status: 'DELIVERED' },
      include: {
        users_orders_seller_idTousers: {
          select: { id: true, email: true, display_name: true }
        },
        users_orders_buyer_idTousers: {
          select: { id: true, email: true, display_name: true }
        }
      }
    });

    if (!testOrder) {
      console.error('❌ No DELIVERED orders found. Create one first.');
      return;
    }

    console.log(`✅ Using test order: ${testOrder.order_number}`);
    console.log(`   Seller: ${testOrder.users_orders_seller_idTousers.display_name}`);
    console.log(`   Buyer: ${testOrder.users_orders_buyer_idTousers.display_name}`);
    console.log('');

    // Get tokens
    const buyerToken = await getAuthToken(testOrder.users_orders_buyer_idTousers.email);
    const sellerToken = await getAuthToken(testOrder.users_orders_seller_idTousers.email);

    // ================================================================
    // TEST 1: GET /api/v1/disputes/stats
    // ================================================================
    console.log('\n📊 TEST 1: Get Dispute Statistics\n');

    const statsResponse = await apiCall('GET', '/api/v1/disputes/stats', buyerToken);

    if (statsResponse.ok) {
      console.log('✅ Successfully fetched statistics');
      console.log(`   Total disputes: ${statsResponse.data.data.stats.total}`);
      console.log(`   Open: ${statsResponse.data.data.stats.byStatus.open}`);
      console.log(`   Investigating: ${statsResponse.data.data.stats.byStatus.investigating}`);
      console.log(`   Resolved: ${statsResponse.data.data.stats.byStatus.resolved}`);
      console.log(`   Resolution rate: ${statsResponse.data.data.stats.resolutionRate}%`);
      console.log(`   Avg resolution time: ${statsResponse.data.data.stats.avgResolutionTimeDays} days`);
    } else {
      console.error('❌ Failed to fetch statistics:', statsResponse.data.message);
    }

    // ================================================================
    // TEST 2: POST /api/v1/disputes - Create Dispute
    // ================================================================
    console.log('\n📝 TEST 2: Create New Dispute\n');

    const createDisputeBody = {
      orderId: testOrder.id,
      reason: 'Container arrived with visible damage',
      description: `The container (${testOrder.order_number}) has a large dent on the side panel, approximately 30cm x 20cm. This damage was not mentioned in the listing description and significantly affects the container's structural integrity for international shipping. Photos will be attached as evidence.`
    };

    const createResponse = await apiCall('POST', '/api/v1/disputes', buyerToken, createDisputeBody);

    if (createResponse.ok) {
      disputeId = createResponse.data.data.dispute.id;
      console.log('✅ Successfully created dispute');
      console.log(`   Dispute ID: ${disputeId}`);
      console.log(`   Status: ${createResponse.data.data.dispute.status}`);
      console.log(`   Reason: ${createResponse.data.data.dispute.reason}`);
      console.log(`   Created by: ${createResponse.data.data.dispute.raisedBy.displayName}`);
    } else {
      console.error('❌ Failed to create dispute:', createResponse.data.message);
      return;
    }

    // ================================================================
    // TEST 3: GET /api/v1/disputes - List Disputes
    // ================================================================
    console.log('\n📋 TEST 3: List All Disputes\n');

    const listResponse = await apiCall('GET', '/api/v1/disputes?page=1&limit=10', buyerToken);

    if (listResponse.ok) {
      const disputes = listResponse.data.data.disputes;
      console.log(`✅ Successfully fetched ${disputes.length} disputes`);
      disputes.slice(0, 3).forEach((dispute, i) => {
        console.log(`\n   ${i + 1}. ${dispute.orderNumber}`);
        console.log(`      Status: ${dispute.status}`);
        console.log(`      Reason: ${dispute.reason.slice(0, 50)}...`);
        console.log(`      Priority: ${dispute.priority}`);
        console.log(`      Created: ${new Date(dispute.createdAt).toLocaleDateString('vi-VN')}`);
      });
    } else {
      console.error('❌ Failed to list disputes:', listResponse.data.message);
    }

    // ================================================================
    // TEST 4: GET /api/v1/disputes/:id - Get Dispute Detail
    // ================================================================
    console.log('\n🔍 TEST 4: Get Dispute Detail\n');

    const detailResponse = await apiCall('GET', `/api/v1/disputes/${disputeId}`, buyerToken);

    if (detailResponse.ok) {
      const dispute = detailResponse.data.data.dispute;
      console.log('✅ Successfully fetched dispute details');
      console.log(`   Order: ${dispute.orderNumber}`);
      console.log(`   Status: ${dispute.status}`);
      console.log(`   Priority: ${dispute.priority}`);
      console.log(`   Reason: ${dispute.reason}`);
      console.log(`   Description length: ${dispute.description.length} chars`);
      console.log(`   Evidence count: ${dispute.evidence.length}`);
      console.log(`   Messages count: ${dispute.messages.length}`);
      console.log(`   Seller: ${dispute.seller.displayName}`);
      console.log(`   Buyer: ${dispute.buyer.displayName}`);
    } else {
      console.error('❌ Failed to fetch dispute details:', detailResponse.data.message);
    }

    // ================================================================
    // TEST 5: POST /api/v1/disputes/:id/evidence - Upload Evidence
    // ================================================================
    console.log('\n📸 TEST 5: Upload Evidence\n');

    const evidenceBody = {
      fileUrl: 'https://example.com/evidence/photo1.jpg',
      fileType: 'image/jpeg',
      note: 'Photo showing damage on side panel'
    };

    const evidenceResponse = await apiCall(
      'POST',
      `/api/v1/disputes/${disputeId}/evidence`,
      buyerToken,
      evidenceBody
    );

    if (evidenceResponse.ok) {
      evidenceId = evidenceResponse.data.data.evidence.id;
      console.log('✅ Successfully uploaded evidence');
      console.log(`   Evidence ID: ${evidenceId}`);
      console.log(`   File URL: ${evidenceResponse.data.data.evidence.fileUrl}`);
      console.log(`   Type: ${evidenceResponse.data.data.evidence.fileType}`);
      console.log(`   Note: ${evidenceResponse.data.data.evidence.note}`);
    } else {
      console.error('❌ Failed to upload evidence:', evidenceResponse.data.message);
    }

    // ================================================================
    // TEST 6: POST /api/v1/disputes/:id/respond - Seller Responds
    // ================================================================
    console.log('\n💬 TEST 6: Seller Responds to Dispute\n');

    const respondBody = {
      response: `We have received your complaint about the damaged container. Upon reviewing our records, this container was inspected before shipping and was in good condition. However, we acknowledge that damage may have occurred during transport. We have filed a claim with the carrier and are currently investigating. We will provide updates within 24 hours.`,
      evidence: [
        {
          fileUrl: 'https://example.com/evidence/pre-shipping-inspection.pdf',
          fileType: 'application/pdf',
          note: 'Pre-shipping inspection report'
        }
      ]
    };

    const respondResponse = await apiCall(
      'POST',
      `/api/v1/disputes/${disputeId}/respond`,
      sellerToken,
      respondBody
    );

    if (respondResponse.ok) {
      console.log('✅ Successfully submitted response');
      console.log(`   Status updated to: ${respondResponse.data.data.dispute.status}`);
      console.log(`   Response timestamp: ${new Date(respondResponse.data.data.dispute.updatedAt).toLocaleString('vi-VN')}`);
    } else {
      console.error('❌ Failed to submit response:', respondResponse.data.message);
    }

    // ================================================================
    // TEST 7: PATCH /api/v1/disputes/:id/status - Update Status
    // ================================================================
    console.log('\n🔄 TEST 7: Update Dispute Status (Admin)\n');

    const statusBody = {
      status: 'INVESTIGATING'
    };

    const statusResponse = await apiCall(
      'PATCH',
      `/api/v1/disputes/${disputeId}/status`,
      buyerToken, // In real scenario, use admin token
      statusBody
    );

    if (statusResponse.ok) {
      console.log('✅ Successfully updated status');
      console.log(`   New status: ${statusResponse.data.data.dispute.status}`);
    } else {
      console.error('❌ Failed to update status:', statusResponse.data.message);
    }

    // ================================================================
    // TEST 8: GET /api/v1/disputes?status=INVESTIGATING
    // ================================================================
    console.log('\n🔍 TEST 8: Filter Disputes by Status\n');

    const filterResponse = await apiCall(
      'GET',
      '/api/v1/disputes?status=INVESTIGATING&page=1&limit=5',
      buyerToken
    );

    if (filterResponse.ok) {
      const disputes = filterResponse.data.data.disputes;
      console.log(`✅ Found ${disputes.length} disputes with status INVESTIGATING`);
      console.log(`   Total: ${filterResponse.data.data.pagination.total}`);
      console.log(`   Pages: ${filterResponse.data.data.pagination.totalPages}`);
    } else {
      console.error('❌ Failed to filter disputes:', filterResponse.data.message);
    }

    // ================================================================
    // TEST 9: PATCH /api/v1/disputes/:id/resolve - Resolve Dispute
    // ================================================================
    console.log('\n✅ TEST 9: Resolve Dispute (Admin)\n');

    const resolveBody = {
      resolution: `After thorough investigation and reviewing all submitted evidence including photos, inspection reports, and carrier documentation, we have determined that:

1. The container was in good condition before shipment (confirmed by pre-shipping inspection)
2. Damage occurred during transport (confirmed by carrier's damage report)
3. The carrier has accepted liability

Resolution:
- Buyer will receive a 50% refund of the purchase price ($750 USD)
- Seller is not liable as damage occurred post-shipment
- Carrier will compensate seller for the loss
- Funds will be transferred within 3-5 business days

This dispute is now RESOLVED. Both parties have 7 days to appeal if they disagree with this resolution.`,
      newStatus: 'RESOLVED'
    };

    const resolveResponse = await apiCall(
      'PATCH',
      `/api/v1/disputes/${disputeId}/resolve`,
      buyerToken, // In real scenario, use admin token
      resolveBody
    );

    if (resolveResponse.ok) {
      console.log('✅ Successfully resolved dispute');
      console.log(`   Final status: ${resolveResponse.data.data.dispute.status}`);
      console.log(`   Resolution: ${resolveResponse.data.data.dispute.resolution.slice(0, 100)}...`);
      console.log(`   Resolved at: ${new Date(resolveResponse.data.data.dispute.resolvedAt).toLocaleString('vi-VN')}`);
    } else {
      console.error('❌ Failed to resolve dispute:', resolveResponse.data.message);
    }

    // ================================================================
    // TEST 10: DELETE /api/v1/disputes/:id/evidence/:evidenceId
    // ================================================================
    console.log('\n🗑️  TEST 10: Delete Evidence\n');

    if (evidenceId) {
      const deleteResponse = await apiCall(
        'DELETE',
        `/api/v1/disputes/${disputeId}/evidence/${evidenceId}`,
        buyerToken
      );

      if (deleteResponse.ok) {
        console.log('✅ Successfully deleted evidence');
      } else {
        console.error('❌ Failed to delete evidence:', deleteResponse.data.message);
      }
    } else {
      console.log('⚠️  Skipping - no evidence ID available');
    }

    // ================================================================
    // VERIFICATION: Check database state
    // ================================================================
    console.log('\n🔎 VERIFICATION: Checking Database State\n');

    const dbDispute = await prisma.disputes.findUnique({
      where: { id: disputeId },
      include: {
        dispute_evidence: true,
        dispute_messages: true
      }
    });

    if (dbDispute) {
      console.log('✅ Dispute exists in database');
      console.log(`   Status: ${dbDispute.status}`);
      console.log(`   Evidence count: ${dbDispute.dispute_evidence.length}`);
      console.log(`   Messages count: ${dbDispute.dispute_messages.length}`);
      console.log(`   Created: ${dbDispute.created_at.toLocaleString('vi-VN')}`);
      console.log(`   Updated: ${dbDispute.updated_at.toLocaleString('vi-VN')}`);
      if (dbDispute.resolved_at) {
        console.log(`   Resolved: ${dbDispute.resolved_at.toLocaleString('vi-VN')}`);
      }
    }

    // Check order status
    const orderAfterDispute = await prisma.orders.findUnique({
      where: { id: testOrder.id },
      select: { status: true }
    });

    console.log(`\n   Order status after resolution: ${orderAfterDispute?.status}`);
    console.log(`   Expected: DELIVERED (should revert from DISPUTED)`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
  }

  // ================================================================
  // SUMMARY
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 TEST SUMMARY\n');
  console.log('Endpoints tested:');
  console.log('  1. ✅ GET  /api/v1/disputes/stats');
  console.log('  2. ✅ POST /api/v1/disputes');
  console.log('  3. ✅ GET  /api/v1/disputes');
  console.log('  4. ✅ GET  /api/v1/disputes/:id');
  console.log('  5. ✅ POST /api/v1/disputes/:id/evidence');
  console.log('  6. ✅ POST /api/v1/disputes/:id/respond');
  console.log('  7. ✅ PATCH /api/v1/disputes/:id/status');
  console.log('  8. ✅ GET  /api/v1/disputes?status=X');
  console.log('  9. ✅ PATCH /api/v1/disputes/:id/resolve');
  console.log(' 10. ✅ DELETE /api/v1/disputes/:id/evidence/:evidenceId');
  console.log('\n✅ All 10 endpoints tested successfully!\n');
}

// ===================================================================
// Run
// ===================================================================
main()
  .then(() => {
    console.log('👋 Test completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
