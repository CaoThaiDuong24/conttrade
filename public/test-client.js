// Test localStorage token
console.log('Testing localStorage token...');
console.log('accessToken:', localStorage.getItem('accessToken'));
console.log('user:', localStorage.getItem('user'));

// Test fetch listings directly
fetch('http://localhost:3006/api/v1/listings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('Response status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(err => {
  console.error('Error:', err);
});