// Simple test for accept quote
const fetch = require('node-fetch');

async function testAcceptQuote() {
  try {
    const quoteId = 'f0e586ff-d21c-48dc-8944-4d7a14edca42';
    
    const response = await fetch(`http://localhost:3006/api/v1/quotes/${quoteId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // For testing without auth
      },
      body: JSON.stringify({})
    });

    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAcceptQuote();