const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDashboardStats() {
  try {
    // Get all listings
    const allListings = await prisma.listings.findMany({
      select: { status: true }
    });
    
    // Count by status manually
    const listingsCount = allListings.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    // Get total RFQs
    const totalRfqs = await prisma.rfqs.count();
    
    // Get all RFQs
    const allRfqs = await prisma.rfqs.findMany({
      select: { status: true }
    });
    
    const rfqsCount = allRfqs.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Get all orders
    const allOrders = await prisma.orders.findMany({
      select: { status: true }
    });
    
    const ordersCount = allOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Get all deliveries
    const allDeliveries = await prisma.deliveries.findMany({
      select: { status: true }
    });
    
    const deliveriesCount = allDeliveries.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});

    // Get total users
    const totalUsers = await prisma.users.count();
    const activeUsers = await prisma.users.count({
      where: { status: 'active' }
    });

    console.log('\n=== DASHBOARD STATISTICS ===\n');
    
    console.log('LISTINGS BY STATUS:');
    Object.entries(listingsCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log(`  TOTAL: ${allListings.length}`);

    console.log('\nRFQs:');
    console.log(`  TOTAL: ${totalRfqs}`);
    Object.entries(rfqsCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\nORDERS BY STATUS:');
    Object.entries(ordersCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log(`  TOTAL: ${allOrders.length}`);

    console.log('\nDELIVERIES BY STATUS:');
    Object.entries(deliveriesCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log(`  TOTAL: ${allDeliveries.length}`);

    console.log('\nUSERS:');
    console.log(`  TOTAL: ${totalUsers}`);
    console.log(`  ACTIVE: ${activeUsers}`);

    console.log('\n=== END ===\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getDashboardStats();
