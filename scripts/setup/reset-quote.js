const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetQuoteStatus() {
  try {
    console.log('🔄 Resetting quote status to SUBMITTED...');
    
    const updatedQuote = await prisma.quotes.update({
      where: { id: '5bce72dd-00ce-4d70-87f4-6c6855372924' },
      data: { status: 'SUBMITTED' },
      select: {
        id: true,
        status: true
      }
    });
    
    console.log('✅ Quote status reset:', updatedQuote);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetQuoteStatus();