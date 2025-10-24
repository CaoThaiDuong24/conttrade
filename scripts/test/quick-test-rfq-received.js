// Quick test RFQ received API after fixes
const http = require('http');

async function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: e.message
          });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

async function quickTestRFQReceived() {
  try {
    console.log('🔍 QUICK TEST RFQ RECEIVED API AFTER FIXES\n');

    // Login as seller
    console.log('1️⃣ Login as seller...');
    const loginResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      email: 'seller@example.com',
      password: 'seller123'
    });

    if (loginResult.status !== 200) {
      console.error('❌ Login failed:', loginResult.status, loginResult.data);
      return;
    }

    console.log('✅ Login successful');
    const token = loginResult.data.data.token;

    // Test RFQ received API
    console.log('\n2️⃣ Test RFQ received API...');
    const rfqResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/rfqs?view=received',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   API Status:', rfqResult.status);
    
    if (rfqResult.status === 200) {
      console.log('✅ API working now!');
      console.log('   RFQ count:', rfqResult.data.data?.length || 0);
      
      if (rfqResult.data.data?.length > 0) {
        console.log('\n📋 First RFQ:');
        const rfq = rfqResult.data.data[0];
        console.log('   - ID:', rfq.id);
        console.log('   - Status:', rfq.status);
        console.log('   - Purpose:', rfq.purpose);
        console.log('   - Buyer:', rfq.users?.display_name);
        console.log('   - Listing:', rfq.listings?.title);
        console.log('   - Submitted:', rfq.submitted_at);
      }
    } else {
      console.error('❌ Still failing:', rfqResult.status);
      console.error('   Error:', rfqResult.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTestRFQReceived();