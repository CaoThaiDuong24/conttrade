import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Business Data for i-ContExchange...\n');

  try {
    // 1. Create Organizations
    console.log('🏢 Creating organizations...');
    
    const org1 = await prisma.orgs.create({
      data: {
        id: 'org-saigon-container',
        name: 'Saigon Container Co.',
        tax_code: '0123456789',
        business_license: 'BL123456',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const org2 = await prisma.orgs.create({
      data: {
        id: 'org-vietnam-logistics',
        name: 'Vietnam Logistics Ltd.',
        tax_code: '0987654321',
        business_license: 'BL987654',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Created 2 organizations\n');

    // 2. Create depots
    console.log('🏭 Creating depots...');
    
    const depot1 = await prisma.depots.create({
      data: {
        id: 'depot-cat-lai',
        name: 'Depot Cat Lai',
        code: 'CAT_LAI',
        address: 'Khu vực cảng Cat Lai, TP.HCM',
        province: 'TP.HCM',
        capacity_teu: 5000,
        contact: {
          phone: '028-123-4567',
          email: 'catlai@depot.com',
          manager: 'Nguyễn Văn A'
        },
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const depot2 = await prisma.depots.create({
      data: {
        id: 'depot-hai-phong',
        name: 'Depot Hải Phòng',
        code: 'HAI_PHONG',
        address: 'Cảng Hải Phòng, Hải Phòng',
        province: 'Hải Phòng',
        capacity_teu: 3000,
        contact: {
          phone: '0225-789-0123',
          email: 'haiphong@depot.com',
          manager: 'Trần Thị B'
        },
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const depot3 = await prisma.depots.create({
      data: {
        id: 'depot-da-nang',
        name: 'Depot Đà Nẵng',
        code: 'DA_NANG',
        address: 'Cảng Tiên Sa, Đà Nẵng',
        province: 'Đà Nẵng',
        capacity_teu: 2000,
        contact: {
          phone: '0236-456-7890',
          email: 'danang@depot.com',
          manager: 'Lê Văn C'
        },
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Created 3 depots\n');

    // 3. Create containers
    console.log('📦 Creating containers...');
    
    const containers = [
      {
        id: 'container-tclu1234567',
        serial_no: 'TCLU1234567',
        iso_code: '22G1',
        size_ft: 20,
        type: 'DRY',
        condition: 'USED',
        quality_standard: 'CW',
        csc_plate_no: 'CSC-001-2023',
        manufactured_year: 2020,
        current_depot_id: depot1.id,
        owner_org_id: org1.id,
        status: 'AVAILABLE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'container-msku9876543',
        serial_no: 'MSKU9876543',
        iso_code: '42G1',
        size_ft: 40,
        type: 'DRY',
        condition: 'USED',
        quality_standard: 'IICL',
        csc_plate_no: 'CSC-002-2021',
        manufactured_year: 2018,
        current_depot_id: depot1.id,
        owner_org_id: org1.id,
        status: 'AVAILABLE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'container-cbhu5555555',
        serial_no: 'CBHU5555555',
        iso_code: '45G1',
        size_ft: 40,
        type: 'HC',
        condition: 'NEW',
        quality_standard: 'WWT',
        csc_plate_no: 'CSC-003-2024',
        manufactured_year: 2024,
        current_depot_id: depot2.id,
        owner_org_id: org1.id,
        status: 'AVAILABLE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'container-gesu1111111',
        serial_no: 'GESU1111111',
        iso_code: '22R1',
        size_ft: 20,
        type: 'RF',
        condition: 'USED',
        quality_standard: 'CW',
        csc_plate_no: 'CSC-004-2019',
        manufactured_year: 2019,
        current_depot_id: depot3.id,
        status: 'AVAILABLE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const containerData of containers) {
      await prisma.containers.create({
        data: containerData
      });
    }

    console.log('✅ Created 4 containers\n');

    // 4. Create listings
    console.log('📋 Creating listings...');
    
    // Get seller user
    const sellerUser = await prisma.users.findFirst({
      where: { email: 'seller@example.com' }
    });

    if (sellerUser) {
      const listings = [
        {
          id: 'listing-001',
          container_id: 'container-tclu1234567',
          seller_user_id: sellerUser.id,
          org_id: org1.id,
          deal_type: 'SALE',
          title: '20ft DRY Container - Chất lượng tốt',
          description: 'Container 20ft DRY chất lượng tốt, đã qua kiểm tra CW standard.',
          price_amount: 45000000,
          price_currency: 'VND',
          location_depot_id: depot1.id,
          status: 'ACTIVE',
          view_count: 156,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'listing-002',
          container_id: 'container-msku9876543',
          seller_user_id: sellerUser.id,
          org_id: org1.id,
          deal_type: 'SALE',
          title: '40ft DRY Container - IICL Standard',
          description: 'Container 40ft DRY theo tiêu chuẩn IICL.',
          price_amount: 75000000,
          price_currency: 'VND',
          location_depot_id: depot1.id,
          status: 'ACTIVE',
          view_count: 89,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'listing-003',
          container_id: 'container-cbhu5555555',
          seller_user_id: sellerUser.id,
          org_id: org1.id,
          deal_type: 'RENTAL',
          title: '40ft High Cube - Container mới',
          description: 'Container 40ft High Cube hoàn toàn mới.',
          price_amount: 8500000,
          price_currency: 'VND',
          rental_unit: 'MONTHLY',
          location_depot_id: depot2.id,
          status: 'ACTIVE',
          view_count: 234,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'listing-004',
          container_id: 'container-gesu1111111',
          seller_user_id: sellerUser.id,
          deal_type: 'SALE',
          title: '20ft Reefer Container - Lạnh',
          description: 'Container lạnh 20ft, máy lạnh hoạt động tốt.',
          price_amount: 120000000,
          price_currency: 'VND',
          location_depot_id: depot3.id,
          status: 'PENDING_REVIEW',
          view_count: 45,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      for (const listingData of listings) {
        await prisma.listings.create({
          data: listingData
        });
      }

      console.log('✅ Created 4 listings\n');
    }

    // 5. Create Plans
    console.log('💳 Creating subscription plans...');
    
    await prisma.plans.create({
      data: {
        id: 'plan-basic',
        code: 'basic',
        name: 'Gói Cơ Bản',
        price_amount: 500000,
        price_currency: 'VND',
        billing_cycle: 'MONTHLY',
        features: {
          maxListings: 10,
          featuredListings: 2,
          support: 'email'
        },
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    await prisma.plans.create({
      data: {
        id: 'plan-pro',
        code: 'pro',
        name: 'Gói Chuyên Nghiệp',
        price_amount: 1500000,
        price_currency: 'VND',
        billing_cycle: 'MONTHLY',
        features: {
          maxListings: 50,
          featuredListings: 10,
          support: 'phone',
          analytics: true
        },
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Created 2 plans\n');

    // 6. Create sample settings
    console.log('⚙️ Creating system settings...');
    
    const settings = [
      { id: 'setting-site-name', key: 'site_name', value: 'i-ContExchange' },
      { id: 'setting-currency', key: 'default_currency', value: 'VND' },
      { id: 'setting-admin-email', key: 'admin_email', value: 'admin@i-contexchange.vn' },
      { id: 'setting-max-images', key: 'max_listing_images', value: '10' },
      { id: 'setting-expiry', key: 'listing_expiry_days', value: '90' }
    ];

    for (const setting of settings) {
      await prisma.settings.create({
        data: {
          ...setting,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    console.log('✅ Created 5 system settings\n');

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ BUSINESS DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Summary:');
    console.log('   Organizations: 2');
    console.log('   Depots: 3 (Cat Lai, Hải Phòng, Đà Nẵng)');
    console.log('   Containers: 4 (various sizes and types)');
    console.log('   Listings: 4 (with pricing)');
    console.log('   Plans: 2 (Basic, Pro)');
    console.log('   Settings: 5 system configurations');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Database is ready for testing!');

  } catch (error) {
    console.error('❌ Error seeding business data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  });