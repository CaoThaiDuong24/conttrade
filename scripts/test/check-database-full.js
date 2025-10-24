const { PrismaClient } = require('./backend/node_modules/@prisma/client');

async function checkDatabase() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Checking database connection and data...\n');
        
        // 1. Test connection
        await prisma.$connect();
        console.log('✅ Database connection successful');
        
        // 2. Check users table
        console.log('\n🔍 Checking users table...');
        const userCount = await prisma.users.count();
        console.log(`Total users: ${userCount}`);
        
        if (userCount === 0) {
            console.log('❌ No users found! Creating a test user...');
            
            const bcrypt = require('bcrypt');
            const testPassword = await bcrypt.hash('admin123', 10);
            
            const testUser = await prisma.users.create({
                data: {
                    id: 'user-test-admin-001',
                    email: 'admin@example.com',
                    password_hash: testPassword,
                    first_name: 'Admin',
                    last_name: 'User',
                    status: 'ACTIVE',
                    kyc_status: 'VERIFIED',
                    display_name: 'Administrator',
                    email_verified_at: new Date(),
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
            
            console.log('✅ Test user created:', testUser.email);
        } else {
            // Show existing users
            const users = await prisma.users.findMany({
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    status: true,
                    created_at: true
                },
                take: 5
            });
            
            console.log('\n📋 Existing users:');
            users.forEach((user, i) => {
                console.log(`${i+1}. ${user.email} - ${user.first_name} ${user.last_name} (${user.status})`);
            });
        }
        
        // 3. Test other important tables
        console.log('\n🔍 Checking other tables...');
        const listingCount = await prisma.listings.count();
        const orderCount = await prisma.orders.count();
        const depotCount = await prisma.depots.count();
        
        console.log(`Listings: ${listingCount}`);
        console.log(`Orders: ${orderCount}`);
        console.log(`Depots: ${depotCount}`);
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();