const http = require('http');

async function fixOwnershipIssue() {
  console.log('🔧 Fixing RFQ Ownership Issue...');
  
  // Check who owns the RFQ
  const checkRFQOwnership = (rfqId) => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3006,
        path: `/api/v1/rfqs/${rfqId}`,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlci1idXllciIsImVtYWlsIjoiYnV5ZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjA1ODE4MDQsImV4cCI6MTc2MDY2ODIwNH0.example' // dummy token structure
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('RFQ Details Status:', res.statusCode);
          console.log('RFQ Details:', data);
          resolve(data);
        });
      });
      req.on('error', reject);
      req.end();
    });
  };
  
  // Create a new RFQ for user-buyer to test with
  const createTestRFQ = (token) => {
    return new Promise((resolve, reject) => {
      const rfqData = JSON.stringify({
        listing_id: "some-listing-id",
        purpose: "PURCHASE",
        quantity: 1,
        need_by: "2025-11-01T00:00:00.000Z",
        services_json: {}
      });
      
      const req = http.request({
        hostname: 'localhost',
        port: 3006,
        path: '/api/v1/rfqs',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(rfqData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Create RFQ Status:', res.statusCode);
          console.log('Create RFQ Response:', data);
          resolve(data);
        });
      });
      req.on('error', reject);
      req.write(rfqData);
      req.end();
    });
  };
  
  try {
    // Temporary solution: Update the existing RFQ to be owned by user-buyer
    console.log('🛠️ Option 1: Update RFQ ownership in database');
    console.log('📝 Need to run SQL: UPDATE rfqs SET buyer_id = "user-buyer" WHERE id = "cb2d73f1-5348-403d-a060-b9b835d7f881"');
    
    console.log('\\n🆕 Option 2: Create new test scenario');
    console.log('📝 But first, let me check current RFQ ownership...');
    
    // Check the problematic RFQ
    await checkRFQOwnership('cb2d73f1-5348-403d-a060-b9b835d7f881');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixOwnershipIssue();