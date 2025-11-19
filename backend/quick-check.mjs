import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickCheck() {
  console.log('🔍 QUICK CHECK: RFQs for user-buyer\n');
  
  const count = await prisma.rfqs.count({
    where: { buyer_id: 'user-buyer' }
  });
  
  console.log(`Total RFQs for user-buyer: ${count}`);
  
  if (count > 0) {
    const rfqs = await prisma.rfqs.findMany({
      where: { buyer_id: 'user-buyer' },
      select: {
        id: true,
        status: true,
        submitted_at: true,
        expired_at: true,
        listings: {
          select: { title: true }
        }
      },
      orderBy: { submitted_at: 'desc' },
      take: 5
    });
    
    console.log('\nRecent 5 RFQs:');
    rfqs.forEach((r, i) => {
      const isExpired = new Date(r.expired_at) < new Date();
      console.log(`${i+1}. ${r.listings?.title?.substring(0, 40) || 'N/A'}`);
      console.log(`   Status: ${r.status} | Expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
    });
    
    console.log('\n✅ DATABASE HAS DATA!');
    console.log(`If frontend shows less than ${count} RFQs, the issue is:`);
    console.log('   1. Backend query is wrong');
    console.log('   2. Frontend is filtering data');
    console.log('   3. Response is not reaching frontend');
  }
  
  await prisma.$disconnect();
}

quickCheck();
