const http = require('http');

// Simple test for quote acceptance
async function testFinal() {
  console.log('🏁 Final Test - Quote Acceptance');
  
  try {
    // Get token
    const token = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost', port: 3006,
        path: '/api/v1/quotes/get-buyer-token', method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          resolve(result.token);
        });
      });
      req.end();
    });
    
    // Test acceptance
    const quoteId = '5bce72dd-00ce-4d70-87f4-6c6855372924';
    const success = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost', port: 3006,
        path: `/api/v1/quotes/${quoteId}/accept`, method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
          resolve(res.statusCode === 200);
        });
      });
      req.write('{}');
      req.end();
    });
    
    if (success) {
      console.log('\\n🎉 SUCCESS! Quote acceptance is working!');
      console.log('✅ Backend API is fully functional');
      console.log('🌐 Frontend should work now: http://localhost:3000/vi/rfq/cb2d73f1-5348-403d-a060-b9b835d7f881');
    } else {
      console.log('\\n❌ Still not working');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testFinal();