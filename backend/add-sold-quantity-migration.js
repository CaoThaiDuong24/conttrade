import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addSoldQuantity() {
  console.log('🔧 Adding sold_quantity field and updating constraint...\n');
  
  try {
    // Step 1: Add column
    console.log('Step 1: Adding sold_quantity column...');
    await prisma.$executeRaw`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS sold_quantity INT DEFAULT 0
    `;
    console.log('✅ Column added\n');
    
    // Step 2: Drop old constraint
    console.log('Step 2: Dropping old constraint...');
    await prisma.$executeRaw`
      ALTER TABLE listings 
      DROP CONSTRAINT IF EXISTS check_quantity_balance
    `;
    console.log('✅ Constraint dropped\n');
    
    // Step 3: Add new constraint with sold_quantity
    console.log('Step 3: Adding new constraint...');
    await prisma.$executeRaw`
      ALTER TABLE listings 
      ADD CONSTRAINT check_quantity_balance 
      CHECK (
        available_quantity >= 0 AND
        rented_quantity >= 0 AND
        reserved_quantity >= 0 AND
        maintenance_quantity >= 0 AND
        sold_quantity >= 0 AND
        total_quantity >= 0 AND
        (available_quantity + rented_quantity + reserved_quantity + maintenance_quantity + sold_quantity) = total_quantity
      )
    `;
    console.log('✅ New constraint added\n');
    
    // Step 4: Calculate sold_quantity from existing data
    console.log('Step 4: Calculating sold_quantity from container status...');
    const result = await prisma.$executeRaw`
      UPDATE listings l
      SET sold_quantity = (
        SELECT COUNT(*)
        FROM listing_containers lc
        WHERE lc.listing_id = l.id 
          AND lc.status = 'SOLD'
          AND lc.deleted_at IS NULL
      )
      WHERE l.id IN (
        SELECT DISTINCT listing_id 
        FROM listing_containers 
        WHERE status = 'SOLD' 
          AND deleted_at IS NULL
      )
    `;
    console.log(`✅ Updated ${result} listings\n`);
    
    // Step 5: Verify
    console.log('Step 5: Verifying data...');
    const listings = await prisma.$queryRaw`
      SELECT 
        id,
        title,
        total_quantity,
        available_quantity,
        reserved_quantity,
        rented_quantity,
        maintenance_quantity,
        sold_quantity,
        (available_quantity + reserved_quantity + rented_quantity + maintenance_quantity + sold_quantity) as calculated_total
      FROM listings
      WHERE sold_quantity > 0
    `;
    
    console.log('Listings with sold containers:');
    console.table(listings);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSoldQuantity();
