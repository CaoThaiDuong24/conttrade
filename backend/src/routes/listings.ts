// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import MasterDataService from '../lib/master-data.js';
import { isValidListingStatus } from '../lib/listing-status-validation.js';

export default async function listingRoutes(fastify: FastifyInstance) {
  // B-001: POST /listings - Tạo tin đăng mới
  fastify.post('/', {
    preHandler: async (request, reply) => {
      try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // Manually verify JWT
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          // Try default jwtVerify (cookies, etc.)
          await request.jwtVerify();
        }

        // ✅ FIX: Seller role tự động có quyền đăng tin (không cần permission riêng)
        // Buyer cũng có thể đăng tin nếu được gán permission CREATE_LISTING (PM-010)
        const userRoles = (request.user as any).roles || [];
        const userPermissions = (request.user as any).permissions || [];
        
        // Allow if user is seller OR has CREATE_LISTING permission (PM-010)
        const isSeller = userRoles.includes('seller');
        const hasPermission = userPermissions.includes('PM-010'); // ✅ FIX: Check by permission code PM-010
        
        console.log('🔍 Permission check:', { 
          userRoles, 
          userPermissions,
          isSeller, 
          hasPermission,
          userId: (request.user as any).userId 
        });
        
        if (!isSeller && !hasPermission) {
          return reply.status(403).send({
            success: false,
            message: 'Bạn không có quyền tạo tin đăng. Vui lòng liên hệ quản trị viên để được cấp quyền.',
            code: 'PERMISSION_DENIED',
            requiredPermission: 'CREATE_LISTING (PM-010) hoặc seller role'
          });
        }
        
        console.log('✅ Access granted:', { 
          isSeller, 
          hasPermission, 
          userId: (request.user as any).userId 
        });
      } catch (err) {
        console.log('JWT verification error:', err.message);
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      console.log('=== CREATE LISTING DEBUG ===');
      console.log('Request body:', JSON.stringify(request.body, null, 2));
      console.log('User from JWT:', request.user);
      
      const {
        dealType: rawDealType,
        title,
        description,
        priceAmount,
        priceCurrency,
        locationDepotId,
        rentalUnit,
        facets,
        containerIds, // 🆕 NEW: Array of container IDs from frontend
        // ✅ NEW: Rental management fields
        totalQuantity,
        availableQuantity,
        maintenanceQuantity,
        minRentalDuration,
        maxRentalDuration,
        depositRequired,
        depositAmount,
        depositCurrency,
        lateReturnFeeAmount,
        lateReturnFeeUnit,
        earliestAvailableDate,
        latestReturnDate,
        autoRenewalEnabled,
        renewalNoticeDays,
        renewalPriceAdjustment
      } = request.body as any;

      // ✅ FIX: Map "LEASE" to "RENTAL" for Prisma compatibility
      // Prisma enum DealType only supports: SALE, RENTAL
      // But frontend/UI may use "LEASE" for long-term rental
      const dealType = rawDealType === 'LEASE' ? 'RENTAL' : rawDealType;

      const userId = (request.user as any).userId;
      console.log('User ID:', userId);
      console.log('Rental Unit:', rentalUnit);
      console.log('=== RECEIVED DATA ===');
      console.log('Raw Deal Type:', rawDealType);
      console.log('Mapped Deal Type:', dealType);
      console.log('Quantity fields:', {
        totalQuantity,
        availableQuantity,
        maintenanceQuantity,
        types: {
          totalQuantity: typeof totalQuantity,
          availableQuantity: typeof availableQuantity,
          maintenanceQuantity: typeof maintenanceQuantity
        }
      });
      console.log('=====================');

      // Validate required fields
      if (!dealType || !priceAmount || !title || !locationDepotId) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: dealType, priceAmount, title, locationDepotId'
        });
      }

      // ✅ Validate quantity fields (REQUIRED for all deal types)
      const total = totalQuantity !== undefined && totalQuantity !== null ? Number(totalQuantity) : 1;
      const available = availableQuantity !== undefined && availableQuantity !== null ? Number(availableQuantity) : 1;
      const maintenance = maintenanceQuantity !== undefined && maintenanceQuantity !== null ? Number(maintenanceQuantity) : 0;
      const rented = 0; // Always 0 for new listings
      const reserved = 0; // Always 0 for new listings

      // Basic quantity validations
      if (isNaN(total) || total < 1) {
        return reply.status(400).send({
          success: false,
          message: 'Total quantity must be a valid number and at least 1'
        });
      }

      if (isNaN(available) || available < 0) {
        return reply.status(400).send({
          success: false,
          message: 'Available quantity must be a valid number and cannot be negative'
        });
      }

      if (isNaN(maintenance) || maintenance < 0) {
        return reply.status(400).send({
          success: false,
          message: 'Maintenance quantity must be a valid number and cannot be negative'
        });
      }

      if (available > total) {
        return reply.status(400).send({
          success: false,
          message: 'Available quantity cannot exceed total quantity'
        });
      }

      if (available + maintenance + rented + reserved !== total) {
        return reply.status(400).send({
          success: false,
          message: `Quantity allocation mismatch: available(${available}) + maintenance(${maintenance}) + rented(${rented}) + reserved(${reserved}) must equal total(${total})`
        });
      }

      // ✅ Additional validations specific to RENTAL/LEASE
      if (dealType === 'RENTAL' || dealType === 'LEASE') {

        // Validate duration constraints
        if (minRentalDuration && minRentalDuration < 1) {
          return reply.status(400).send({
            success: false,
            message: 'Minimum rental duration must be at least 1'
          });
        }

        if (maxRentalDuration && maxRentalDuration < 1) {
          return reply.status(400).send({
            success: false,
            message: 'Maximum rental duration must be at least 1'
          });
        }

        if (minRentalDuration && maxRentalDuration && minRentalDuration > maxRentalDuration) {
          return reply.status(400).send({
            success: false,
            message: 'Minimum rental duration cannot exceed maximum rental duration'
          });
        }

        // Validate deposit
        if (depositRequired) {
          if (!depositAmount || depositAmount <= 0) {
            return reply.status(400).send({
              success: false,
              message: 'Deposit amount is required and must be greater than 0 when deposit is enabled'
            });
          }
          if (!depositCurrency) {
            return reply.status(400).send({
              success: false,
              message: 'Deposit currency is required when deposit is enabled'
            });
          }
        }

        // Validate dates
        if (earliestAvailableDate && latestReturnDate) {
          const earliest = new Date(earliestAvailableDate);
          const latest = new Date(latestReturnDate);
          if (earliest >= latest) {
            return reply.status(400).send({
              success: false,
              message: 'Earliest available date must be before latest return date'
            });
          }
        }
      }

      // Validate dealType từ master data
      const isDealTypeValid = await MasterDataService.validateDealType(dealType);
      if (!isDealTypeValid) {
        return reply.status(400).send({
          success: false,
          message: `Deal type '${dealType}' không hợp lệ. Vui lòng chọn từ danh sách deal types.`
        });
      }

      // Validate currency từ master data
      const currency = priceCurrency || 'VND';
      const isCurrencyValid = await MasterDataService.validateCurrency(currency);
      if (!isCurrencyValid) {
        return reply.status(400).send({
          success: false,
          message: `Currency '${currency}' không hợp lệ hoặc không active.`
        });
      }

      // Create listing
      console.log('=== ABOUT TO CREATE LISTING ===');
      console.log('Data for Prisma:', {
        seller_user_id: userId,
        deal_type: dealType,
        price_currency: currency,
        price_amount: Number(priceAmount),
        rental_unit: rentalUnit || null,
        title: title,
        total_quantity: total,
        available_quantity: available,
        maintenance_quantity: maintenance,
        deposit_required: depositRequired || false,
        deposit_amount: depositAmount ? Number(depositAmount) : null,
      });
      
      let listing;
      try {
        listing = await prisma.listings.create({
          data: {
            id: randomUUID(),
            seller_user_id: userId,
            deal_type: dealType,
            price_currency: currency,
            price_amount: new Prisma.Decimal(Number(priceAmount)),
            rental_unit: rentalUnit || null,  // Save rental_unit if provided
            title: title,
            description: description || null,
            location_depot_id: locationDepotId,
            status: 'PENDING_REVIEW',
            updated_at: new Date(),
            
            // ✅ Rental management fields (using validated values)
            total_quantity: total,
            available_quantity: available,
            rented_quantity: rented,
            reserved_quantity: reserved,
            maintenance_quantity: maintenance,
            min_rental_duration: minRentalDuration && Number(minRentalDuration) > 0 ? Number(minRentalDuration) : null,
            max_rental_duration: maxRentalDuration && Number(maxRentalDuration) > 0 ? Number(maxRentalDuration) : null,
            deposit_required: depositRequired || false,
            deposit_amount: depositAmount ? new Prisma.Decimal(Number(depositAmount)) : null,
            deposit_currency: depositCurrency || null,
            late_return_fee_amount: lateReturnFeeAmount ? new Prisma.Decimal(Number(lateReturnFeeAmount)) : null,
            late_return_fee_unit: lateReturnFeeUnit || null,
            earliest_available_date: earliestAvailableDate ? new Date(earliestAvailableDate) : null,
            latest_return_date: latestReturnDate ? new Date(latestReturnDate) : null,
            auto_renewal_enabled: autoRenewalEnabled || false,
            renewal_notice_days: renewalNoticeDays ? Number(renewalNoticeDays) : 7,
            renewal_price_adjustment: renewalPriceAdjustment && Number(renewalPriceAdjustment) !== 0 ? new Prisma.Decimal(Number(renewalPriceAdjustment)) : new Prisma.Decimal(0),
            total_rental_count: 0
          }
        });
        console.log('=== LISTING CREATED SUCCESSFULLY ===');
        console.log('Listing ID:', listing.id);
      } catch (prismaError: any) {
        console.error('=== PRISMA CREATE ERROR ===');
        console.error('Error name:', prismaError.name);
        console.error('Error message:', prismaError.message);
        console.error('Error code:', prismaError.code);
        console.error('Error meta:', JSON.stringify(prismaError.meta, null, 2));
        console.error('Full error:', prismaError);
        throw prismaError; // Re-throw để catch bên ngoài xử lý
      }

      // Create facets if provided
      if (facets && Object.keys(facets).length > 0) {
        await prisma.listing_facets.createMany({
          data: Object.entries(facets).map(([key, value]) => ({
            id: randomUUID(),
            listing_id: listing.id,
            key: key,
            value: String(value)
          }))
        });
      }

      // 🆕 NEW: Create listing_containers if containerIds provided
      if (containerIds && Array.isArray(containerIds) && containerIds.length > 0) {
        console.log('=== CREATING LISTING CONTAINERS ===');
        console.log('Container IDs to create:', containerIds);
        
        try {
          const containerRecords = containerIds.map((container: any) => {
            const containerId = typeof container === 'string' ? container : container.id;
            const shippingLine = typeof container === 'object' ? container.shippingLine : null;
            const manufacturedYear = typeof container === 'object' ? container.manufacturedYear : null;
            
            return {
              id: randomUUID(),
              listing_id: listing.id,
              container_iso_code: containerId.toUpperCase().trim(),
              shipping_line: shippingLine?.trim() || null,
              manufactured_year: manufacturedYear ? Number(manufacturedYear) : null,
              status: 'AVAILABLE',
              created_at: new Date(),
              updated_at: new Date()
            };
          });
          
          await prisma.listing_containers.createMany({
            data: containerRecords
          });
          
          console.log(`✅ Created ${containerRecords.length} container records`);
        } catch (containerError: any) {
          console.error('=== ERROR CREATING LISTING CONTAINERS ===');
          console.error('Error:', containerError);
          
          // Không fail toàn bộ listing, chỉ log warning
          // Vì containerIds là optional feature
          fastify.log.warn({
            error: containerError,
            listingId: listing.id,
            containerIds: containerIds
          }, 'Failed to create listing containers');
        }
      }

      return reply.send({
        success: true,
        data: { listing }
      });
    } catch (error: any) {
      console.error('=== CREATE LISTING ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log Prisma-specific errors with more details
      if (error.code) {
        console.error('Prisma error code:', error.code);
      }
      if (error.meta) {
        console.error('Prisma meta:', JSON.stringify(error.meta, null, 2));
      }
      if (error.clientVersion) {
        console.error('Prisma client version:', error.clientVersion);
      }
      
      // Log the full error object
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      fastify.log.error('Create listing error:', error);
      
      // Return more detailed error message
      let errorMessage = 'Lỗi hệ thống';
      if (error.message) {
        errorMessage = error.message;
      }
      
      return reply.status(500).send({ 
        success: false, 
        message: errorMessage,
        error: error.message,
        code: error.code || undefined,
        details: error.meta || undefined
      });
    }
  });

  // B-002: GET /listings - Lấy danh sách tin đăng
  fastify.get('/', async (request, reply) => {
    try {
      console.log('=== GET LISTINGS DEBUG ===');
      console.log('Query params:', request.query);
      
      const {
        page = 1,
        limit = 20,
        status,
        dealType,
        sizeFt,
        condition,
        locationDepotId,
        minPrice,
        maxPrice,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search,
        q,
        my  // Filter by current user's listings
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      // ✅ Filter by current user if 'my' parameter is true
      if (my === 'true' || my === true) {
        try {
          await request.jwtVerify();
          const userId = (request.user as any).userId;
          where.seller_user_id = userId;
          // Show all statuses for user's own listings
        } catch (err) {
          // If not authenticated, return empty list
          return reply.send({
            success: true,
            data: {
              listings: [],
              pagination: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 }
            }
          });
        }
      } else {
        // Theo tài liệu: Public chỉ xem listings đã APPROVED (ACTIVE status)
        // Admin/Seller có thể xem các status khác thông qua API riêng
        if (status) {
          // Validate status value
          if (!isValidListingStatus(status)) {
            return reply.status(400).send({
              success: false,
              message: `Invalid status value: ${status}. Must be one of: DRAFT, PENDING_REVIEW, ACTIVE, PAUSED, SOLD, RENTED, ARCHIVED, REJECTED`
            });
          }
          
          // Theo tài liệu: Chỉ cho phép filter theo ACTIVE status cho public
          if (status !== 'ACTIVE') {
            return reply.status(403).send({
              success: false,
              message: 'Public can only view ACTIVE listings. Use authenticated routes for other statuses.'
            });
          }
          
          where.status = status;
        } else {
          // Default: Chỉ hiển thị listings đã duyệt cho public
          where.status = 'ACTIVE';
        }
        
        // ✅ ẨN LISTING HẾT HÀNG: Chỉ hiển thị listings còn hàng
        where.available_quantity = { gt: 0 };
      }

      // Apply deal type filter
      if (dealType) {
        where.deal_type = dealType as any;
      }
      
      if (locationDepotId) where.location_depot_id = locationDepotId;
      
      if (minPrice || maxPrice) {
        where.price_amount = {};
        if (minPrice) where.price_amount.gte = Number(minPrice);
        if (maxPrice) where.price_amount.lte = Number(maxPrice);
      }
      
      const searchTerm = search || q;
      if (searchTerm) {
        where.OR = [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      console.log('Where clause:', JSON.stringify(where, null, 2));

      const [listings, total] = await Promise.all([
        prisma.listings.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy]: sortOrder },
          include: {
            depots: {
              select: {
                id: true,
                name: true,
                province: true,
                address: true
              }
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true
              }
            },
            listing_facets: true,
            listing_media: {
              select: {
                id: true,
                media_url: true,
                media_type: true
              }
            }
          }
        }),
        prisma.listings.count({ where })
      ]);

      // Thêm thông tin status tiếng Việt
      const listingsWithStatusNames = await Promise.all(
        listings.map(async (listing) => {
          const statusInfo = await prisma.md_listing_statuses.findFirst({
            where: { code: listing.status },
            select: { name: true, description: true }
          });
          
          return {
            ...listing,
            status_info: statusInfo ? {
              code: listing.status,
              name: statusInfo.name,
              description: statusInfo.description
            } : {
              code: listing.status,
              name: listing.status,
              description: null
            }
          };
        })
      );

      console.log('Found listings:', listings.length);
      console.log('Total count:', total);

      return reply.send({
        success: true,
        data: {
          listings: listingsWithStatusNames,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Get listings error:', error);
      console.error('=== GET LISTINGS ERROR ===');
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error full:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // B-009: GET /listings/my - Lấy danh sách tin đăng của tôi (ĐẶT TRƯỚC /:id)
  fastify.get('/my', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 20,
        status
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const userId = (request.user as any).userId;

      const where: any = {
        seller_user_id: userId
      };

      if (status) where.status = status;

      const [listings, total] = await Promise.all([
        prisma.listings.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: {
            containers: true,
            depots: true,
            listing_media: true,
            listing_facets: true,
            _count: {
              select: {
                rfqs: true,
                orders: true
              }
            }
          }
        }),
        prisma.listings.count({ where })
      ]);

      // Thêm thông tin status tiếng Việt cho my listings
      const myListingsWithStatusNames = await Promise.all(
        listings.map(async (listing) => {
          const statusInfo = await prisma.md_listing_statuses.findFirst({
            where: { code: listing.status },
            select: { name: true, description: true }
          });
          
          return {
            ...listing,
            status_info: statusInfo ? {
              code: listing.status,
              name: statusInfo.name,
              description: statusInfo.description
            } : {
              code: listing.status,
              name: listing.status,
              description: null
            }
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          listings: myListingsWithStatusNames,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Get my listings error:', error);
      console.error('Get my listings error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-003: GET /listings/:id - Lấy chi tiết tin đăng
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      const listing = await prisma.listings.findUnique({
        where: { id },
        include: {
          containers: {
            include: {
              depots: true,
              orgs: true
            }
          },
          depots: true,
          users: {
            include: {
              org_users: true  // Will include all orgUser fields at runtime
            }
          },
          orgs: true,
          listing_media: true,
          listing_facets: true
          // rfqs: {
          //   include: {
          //     buyer: {
          //       select: {
          //         id: true,
          //         displayName: true
          //       }
          //     }
          //   }
          // }
        }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      // Thêm thông tin status tiếng Việt cho listing detail
      const statusInfo = await prisma.md_listing_statuses.findFirst({
        where: { code: listing.status },
        select: { name: true, description: true }
      });

      const listingWithStatusInfo = {
        ...listing,
        status_info: statusInfo ? {
          code: listing.status,
          name: statusInfo.name,
          description: statusInfo.description
        } : {
          code: listing.status,
          name: listing.status,
          description: null
        }
      };

      return reply.send({
        success: true,
        data: { listing: listingWithStatusInfo }
      });
    } catch (error: any) {
      fastify.log.error('Get listing detail error:', error);
      console.error('Get listing detail error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-003b: POST /listings/:id/view - Tăng view count
  fastify.post('/:id/view', async (request, reply) => {
    try {
      const { id } = request.params as any;

      // Kiểm tra listing có tồn tại không
      const listing = await prisma.listings.findUnique({
        where: { id },
        select: { id: true, views: true }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      // Tăng view count
      await prisma.listings.update({
        where: { id },
        data: { 
          views: (listing.views || 0) + 1 
        }
      });

      return reply.send({
        success: true,
        data: { views: (listing.views || 0) + 1 }
      });
    } catch (error: any) {
      fastify.log.error('Increment view count error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Không thể tăng view count' 
      });
    }
  });

  // B-004: PUT /listings/:id - Cập nhật tin đăng
  fastify.put('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;

      // Kiểm tra quyền sở hữu
      const listing = await prisma.listings.findUnique({
        where: { id }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      const userId = (request.user as any).userId;
      if (listing.seller_user_id !== userId) {
        return reply.status(403).send({ 
          success: false, 
          message: 'Không có quyền chỉnh sửa tin đăng này' 
        });
      }

      const updatedListing = await prisma.listings.update({
        where: { id },
        data: updateData,
        include: {
          containers: true,
          depots: true,
          listing_media: true,
          listing_facets: true
        }
      });

      return reply.send({
        success: true,
        data: { listing: updatedListing }
      });
    } catch (error: any) {
      fastify.log.error('Update listing error:', error);
      console.error('Update listing error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-005: DELETE /listings/:id - Xóa tin đăng
  fastify.delete('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      // Kiểm tra quyền sở hữu
      const listing = await prisma.listings.findUnique({
        where: { id }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      const userId = (request.user as any).userId;
      if (listing.seller_user_id !== userId) {
        return reply.status(403).send({ 
          success: false, 
          message: 'Không có quyền xóa tin đăng này' 
        });
      }

      await prisma.listings.delete({
        where: { id }
      });

      return reply.send({ 
        success: true, 
        message: 'Tin đăng đã được xóa thành công' 
      });
    } catch (error: any) {
      fastify.log.error('Delete listing error:', error);
      console.error('Delete listing error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-006: PUT /listings/:id/status - Cập nhật trạng thái tin đăng
  fastify.put('/:id/status', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { status } = request.body as any;

      // Validate status value
      if (!status || !isValidListingStatus(status)) {
        return reply.status(400).send({
          success: false,
          message: `Invalid status value: ${status}. Must be one of: DRAFT, PENDING_REVIEW, ACTIVE, PAUSED, SOLD, RENTED, ARCHIVED, REJECTED`
        });
      }

      // Kiểm tra quyền sở hữu
      const listing = await prisma.listings.findUnique({
        where: { id }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      const userId = (request.user as any).userId;
      if (listing.seller_user_id !== userId) {
        return reply.status(403).send({ 
          success: false, 
          message: 'Không có quyền thay đổi trạng thái tin đăng này' 
        });
      }

      const updatedListing = await prisma.listings.update({
        where: { id },
        data: { 
          status,
          updated_at: new Date()
        },
        include: {
          containers: true,
          depots: true,
          listing_media: true,
          listing_facets: true
        }
      });

      return reply.send({
        success: true,
        data: { listing: updatedListing }
      });
    } catch (error: any) {
      fastify.log.error('Update listing status error:', error);
      console.error('Update listing status error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-007: POST /listings/:id/media - Thêm media cho tin đăng
  fastify.post('/:id/media', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { mediaUrl, mediaType, sortOrder } = request.body as any;

      // Kiểm tra quyền sở hữu
      const listing = await prisma.listings.findUnique({
        where: { id }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      const userId = (request.user as any).userId;
      if (listing.seller_user_id !== userId) {
        return reply.status(403).send({ 
          success: false, 
          message: 'Không có quyền thêm media cho tin đăng này' 
        });
      }

      const media = await prisma.listing_media.create({
        data: {
          id: randomUUID(),
          listing_id: id,
          media_url: mediaUrl,
          media_type: mediaType,
          sort_order: sortOrder || 0,
          updated_at: new Date()
        }
      });

      return reply.send({
        success: true,
        data: { media }
      });
    } catch (error: any) {
      fastify.log.error('Add listing media error:', error);
      console.error('Add listing media error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-008: DELETE /listings/:id/media/:mediaId - Xóa media của tin đăng
  fastify.delete('/:id/media/:mediaId', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id, mediaId } = request.params as any;

      // Kiểm tra quyền sở hữu
      const listing = await prisma.listings.findUnique({
        where: { id }
      });

      if (!listing) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      const userId = (request.user as any).userId;
      if (listing.seller_user_id !== userId) {
        return reply.status(403).send({ 
          success: false, 
          message: 'Không có quyền xóa media của tin đăng này' 
        });
      }

      await prisma.listing_media.delete({
        where: { id: mediaId }
      });

      return reply.send({ 
        success: true, 
        message: 'Media đã được xóa thành công' 
      });
    } catch (error: any) {
      fastify.log.error('Delete listing media error:', error);
      console.error('Delete listing media error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // B-009: GET /listings/:id/containers - Lấy danh sách container của tin đăng
  fastify.get('/:id/containers', async (request, reply) => {
    try {
      const { id } = request.params as any;

      // ✅ CHỈ lấy AVAILABLE containers (theo VAN-DE-HIEN-THI-CONTAINER.md)
      const containers = await prisma.listing_containers.findMany({
        where: { 
          listing_id: id,
          deleted_at: null,
          status: 'AVAILABLE'  // ⭐ FILTER - chỉ trả về container khả dụng
        },
        orderBy: {
          created_at: 'asc'
        }
      });

      // ✅ Thêm summary để người mua biết tổng quan
      const totalCount = await prisma.listing_containers.count({
        where: { listing_id: id, deleted_at: null }
      });

      const summary = await prisma.listing_containers.groupBy({
        by: ['status'],
        where: { listing_id: id, deleted_at: null },
        _count: true
      });

      const getSummaryCount = (status: string) => {
        return summary.find((s: any) => s.status === status)?._count || 0;
      };

      return reply.send({
        success: true,
        data: {
          containers: containers.map(c => ({
            id: c.id,
            listing_id: c.listing_id,
            container_iso_code: c.container_iso_code,
            shipping_line: c.shipping_line,
            manufactured_year: c.manufactured_year,
            status: c.status,  // ✅ Include status field
            created_at: c.created_at,
            updated_at: c.updated_at
          })),
          summary: {  // ✅ Include summary
            total: totalCount,
            available: getSummaryCount('AVAILABLE'),
            reserved: getSummaryCount('RESERVED'),
            sold: getSummaryCount('SOLD'),
            rented: getSummaryCount('RENTED')
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Get listing containers error:', error);
      console.error('Get listing containers error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách container'
      });
    }
  });
}

