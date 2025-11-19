import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('\n🔍 DEEP ANALYSIS: Token Invalidation Issue');
console.log('==========================================\n');

async function analyze() {
  try {
    // Check all users' permissions_updated_at status
    console.log('📊 Step 1: Check all users permissions_updated_at\n');
    
    const users = await prisma.users.findMany({
      where: {
        email: {
          in: ['admin@example.com', 'buyer@example.com', 'seller@example.com']
        }
      },
      select: {
        id: true,
        email: true,
        permissions_updated_at: true,
        created_at: true,
        updated_at: true,
        last_login_at: true
      }
    });

    users.forEach(user => {
      console.log(`User: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  permissions_updated_at: ${user.permissions_updated_at || 'NULL'}`);
      console.log(`  last_login_at: ${user.last_login_at || 'NULL'}`);
      console.log(`  created_at: ${user.created_at}`);
      console.log(`  updated_at: ${user.updated_at}`);
      
      if (user.permissions_updated_at) {
        const now = new Date();
        const diff = now.getTime() - user.permissions_updated_at.getTime();
        const minutes = Math.floor(diff / 60000);
        console.log(`  ⏰ Updated ${minutes} minutes ago`);
      }
      console.log('');
    });

    // Check buyer role permissions
    console.log('\n📊 Step 2: Check buyer role details\n');
    
    const buyerRole = await prisma.roles.findUnique({
      where: { code: 'buyer' },
      include: {
        role_permissions: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (buyerRole) {
      console.log(`Role: ${buyerRole.name}`);
      console.log(`  Code: ${buyerRole.code}`);
      console.log(`  Version: ${buyerRole.role_version}`);
      console.log(`  Created: ${buyerRole.created_at}`);
      console.log(`  Updated: ${buyerRole.updated_at}`);
      console.log(`  Permissions: ${buyerRole.role_permissions.length}`);
    }

    // Simulate token validation logic
    console.log('\n📊 Step 3: Simulate token validation\n');
    
    const buyer = users.find(u => u.email === 'buyer@example.com');
    if (buyer) {
      console.log('Scenario: User just logged in at', new Date().toISOString());
      const tokenIssuedAt = new Date(); // Token issued NOW
      
      console.log('Token issued at:', tokenIssuedAt.toISOString());
      console.log('permissions_updated_at:', buyer.permissions_updated_at ? buyer.permissions_updated_at.toISOString() : 'NULL');
      
      if (buyer.permissions_updated_at) {
        const willBeRejected = tokenIssuedAt < buyer.permissions_updated_at;
        console.log('\n🔍 Comparison:');
        console.log(`  tokenIssuedAt (${tokenIssuedAt.getTime()})`);
        console.log(`  permissions_updated_at (${buyer.permissions_updated_at.getTime()})`);
        console.log(`  tokenIssuedAt < permissions_updated_at: ${willBeRejected}`);
        
        if (willBeRejected) {
          console.log('\n❌ PROBLEM FOUND:');
          console.log('  Token will be REJECTED immediately after login!');
          console.log('  permissions_updated_at is NEWER than token issue time');
          console.log('\n  This happens when:');
          console.log('  1. Admin assigned permissions to role');
          console.log('  2. System updated permissions_updated_at');
          console.log('  3. But user has not logged in yet to get new token');
        } else {
          console.log('\n✅ Token validation should PASS');
        }
      } else {
        console.log('\n✅ permissions_updated_at is NULL - token will be accepted');
      }
    }

    // Check if permissions were recently updated
    console.log('\n📊 Step 4: Check recent permission updates\n');
    
    const recentlyUpdatedUsers = await prisma.users.findMany({
      where: {
        permissions_updated_at: {
          not: null
        }
      },
      select: {
        email: true,
        permissions_updated_at: true
      },
      orderBy: {
        permissions_updated_at: 'desc'
      },
      take: 10
    });

    if (recentlyUpdatedUsers.length > 0) {
      console.log('Recently updated users:');
      recentlyUpdatedUsers.forEach(u => {
        console.log(`  ${u.email}: ${u.permissions_updated_at}`);
      });
    } else {
      console.log('No users with permissions_updated_at set');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================\n');
    
    if (buyer && buyer.permissions_updated_at) {
      console.log('⚠️  ISSUE DETECTED: permissions_updated_at is blocking login');
      console.log('\nOptions to fix:');
      console.log('  1. Reset permissions_updated_at for this user:');
      console.log(`     UPDATE users SET permissions_updated_at = NULL WHERE email = 'buyer@example.com';`);
      console.log('');
      console.log('  2. Modify validation logic to allow first login after permission update');
      console.log('');
      console.log('  3. Add grace period (e.g., 10 seconds) after permission update');
    } else {
      console.log('✅ No immediate issues detected');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyze();
