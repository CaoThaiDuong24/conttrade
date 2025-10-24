// Create test user for upload testing
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'test123';
  const displayName = 'Test User';
  
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: email }
    });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = randomUUID();
    const user = await prisma.users.create({
      data: {
        id: userId,
        email: email,
        password_hash: passwordHash,
        display_name: displayName,
        default_locale: 'vi',
        status: 'ACTIVE',
        kyc_status: 'UNVERIFIED',
        updated_at: new Date()
      }
    });
    
    console.log('Test user created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();