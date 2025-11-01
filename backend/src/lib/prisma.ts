// @ts-nocheck
import { PrismaClient } from '@prisma/client';

// Global variable to prevent multiple instances in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Clear global cache to ensure fresh connection with updated DATABASE_URL
if (globalThis.__prisma) {
  console.log('🔄 Clearing cached Prisma instance to use latest DATABASE_URL...');
  globalThis.__prisma.$disconnect().catch(() => {
    // Ignore disconnect errors
  });
  globalThis.__prisma = undefined;
}

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set in environment variables!');
} else {
  console.log('📊 Using DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
}

const prisma = new PrismaClient({
  log: databaseUrl ? ['query', 'error', 'warn'] : ['error'],
  datasources: databaseUrl ? {
    db: {
      url: databaseUrl,
    },
  } : undefined,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;

