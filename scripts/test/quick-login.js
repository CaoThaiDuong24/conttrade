// Quick login script for testing
const https = require('https');
const http = require('http');

function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function quickLogin() {
  try {
    console.log('🔐 Quick login test...');
    
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
    
    if (loginResult.status === 200) {
      console.log('✅ Login successful');
      console.log('🎫 Token:', loginResult.data.data.token);
      console.log('\n📋 Now access: http://localhost:3000/vi/auth/login');
      console.log('Use credentials: buyer@example.com / buyer123');
      console.log('Then go to: http://localhost:3000/vi/rfq/sent');
    } else {
      console.error('❌ Login failed:', loginResult.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickLogin();