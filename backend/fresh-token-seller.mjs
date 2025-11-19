import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'lta-super-secret-key-change-in-production';

async function generateFreshToken() {
  try {
    console.log('🔑 Generating fresh token for seller@example.com...\n');
    
    const seller = await prisma.users.findUnique({
      where: { email: 'seller@example.com' },
      include: {
        user_roles: {
          include: {
            roles: {
              include: {
                role_permissions: {
                  include: {
                    permissions: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!seller) {
      console.log('❌ Seller not found!');
      return;
    }
    
    console.log('✅ Found seller:', seller.email);
    console.log('   User ID:', seller.id);
    console.log('   Display Name:', seller.display_name);
    
    const roles = seller.user_roles.map(ur => ur.roles.code);
    const permissions = seller.user_roles.flatMap(ur => 
      ur.roles.role_permissions.map(rp => rp.permissions.code)
    );
    
    console.log('   Roles:', roles);
    console.log('   Permissions:', permissions.length);
    
    const token = jwt.sign(
      {
        userId: seller.id,
        email: seller.email,
        roles: roles,
        permissions: permissions
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const decoded = jwt.decode(token);
    const expDate = new Date(decoded.exp * 1000);
    
    console.log('\n🎟️  NEW TOKEN (valid for 7 days):');
    console.log(token);
    console.log('\n📅 Expires:', expDate.toLocaleString());
    console.log('\n💡 Usage:');
    console.log('   1. Open browser DevTools Console');
    console.log('   2. Run: localStorage.setItem("accessToken", "' + token + '")');
    console.log('   3. Run: document.cookie = "accessToken=' + token + '; path=/"');
    console.log('   4. Refresh page (Ctrl + F5)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

generateFreshToken();
