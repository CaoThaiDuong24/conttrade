import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding i-ContExchange database...');

  // 1. Create Roles & Permissions
  console.log('📋 Creating roles and permissions...');
  
  // Create all roles according to documentation
  const adminRole = await prisma.role.upsert({
    where: { code: 'RL-ADMIN' },
    update: {},
    create: { code: 'RL-ADMIN', name: 'Quản trị hệ thống' }
  });

  const buyerRole = await prisma.role.upsert({
    where: { code: 'RL-BUYER' },
    update: {},
    create: { code: 'RL-BUYER', name: 'Người mua/thuê' }
  });

  const sellerRole = await prisma.role.upsert({
    where: { code: 'RL-SELLER' },
    update: {},
    create: { code: 'RL-SELLER', name: 'Người bán/cho thuê' }
  });

  const depotManagerRole = await prisma.role.upsert({
    where: { code: 'RL-DEPOT-MANAGER' },
    update: {},
    create: { code: 'RL-DEPOT-MANAGER', name: 'Quản lý Depot' }
  });

  const moderatorRole = await prisma.role.upsert({
    where: { code: 'RL-MOD' },
    update: {},
    create: { code: 'RL-MOD', name: 'Kiểm duyệt viên' }
  });

  const configRole = await prisma.role.upsert({
    where: { code: 'RL-CONFIG' },
    update: {},
    create: { code: 'RL-CONFIG', name: 'Quản lý cấu hình' }
  });

  // Create permissions
  const permissions = [
    { code: 'PM-001', name: 'VIEW_PUBLIC_LISTINGS' },
    { code: 'PM-002', name: 'SEARCH_LISTINGS' },
    { code: 'PM-010', name: 'CREATE_LISTING' },
    { code: 'PM-011', name: 'EDIT_LISTING' },
    { code: 'PM-012', name: 'PUBLISH_LISTING' },
    { code: 'PM-070', name: 'ADMIN_REVIEW_LISTING' },
    { code: 'PM-071', name: 'ADMIN_MANAGE_USERS' },
    { code: 'PM-072', name: 'ADMIN_VIEW_DASHBOARD' },
    { code: 'PM-073', name: 'ADMIN_CONFIG_PRICING' }
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm
    });
  }

  console.log('✅ Created roles and permissions');

  // 2. Create test users
  console.log('👥 Creating test users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Hash different passwords for demo accounts
  const adminPassword = await bcrypt.hash('admin123', 10);
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const depotPassword = await bcrypt.hash('depot123', 10);
  const inspectorPassword = await bcrypt.hash('inspector123', 10);
  const operatorPassword = await bcrypt.hash('operator123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@i-contexchange.vn' },
    update: {},
    create: {
      email: 'admin@i-contexchange.vn',
      password: adminPassword,
      displayName: 'Quản trị viên hệ thống',
      status: 'active',
      kycStatus: 'verified'
    }
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      password: buyerPassword,
      displayName: 'Người mua container',
      phone: '+84901234567',
      status: 'active'
    }
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      password: sellerPassword,
      displayName: 'Người bán container',
      phone: '+84901234568',
      status: 'active'
    }
  });

  const depotUser = await prisma.user.upsert({
    where: { email: 'depot@example.com' },
    update: {},
    create: {
      email: 'depot@example.com',
      password: depotPassword,
      displayName: 'Quản lý Depot',
      phone: '+84901234569',
      status: 'active'
    }
  });

  const inspectorUser = await prisma.user.upsert({
    where: { email: 'inspector@example.com' },
    update: {},
    create: {
      email: 'inspector@example.com',
      password: inspectorPassword,
      displayName: 'Kiểm duyệt viên',
      phone: '+84901234570',
      status: 'active'
    }
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@example.com' },
    update: {},
    create: {
      email: 'operator@example.com',
      password: operatorPassword,
      displayName: 'Quản lý cấu hình',
      phone: '+84901234571',
      status: 'active'
    }
  });

  console.log('✅ Created test users');

  // 3. Assign user roles according to documentation
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: buyerUser.id, roleId: buyerRole.id } },
    update: {},
    create: { userId: buyerUser.id, roleId: buyerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: sellerUser.id, roleId: sellerRole.id } },
    update: {},
    create: { userId: sellerUser.id, roleId: sellerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: depotUser.id, roleId: depotManagerRole.id } },
    update: {},
    create: { userId: depotUser.id, roleId: depotManagerRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: inspectorUser.id, roleId: moderatorRole.id } },
    update: {},
    create: { userId: inspectorUser.id, roleId: moderatorRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: operatorUser.id, roleId: configRole.id } },
    update: {},
    create: { userId: operatorUser.id, roleId: configRole.id }
  });

  // 4. Create Organizations
  console.log('🏢 Creating organizations...');
  
  const org1 = await prisma.org.upsert({
    where: { id: 'org-saigon-container' },
    update: {},
    create: {
      id: 'org-saigon-container',
      name: 'Saigon Container Co.',
      taxCode: '0123456789',
      ownerUserId: sellerUser.id,
      kybStatus: 'verified'
    }
  });

  const org2 = await prisma.org.upsert({
    where: { id: 'org-vietnam-logistics' },
    update: {},
    create: {
      id: 'org-vietnam-logistics',
      name: 'Vietnam Logistics Ltd.',
      taxCode: '0987654321',
      ownerUserId: buyerUser.id,
      kybStatus: 'pending'
    }
  });

  console.log('✅ Created organizations');

  // 5. Create depots
  console.log('🏭 Creating depots...');
  
  const depot1 = await prisma.depot.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Depot Cat Lai',
      code: 'CAT_LAI',
      address: 'Khu vực cảng Cat Lai, TP.HCM',
      province: 'TP.HCM',
      capacityTeu: 5000,
      contact: {
        phone: '028-123-4567',
        email: 'catlai@depot.com',
        manager: 'Nguyễn Văn A'
      }
    }
  });

  const depot2 = await prisma.depot.upsert({
    where: { code: 'HAI_PHONG' },
    update: {},
    create: {
      name: 'Depot Hải Phong',
      code: 'HAI_PHONG', 
      address: 'Cảng Hải Phong, Hải Phong',
      province: 'Hải Phong',
      capacityTeu: 3000,
      contact: {
        phone: '0225-789-0123',
        email: 'haiphong@depot.com',
        manager: 'Trần Thị B'
      }
    }
  });

  const depot3 = await prisma.depot.upsert({
    where: { code: 'DA_NANG' },
    update: {},
    create: {
      name: 'Depot Đà Nẵng',
      code: 'DA_NANG',
      address: 'Cảng Tiên Sa, Đà Nẵng',
      province: 'Đà Nẵng',
      capacityTeu: 2000,
      contact: {
        phone: '0236-456-7890',
        email: 'danang@depot.com',
        manager: 'Lê Văn C'
      }
    }
  });

  console.log('✅ Created depots');

  // 6. Create containers
  console.log('📦 Creating containers...');
  
  const containers = [
    {
      serialNo: 'TCLU1234567',
      isoCode: '22G1',
      sizeFt: 20,
      type: 'DRY',
      condition: 'used',
      qualityStandard: 'CW',
      cscPlateNo: 'CSC-001-2023',
      manufacturedYear: 2020,
      currentDepotId: depot1.id,
      ownerOrgId: org1.id
    },
    {
      serialNo: 'MSKU9876543',
      isoCode: '42G1',
      sizeFt: 40,
      type: 'DRY',
      condition: 'used',
      qualityStandard: 'IICL',
      cscPlateNo: 'CSC-002-2021',
      manufacturedYear: 2018,
      currentDepotId: depot1.id,
      ownerOrgId: org1.id
    },
    {
      serialNo: 'CBHU5555555',
      isoCode: '45G1',
      sizeFt: 40,
      type: 'HC',
      condition: 'new',
      qualityStandard: 'WWT',
      cscPlateNo: 'CSC-003-2024',
      manufacturedYear: 2024,
      currentDepotId: depot2.id,
      ownerOrgId: org1.id
    },
    {
      serialNo: 'GESU1111111',
      isoCode: '22R1',
      sizeFt: 20,
      type: 'RF',
      condition: 'used',
      qualityStandard: 'CW',
      cscPlateNo: 'CSC-004-2019',
      manufacturedYear: 2019,
      currentDepotId: depot3.id
    }
  ];

  for (const containerData of containers) {
    await prisma.container.upsert({
      where: { serialNo: containerData.serialNo },
      update: {},
      create: containerData
    });
  }

  console.log('✅ Created containers');

  // 7. Create listings
  console.log('📋 Creating listings...');
  
  const listings = [
    {
      id: 'listing-001',
      containerId: (await prisma.container.findUnique({ where: { serialNo: 'TCLU1234567' } })).id,
      sellerUserId: sellerUser.id,
      orgId: org1.id,
      dealType: 'sale',
      title: '20ft DRY Container - Chất lượng tốt',
      description: 'Container 20ft DRY chất lượng tốt, đã qua kiểm tra CW standard. Tình trạng sử dụng bình thường, không có hư hỏng lớn.',
      priceAmount: 45000000,
      priceCurrency: 'VND',
      locationDepotId: depot1.id,
      status: 'active',
      views: 156
    },
    {
      id: 'listing-002',
      containerId: (await prisma.container.findUnique({ where: { serialNo: 'MSKU9876543' } })).id,
      sellerUserId: sellerUser.id,
      orgId: org1.id,
      dealType: 'sale',
      title: '40ft DRY Container - IICL Standard',
      description: 'Container 40ft DRY theo tiêu chuẩn IICL. Phù hợp cho vận chuyển hàng khô, có thể sử dụng ngay.',
      priceAmount: 75000000,
      priceCurrency: 'VND',
      locationDepotId: depot1.id,
      status: 'active',
      views: 89
    },
    {
      id: 'listing-003',
      containerId: (await prisma.container.findUnique({ where: { serialNo: 'CBHU5555555' } })).id,
      sellerUserId: sellerUser.id,
      orgId: org1.id,
      dealType: 'rental',
      title: '40ft High Cube - Container mới',
      description: 'Container 40ft High Cube hoàn toàn mới, sản xuất năm 2024. Tiêu chuẩn WWT cao cấp.',
      priceAmount: 8500000,
      priceCurrency: 'VND',
      rentalUnit: 'month',
      locationDepotId: depot2.id,
      status: 'active',
      views: 234
    },
    {
      id: 'listing-004',
      containerId: (await prisma.container.findUnique({ where: { serialNo: 'GESU1111111' } })).id,
      sellerUserId: sellerUser.id,
      dealType: 'sale',
      title: '20ft Reefer Container - Lạnh',
      description: 'Container lạnh 20ft, phù hợp vận chuyển hàng hóa cần bảo quản nhiệt độ. Máy lạnh hoạt động tốt.',
      priceAmount: 120000000,
      priceCurrency: 'VND',
      locationDepotId: depot3.id,
      status: 'pending_review',
      views: 45
    }
  ];

  for (const listingData of listings) {
    await prisma.listing.upsert({
      where: { id: listingData.id },
      update: {},
      create: listingData
    });
  }

  console.log('✅ Created listings');

  // 8. Create listing facets
  console.log('🏷️ Creating listing facets...');
  
  const facetsData = [
    { listingId: 'listing-001', facets: { size: '20ft', type: 'DRY', standard: 'CW', condition: 'used', manufacturer: 'TCLU' } },
    { listingId: 'listing-002', facets: { size: '40ft', type: 'DRY', standard: 'IICL', condition: 'used', manufacturer: 'MSKU' } },
    { listingId: 'listing-003', facets: { size: '40ft', type: 'HC', standard: 'WWT', condition: 'new', manufacturer: 'CBHU' } },
    { listingId: 'listing-004', facets: { size: '20ft', type: 'RF', standard: 'CW', condition: 'used', manufacturer: 'GESU' } }
  ];

  for (const { listingId, facets } of facetsData) {
    for (const [key, value] of Object.entries(facets)) {
      const existingFacet = await prisma.listingFacet.findFirst({
        where: { listingId, key }
      });

      if (!existingFacet) {
        await prisma.listingFacet.create({
          data: { listingId, key, value }
        });
      }
    }
  }

  console.log('✅ Created listing facets');

  // 9. Create Plans and Subscriptions
  console.log('💳 Creating plans...');
  
  const basicPlan = await prisma.plan.upsert({
    where: { code: 'basic' },
    update: {},
    create: {
      code: 'basic',
      name: 'Gói Cơ Bản',
      price: 500000,
      cycle: 'monthly',
      features: {
        maxListings: 10,
        featuredListings: 2,
        support: 'email'
      }
    }
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: 'pro' },
    update: {},
    create: {
      code: 'pro',
      name: 'Gói Chuyên Nghiệp',
      price: 1500000,
      cycle: 'monthly',
      features: {
        maxListings: 50,
        featuredListings: 10,
        support: 'phone',
        analytics: true
      }
    }
  });

  console.log('✅ Created plans');

  // 10. Create sample RFQ and Quotes
  console.log('💬 Creating RFQs and Quotes...');
  
  const rfq1 = await prisma.rFQ.create({
    data: {
      listingId: 'listing-001',
      buyerId: buyerUser.id,
      purpose: 'Vận chuyển hàng xuất khẩu',
      quantity: 2,
      needBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      servicesJson: {
        inspection: true,
        delivery: true,
        insurance: false
      },
      status: 'submitted'
    }
  });

  const quote1 = await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      sellerId: sellerUser.id,
      priceSubtotal: 90000000, // 2 containers x 45M
      feesJson: {
        inspection: 2000000,
        delivery: 5000000
      },
      total: 97000000,
      currency: 'VND',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'sent'
    }
  });

  console.log('✅ Created RFQs and quotes');

  // 11. Create sample settings
  console.log('⚙️ Creating system settings...');
  
  const settings = [
    { key: 'site_name', value: 'i-ContExchange' },
    { key: 'default_currency', value: 'VND' },
    { key: 'admin_email', value: 'admin@i-contexchange.vn' },
    { key: 'max_listing_images', value: '10' },
    { key: 'listing_expiry_days', value: '90' }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }

  console.log('✅ Created system settings');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('- Users: 6 (admin, buyer, seller, depot, inspector, operator)');
  console.log('- Organizations: 2');
  console.log('- Depots: 3 (Cat Lai, Hải Phong, Đà Nẵng)');
  console.log('- Containers: 4 (various sizes and types)');
  console.log('- Listings: 4 (with facets)');
  console.log('- Plans: 2 (Basic, Pro)');
  console.log('- RFQs & Quotes: 1 each');
  console.log('');
  console.log('🔑 Demo accounts (matching login page):');
  console.log('- 👑 Admin: admin@i-contexchange.vn / admin123');
  console.log('- 🛒 Buyer: buyer@example.com / buyer123');
  console.log('- 💰 Seller: seller@example.com / seller123');
  console.log('- 🏭 Depot: depot@example.com / depot123');
  console.log('- 🔍 Inspector: inspector@example.com / inspector123');
  console.log('- ⚙️ Operator: operator@example.com / operator123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });