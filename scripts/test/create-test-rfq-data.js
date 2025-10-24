// Tạo test data và kiểm tra RFQ received
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

async function createTestRFQData() {
  try {
    console.log('=== TẠO TEST DATA CHO RFQ RECEIVED ===\n');
    
    // Step 1: Login as seller to get listings
    console.log('🔐 Login as seller...');
    const sellerLogin = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'seller@example.com',
      password: 'seller123'
    });

    if (sellerLogin.status !== 200) {
      console.error('❌ Seller login failed:', sellerLogin.status);
      return;
    }

    const sellerToken = sellerLogin.data.data.accessToken;
    console.log('✅ Seller logged in');

    // Get seller's listings
    console.log('📋 Getting seller listings...');
    const listingsResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/listings?own=true',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });

    if (listingsResult.status !== 200 || !listingsResult.data.data.length) {
      console.log('❌ Seller has no listings. Creating one...');
      
      // Create a test listing for seller
      const createListingResult = await httpRequest({
        hostname: 'localhost',
        port: 3006,
        path: '/api/v1/listings',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sellerToken}`,
          'Content-Type': 'application/json'
        }
      }, {
        title: 'Test Container for RFQ',
        description: 'Test listing for RFQ received testing',
        category: 'container',
        condition: 'good',
        price_amount: 1000,
        price_currency: 'USD',
        containers: [{
          type: 'dry',
          size_ft: 20,
          condition: 'good',
          manufacture_year: 2020
        }],
        location: {
          country: 'Vietnam',
          city: 'Ho Chi Minh City',
          address: 'Test Address'
        }
      });

      if (createListingResult.status !== 201) {
        console.error('❌ Failed to create listing:', createListingResult.data);
        return;
      }

      console.log('✅ Created test listing');
      const newListing = createListingResult.data.data;
      var sellerListingId = newListing.id;
    } else {
      var sellerListingId = listingsResult.data.data[0].id;
      console.log('✅ Found seller listing:', sellerListingId);
    }

    // Step 2: Login as buyer
    console.log('\n🔐 Login as buyer...');
    const buyerLogin = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'buyer@example.com',
      password: 'buyer123'
    });

    if (buyerLogin.status !== 200) {
      console.error('❌ Buyer login failed:', buyerLogin.status);
      return;
    }

    const buyerToken = buyerLogin.data.data.accessToken;
    console.log('✅ Buyer logged in');

    // Step 3: Create RFQ from buyer to seller's listing
    console.log('\n📋 Creating RFQ from buyer to seller listing...');
    const rfqPayload = {
      listing_id: sellerListingId,
      purpose: 'sale',
      quantity: 2,
      need_by: '2024-12-31',
      services: {
        inspection: true,
        delivery_estimate: true
      }
    };

    const createRFQResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/rfqs',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      }
    }, rfqPayload);

    if (createRFQResult.status !== 201) {
      console.log('❌ Failed to create RFQ:', createRFQResult.data);
      // Check if RFQ already exists
      if (createRFQResult.status === 409) {
        console.log('   RFQ already exists, continuing...');
      } else {
        return;
      }
    } else {
      console.log('✅ RFQ created successfully!');
      console.log('   RFQ ID:', createRFQResult.data.data.id);
    }

    // Step 4: Verify seller can see the RFQ in received list
    console.log('\n📥 Testing seller received RFQs...');
    const receivedRFQs = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/rfqs?view=received',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });

    if (receivedRFQs.status !== 200) {
      console.error('❌ Failed to get received RFQs:', receivedRFQs.data);
      return;
    }

    console.log('✅ Retrieved received RFQs');
    console.log('   Count:', receivedRFQs.data.data.length);

    if (receivedRFQs.data.data.length === 0) {
      console.log('❌ VẤN ĐỀ: Seller vẫn không thấy RFQ!');
      console.log('   Có thể backend query logic có lỗi');
      return;
    }

    // Display RFQ details
    console.log('\n🔍 RFQ RECEIVED DETAILS:');
    receivedRFQs.data.data.forEach((rfq, index) => {
      console.log(`\n   ${index + 1}. RFQ ID: ${rfq.id}`);
      console.log(`      Status: ${rfq.status}`);
      console.log(`      Purpose: ${rfq.purpose}`);
      console.log(`      Quantity: ${rfq.quantity}`);
      console.log(`      Buyer: ${rfq.users?.display_name || rfq.users?.email}`);
      console.log(`      Listing: ${rfq.listings?.title}`);
      console.log(`      Submitted: ${rfq.submitted_at}`);
      console.log(`      My quotes: ${rfq.quotes?.length || 0}`);
    });

    console.log('\n✅ SUCCESS: RFQ received data is working!');
    console.log('   Frontend RFQ received page should now display data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

createTestRFQData();