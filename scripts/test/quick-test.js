const axios = require('axios');

async function quickTest() {
  try {
    const response = await axios.post('http://localhost:3006/api/v1/auth/login', {
      email: 'buyer@example.com',
      password: '123456'
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data);
  }
}

quickTest();