// Kiểm tra và phân tích dữ liệu RFQ
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeRFQData() {
  try {
    console.log('🔍 PHÂN TÍCH DỮ LIỆU RFQ...\n');
    
    // 1. Kiểm tra tất cả RFQs
    console.log('1️⃣ TỔNG QUAN RFQs:');
    const allRFQs = await prisma.rfqs.findMany({
      select: {
        id: true,
        listingId: true,
        buyerId: true,
        status: true,
        purpose: true,
        quantity: true,
        submittedAt: true,
        users: {
          select: {
            email: true,
            displayName: true
          }
        },
        listings: {
          select: {
            id: true,
            title: true,
            sellerUserId: true,
            users: {
              select: {
                email: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 10
    });
    
    console.log(`   Tổng số RFQs: ${allRFQs.length}`);
    
    allRFQs.forEach((rfq, index) => {
      console.log(`\n   ${index + 1}. RFQ ID: ${rfq.id}`);
      console.log(`      Buyer: ${rfq.users.email} (${rfq.users.displayName})`);
      console.log(`      Seller: ${rfq.listings.users.email} (${rfq.listings.users.displayName})`);
      console.log(`      Listing: ${rfq.listings.title}`);
      console.log(`      Status: ${rfq.status}`);
      console.log(`      Purpose: ${rfq.purpose}`);
      console.log(`      Quantity: ${rfq.quantity}`);
      console.log(`      Created: ${rfq.submittedAt}`);
    });
    
    // 2. Kiểm tra seller specific
    console.log('\n\n2️⃣ PHÂN TÍCH THEO SELLER:');
    const sellerEmail = 'seller@example.com';
    
    const seller = await prisma.users.findUnique({
      where: { email: sellerEmail },
      select: { id: true, displayName: true }
    });
    
    if (!seller) {
      console.log(`   ❌ Không tìm thấy seller: ${sellerEmail}`);
      return;
    }
    
    console.log(`   Seller: ${seller.displayName} (ID: ${seller.id})`);
    
    // Lấy listings của seller
    const sellerListings = await prisma.listings.findMany({
      where: { sellerUserId: seller.id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log(`   Listings của seller: ${sellerListings.length}`);
    sellerListings.forEach((listing, index) => {
      console.log(`      ${index + 1}. ${listing.title} (ID: ${listing.id}, Status: ${listing.status})`);
    });
    
    // Lấy RFQs cho listings của seller
    const listingIds = sellerListings.map(l => l.id);
    
    if (listingIds.length === 0) {
      console.log('   ❌ Seller không có listings nào!');
      return;
    }
    
    const rfqsForSeller = await prisma.rfqs.findMany({
      where: {
        listingId: { in: listingIds }
      },
      include: {
        users: {
          select: {
            email: true,
            displayName: true
          }
        },
        listings: {
          select: {
            title: true,
            status: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
    
    console.log(`\n   RFQs cho listings của seller: ${rfqsForSeller.length}`);
    
    if (rfqsForSeller.length === 0) {
      console.log('   ❌ KHÔNG CÓ RFQ NÀO CHO SELLER!');
      
      // Kiểm tra RFQs của buyer
      console.log('\n3️⃣ KIỂM TRA RFQs CỦA BUYER:');
      const buyerEmail = 'buyer@example.com';
      
      const buyer = await prisma.users.findUnique({
        where: { email: buyerEmail },
        select: { id: true }
      });
      
      if (buyer) {
        const buyerRFQs = await prisma.rfqs.findMany({
          where: { buyerId: buyer.id },
          include: {
            listings: {
              select: {
                title: true,
                sellerUserId: true,
                users: {
                  select: {
                    email: true,
                    displayName: true
                  }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        });
        
        console.log(`   Buyer đã tạo ${buyerRFQs.length} RFQs:`);
        
        buyerRFQs.forEach((rfq, index) => {
          console.log(`      ${index + 1}. Listing: ${rfq.listings.title}`);
          console.log(`         Seller: ${rfq.listings.users.email}`);
          console.log(`         Listing ID: ${rfq.listingId}`);
          console.log(`         RFQ Status: ${rfq.status}`);
          
          // Kiểm tra xem listing này có thuộc về seller không
          const belongsToSeller = listingIds.includes(rfq.listingId);
          console.log(`         Thuộc về seller? ${belongsToSeller ? '✅ YES' : '❌ NO'}`);
        });
      }
      
    } else {
      rfqsForSeller.forEach((rfq, index) => {
        console.log(`      ${index + 1}. Từ buyer: ${rfq.users.email}`);
        console.log(`         Listing: ${rfq.listings.title}`);
        console.log(`         Status: ${rfq.status}`);
        console.log(`         Quantity: ${rfq.quantity}`);
      });
    }
    
    // 4. Kiểm tra status filter
    console.log('\n\n4️⃣ KIỂM TRA STATUS FILTER:');
    const statusCounts = {};
    
    for (const rfq of allRFQs) {
      statusCounts[rfq.status] = (statusCounts[rfq.status] || 0) + 1;
    }
    
    console.log('   Phân bố status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });
    
    console.log('\n   API filter hiện tại: [submitted, pending, awaiting_response, active]');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeRFQData();