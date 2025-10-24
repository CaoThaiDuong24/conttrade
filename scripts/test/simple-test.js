const https = require('https');
const http = require('http');

// Simple HTTP client for testing
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🔐 Logging in...');
    
    // Login
    const loginResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      email: 'buyer@example.com',
      password: 'buyer123'
    }));
    
    if (loginResult.status !== 200) {
      throw new Error(`Login failed: ${loginResult.status} - ${JSON.stringify(loginResult.data)}`);
    }
    
    const token = loginResult.data.data.token;
    console.log('✅ Login successful, token obtained');
    
    // Get RFQs
    console.log('📋 Fetching RFQs...');
    const rfqResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/rfqs?view=sent',
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (rfqResult.status !== 200) {
      throw new Error(`RFQ API failed: ${rfqResult.status} - ${JSON.stringify(rfqResult.data)}`);
    }
    
    console.log('✅ RFQ API Response:');
    console.log(JSON.stringify(rfqResult.data, null, 2));
    
    if (rfqResult.data.data && rfqResult.data.data.length > 0) {
      console.log('\n🔍 First RFQ Structure:');
      const firstRFQ = rfqResult.data.data[0];
      console.log(JSON.stringify(firstRFQ, null, 2));
      
      console.log('\n📊 Field Check:');
      console.log('- id:', firstRFQ.id);
      console.log('- title:', firstRFQ.title);
      console.log('- status:', firstRFQ.status);
      console.log('- purpose:', firstRFQ.purpose);
      console.log('- quantity:', firstRFQ.quantity);
      console.log('- submitted_at:', firstRFQ.submitted_at);
      console.log('- expired_at:', firstRFQ.expired_at);
      console.log('- delivery_location:', firstRFQ.delivery_location);
      console.log('- listings:', firstRFQ.listings);
      console.log('- quotes count:', firstRFQ.quotes ? firstRFQ.quotes.length : 'undefined');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();