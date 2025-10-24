// Create test data: listing for seller and RFQ from buyer
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

async function createTestData() {
  try {
    console.log('🚀 CREATING TEST DATA FOR RFQ RECEIVED\n');

    // Step 1: Login as seller
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
      console.error('❌ Seller login failed:', loginResult.status, loginResult.data);
      return;
    }

    console.log('✅ Seller login successful');
    const sellerToken = loginResult.data.data.accessToken;

    // Step 2: Get or create container first (needed for listing)
    console.log('\n2️⃣ Check containers...');
    const containersResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/containers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sellerToken}`,
        'Content-Type': 'application/json'
      }
    });

    let containerId = null;
    if (containersResult.status === 200 && containersResult.data.data?.length > 0) {
      containerId = containersResult.data.data[0].id;
      console.log('✅ Found container:', containerId);
    } else {
      // Create a container if none exist
      console.log('   Creating test container...');
      const createContainerResult = await httpRequest({
        hostname: 'localhost',
        port: 3006,
        path: '/api/v1/containers',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sellerToken}`,
          'Content-Type': 'application/json'
        }
      }, {
        type: 'dry',
        size_ft: 20,
        condition: 'good',
        year: 2020,
        grade: 'A',
        features: {
          doors: 'double',
          flooring: 'bamboo'
        }
      });

      if (createContainerResult.status === 201) {
        containerId = createContainerResult.data.data.id;
        console.log('✅ Container created:', containerId);
      } else {
        console.log('⚠️ Could not create container, proceeding without container_id');
      }
    }

    // Step 3: Create listing for seller
    console.log('\n3️⃣ Create listing for seller...');
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
      container_id: containerId,
      deal_type: 'sale',
      price_currency: 'VND',
      price_amount: 50000000,
      title: 'Container 20ft chất lượng cao',
      description: 'Container 20ft trong tình trạng tốt, phù hợp cho xuất khẩu',
      features: {
        condition: 'excellent',
        inspected: true
      },
      status: 'active'
    });

    if (createListingResult.status !== 201) {
      console.error('❌ Create listing failed:', createListingResult.status, createListingResult.data);
      return;
    }

    console.log('✅ Listing created successfully');
    const listingId = createListingResult.data.data.id;
    console.log('   Listing ID:', listingId);

    // Step 4: Login as buyer
    console.log('\n4️⃣ Login as buyer...');
    const buyerLoginResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      email: 'buyer@example.com',
      password: 'buyer123'
    });

    if (buyerLoginResult.status !== 200) {
      console.error('❌ Buyer login failed:', buyerLoginResult.status, buyerLoginResult.data);
      return;
    }

    console.log('✅ Buyer login successful');
    const buyerToken = buyerLoginResult.data.data.accessToken;

    // Step 5: Create RFQ as buyer
    console.log('\n5️⃣ Create RFQ as buyer...');
    const createRFQResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/rfqs',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      listing_id: listingId,
      purpose: 'sale',
      quantity: 3,
      need_by: '2024-12-31',
      services: {
        inspection: true,
        delivery_estimate: true,
        certification: false,
        repair_estimate: false
      }
    });

    if (createRFQResult.status !== 201) {
      console.error('❌ Create RFQ failed:', createRFQResult.status, createRFQResult.data);
      return;
    }

    console.log('✅ RFQ created successfully');
    const rfqId = createRFQResult.data.data.id;
    console.log('   RFQ ID:', rfqId);

    // Step 6: Test RFQs received by seller
    console.log('\n6️⃣ Test RFQs received by seller...');
    const receivedRFQsResult = await httpRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/v1/rfqs?view=received',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sellerToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   Received RFQs status:', receivedRFQsResult.status);
    if (receivedRFQsResult.status === 200) {
      console.log('   RFQs count:', receivedRFQsResult.data.data?.length || 0);
      
      if (receivedRFQsResult.data.data?.length > 0) {
        console.log('\n🎉 SUCCESS! Seller can now see RFQs');
        const rfq = receivedRFQsResult.data.data[0];
        console.log('   📋 RFQ Details:');
        console.log('      - ID:', rfq.id);
        console.log('      - Status:', rfq.status);
        console.log('      - Purpose:', rfq.purpose);
        console.log('      - Quantity:', rfq.quantity);
        console.log('      - Buyer:', rfq.users?.display_name);
        console.log('      - Listing:', rfq.listings?.title);
        console.log('      - Need By:', rfq.need_by);
        console.log('      - Services:', JSON.stringify(rfq.services_json));
        
        console.log('\n✨ Test data created successfully!');
        console.log('   🔗 Listing ID:', listingId);
        console.log('   📩 RFQ ID:', rfqId);
        console.log('   👥 Seller can now see this RFQ in the received page');
      } else {
        console.error('❌ RFQ not found in received list - there may be a backend issue');
      }
    } else {
      console.error('❌ Failed to fetch received RFQs:', receivedRFQsResult.data);
    }

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
  }
}

createTestData();