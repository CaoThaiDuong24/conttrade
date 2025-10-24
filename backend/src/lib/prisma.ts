// @ts-nocheck
import { PrismaClient } from '@prisma/client';

// Global variable to prevent multiple instances in development
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:240499@localhost:5432/i_contexchange',
    },
  },
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;

