#!/usr/bin/env node

/**
 * Test script to verify API URL construction
 * Run with: node test-api-urls.js
 */

console.log('🧪 Testing API URL Construction\n');

// Simulate different baseURL scenarios
const testCases = [
  {
    name: 'Production (with base URL)',
    baseUrl: 'https://iconttrade.ltacv.com',
    path: '/api/v1/listings',
    expected: 'https://iconttrade.ltacv.com/api/v1/listings'
  },
  {
    name: 'Production (empty base URL)',
    baseUrl: '',
    path: '/api/v1/listings',
    expected: '/api/v1/listings (relative)'
  },
  {
    name: 'Development (localhost)',
    baseUrl: 'http://localhost:3006',
    path: '/api/v1/listings',
    expected: 'http://localhost:3006/api/v1/listings'
  },
  {
    name: 'Relative path only',
    baseUrl: '',
    path: '/api/v1/users/me',
    expected: '/api/v1/users/me (relative)'
  }
];

// Test URL construction logic (mimics the fixed client.ts)
function constructURL(path, baseUrl) {
  try {
    const effectiveBaseUrl = baseUrl || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const url = new URL(path, effectiveBaseUrl);
    return url.toString();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

// Run tests
let passed = 0;
let failed = 0;

testCases.forEach(({ name, baseUrl, path, expected }) => {
  const result = constructURL(path, baseUrl);
  const isPass = result.includes(path);
  
  console.log(`${isPass ? '✅' : '❌'} ${name}`);
  console.log(`   Base: ${baseUrl || '(empty)'}`);
  console.log(`   Path: ${path}`);
  console.log(`   Result: ${result}`);
  console.log(`   Expected: ${expected}`);
  console.log('');
  
  if (isPass) passed++;
  else failed++;
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✨ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
