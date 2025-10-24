const http = require('http');

async function quickTest() {
  console.log('🔍 Quick API Test...');
  
  // Test 1: Get quotes
  const getQuotes = () => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3006,
        path: '/api/v1/quotes/debug-statuses',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log('📋 Found quotes:', result.data.length);
            result.data.forEach(quote => {
              console.log(`  - ${quote.id} (${quote.status})`);
            });
            resolve(result.data);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  };
  
  // Test 2: Get buyer token
  const getBuyerToken = () => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3006,
        path: '/api/v1/quotes/get-buyer-token',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.success) {
              console.log('🔑 Got token for:', result.user.display_name);
              resolve(result.token);
            } else {
              reject(new Error('No token'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  };
  
  try {
    const quotes = await getQuotes();
    const token = await getBuyerToken();
    
    console.log('\n✅ Backend API is responsive');
    console.log('📝 Quotes available:', quotes.length > 0 ? 'YES' : 'NO');
    console.log('🔐 Authentication working:', token ? 'YES' : 'NO');
    
    if (quotes.length > 0) {
      const submittedQuotes = quotes.filter(q => q.status === 'SUBMITTED');
      console.log('🎯 SUBMITTED quotes:', submittedQuotes.length);
      
      if (submittedQuotes.length > 0) {
        console.log('\n🌐 Frontend should work with these URLs:');
        submittedQuotes.forEach(quote => {
          console.log(`   http://localhost:3000/vi/rfq/${quote.rfq_id}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();