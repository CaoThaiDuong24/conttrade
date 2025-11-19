// Test Cart Protection - Run in Browser Console

// TEST 1: Check if user is logged in
console.log('=== TEST 1: Current Auth Status ===');
const hasToken = document.cookie.includes('accessToken');
const localToken = localStorage.getItem('accessToken');
console.log('Cookie has token:', hasToken);
console.log('LocalStorage has token:', !!localToken);

// TEST 2: Simulate logout and try to access
console.log('\n=== TEST 2: Logout Test ===');
console.log('To test protection:');
console.log('1. Click user avatar → Logout');
console.log('2. Try to visit: http://localhost:3000/vi/cart');
console.log('3. Expected: Redirect to /vi/auth/login?redirect=/vi/cart');

// TEST 3: Check cart page protection status
console.log('\n=== TEST 3: Cart Route Info ===');
console.log('Current URL:', window.location.href);
console.log('Current Path:', window.location.pathname);

// TEST 4: Manual cookie clear (for testing)
console.log('\n=== TEST 4: Manual Test (Optional) ===');
console.log('Run this to clear auth:');
console.log(`
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
window.location.href = '/vi/cart';
`);

// TEST 5: Check if in protected route
console.log('\n=== TEST 5: Protection Status ===');
const isInCart = window.location.pathname.includes('/cart');
const isInLogin = window.location.pathname.includes('/login');
if (isInCart && hasToken) {
  console.log('✅ Status: Logged in - Can access cart (CORRECT)');
} else if (isInCart && !hasToken) {
  console.log('❌ Status: Not logged in but accessing cart (BUG!)');
} else if (isInLogin && !hasToken) {
  console.log('✅ Status: Not logged in - Redirected to login (CORRECT)');
}
