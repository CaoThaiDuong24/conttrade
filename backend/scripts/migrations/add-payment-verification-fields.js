// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding payment verification fields...\n');

  try {
    // 1. Add PAYMENT_PENDING_VERIFICATION to OrderStatus enum if not exists
    console.log('Step 1: Adding PAYMENT_PENDING_VERIFICATION to OrderStatus enum...');
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'PAYMENT_PENDING_VERIFICATION' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
        ) THEN
          ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_PENDING_VERIFICATION' AFTER 'PENDING_PAYMENT';
          RAISE NOTICE 'Added PAYMENT_PENDING_VERIFICATION to OrderStatus enum';
        ELSE
          RAISE NOTICE 'PAYMENT_PENDING_VERIFICATION already exists in OrderStatus enum';
        END IF;
      END $$;
    `);
    console.log('✅ Step 1 complete\n');

    // 2. Add payment_verified_at column to orders table
    console.log('Step 2: Adding payment_verified_at column to orders table...');
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'orders' 
          AND column_name = 'payment_verified_at'
        ) THEN
          ALTER TABLE orders ADD COLUMN payment_verified_at TIMESTAMP(3);
          RAISE NOTICE 'Added payment_verified_at column to orders table';
        ELSE
          RAISE NOTICE 'payment_verified_at column already exists in orders table';
        END IF;
      END $$;
    `);
    console.log('✅ Step 2 complete\n');

    // 3. Add verified_at, verified_by, notes columns to payments table
    console.log('Step 3: Adding verification columns to payments table...');
    
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' 
          AND column_name = 'verified_at'
        ) THEN
          ALTER TABLE payments ADD COLUMN verified_at TIMESTAMP(3);
          RAISE NOTICE 'Added verified_at column to payments table';
        ELSE
          RAISE NOTICE 'verified_at column already exists in payments table';
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' 
          AND column_name = 'verified_by'
        ) THEN
          ALTER TABLE payments ADD COLUMN verified_by TEXT;
          RAISE NOTICE 'Added verified_by column to payments table';
        ELSE
          RAISE NOTICE 'verified_by column already exists in payments table';
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' 
          AND column_name = 'notes'
        ) THEN
          ALTER TABLE payments ADD COLUMN notes TEXT;
          RAISE NOTICE 'Added notes column to payments table';
        ELSE
          RAISE NOTICE 'notes column already exists in payments table';
        END IF;
      END $$;
    `);
    
    console.log('✅ Step 3 complete\n');

    console.log('🎉 All payment verification fields added successfully!');
    console.log('\n📝 Summary:');
    console.log('  ✅ Added PAYMENT_PENDING_VERIFICATION to OrderStatus enum');
    console.log('  ✅ Added payment_verified_at to orders table');
    console.log('  ✅ Added verified_at, verified_by, notes to payments table');
    console.log('\n💡 Next steps:');
    console.log('  1. Run: npx prisma generate');
    console.log('  2. Test payment verification flow with POST /api/v1/orders/:id/payment-verify');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
