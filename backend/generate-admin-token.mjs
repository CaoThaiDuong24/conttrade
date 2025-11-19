/**
 * QUICK FIX: Generate Fresh Admin Token
 * 
 * Vấn đề: Admin token cũ hết hạn hoặc bị invalidate
 * Giải pháp: Login lại để lấy token mới
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3006';

// Thử các credentials có thể
const credentials = [
  { email: 'admin@i-contexchange.vn', password: 'admin123' },
  { email: 'admin@i-contexchange.vn', password: 'Admin@123' },
  { email: 'admin@i-contexchange.vn', password: '123456' },
];

console.log('\n🔐 ĐANG TẠO TOKEN MỚI CHO ADMIN...\n');

for (const cred of credentials) {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cred)
    });
    
    if (res.ok) {
      const data = await res.json();
      const token = data.data.token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!\n');
      console.log('📧 Email:', cred.email);
      console.log('🔑 Password:', cred.password);
      console.log('👤 User ID:', payload.userId);
      console.log('🎭 Roles:', payload.roles?.join(', '));
      console.log('🔐 Permissions:', payload.permissions?.length, 'permissions');
      console.log('⏰ Expires:', new Date(payload.exp * 1000).toLocaleString());
      
      console.log('\n' + '='.repeat(70));
      console.log('📋 CÁCH SỬ DỤNG TOKEN MỚI:');
      console.log('='.repeat(70));
      console.log('\n1️⃣ MỞ DEVTOOLS (F12) TRONG BROWSER');
      console.log('2️⃣ VÀO TAB "APPLICATION" > "COOKIES" > "localhost:3000"');
      console.log('3️⃣ TÌM COOKIE TÊN "accessToken"');
      console.log('4️⃣ DOUBLE-CLICK VÀO VALUE VÀ PASTE TOKEN MỚI:');
      console.log('\n' + token);
      console.log('\n5️⃣ HOẶC CHẠY LỆNH NÀY TRONG CONSOLE:');
      console.log(`\ndocument.cookie = "accessToken=${token}; path=/; max-age=604800";`);
      console.log('location.reload();');
      console.log('\n' + '='.repeat(70));
      
      // Test RBAC access
      console.log('\n🧪 TESTING RBAC ACCESS...\n');
      
      const rbacRes = await fetch(`${API_URL}/api/v1/admin/rbac/matrix`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (rbacRes.ok) {
        console.log('✅ CÓ THỂ TRUY CẬP /admin/rbac/matrix');
      } else {
        const error = await rbacRes.json();
        console.log('❌ KHÔNG THỂ TRUY CẬP:', error.message);
      }
      
      process.exit(0);
    }
  } catch (error) {
    // Thử credential tiếp theo
  }
}

console.log('❌ KHÔNG TÌM THẤY PASSWORD ĐÚNG\n');
console.log('💡 HAY LÀ BẠN ĐĂNG NHẬP LẠI TRỰC TIẾP TRÊN WEBSITE:');
console.log('   1. Mở http://localhost:3000/vi/login');
console.log('   2. Nhập email: admin@i-contexchange.vn');
console.log('   3. Nhập password');
console.log('   4. Đăng nhập → Token mới sẽ tự động được lưu vào cookie\n');
