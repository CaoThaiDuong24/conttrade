import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Tạo seller test
    const user = await prisma.users.create({
      data: {
        id: uuidv4(), // Generate UUID
        email: 'seller123@test.com',
        password: hashedPassword,
        displayName: 'Test Seller',
        fullName: 'Test Seller User',
        phone: '0999888777',
        status: 'active',
        kycStatus: 'approved',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ User created:', user.email, 'ID:', user.id);
  } catch (error) {
    console.log('ℹ️ User might exist, error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();