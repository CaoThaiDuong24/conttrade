// @ts-nocheck
import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  sendApplicationReceivedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationInfoRequiredEmail
} from '../services/email-service.js';

// Validation schemas
const createApplicationSchema = z.object({
  // Business Information
  businessType: z.enum(['INDIVIDUAL', 'COMPANY']),
  businessName: z.string().min(3).max(255),
  taxCode: z.string().optional(),
  nationalId: z.string().optional(),
  address: z.string().min(10),
  province: z.string().optional(),
  city: z.string().optional(),
  representativeName: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  
  // Depot Information
  depotName: z.string().min(3).max(255),
  depotAddress: z.string().min(10),
  depotProvince: z.string().optional(),
  depotCity: z.string().optional(),
  depotLatitude: z.number().optional(),
  depotLongitude: z.number().optional(),
  depotAreaSqm: z.number().int().positive().optional(),
  depotCapacityTeu: z.number().int().positive().optional(),
  depotImages: z.array(z.string()).min(3, 'Cần ít nhất 3 ảnh kho'),
  
  // Bank Information
  bankName: z.string().min(3),
  bankBranch: z.string().optional(),
  bankAccountNumber: z.string().min(8),
  bankAccountHolder: z.string().min(3),
  
  // Business Experience
  yearsExperience: z.number().int().min(0).optional(),
  containerTypes: z.array(z.string()).min(1, 'Chọn ít nhất 1 loại container'),
  supplySource: z.enum(['OWN', 'AGENT', 'BROKER']),
  currentInventory: z.number().int().min(0).optional(),
  businessDescription: z.string().optional(),
  
  // Documents (array of {type, filename, url, fileSize, uploadedAt})
  documents: z.array(z.object({
    type: z.string(),
    filename: z.string(),
    url: z.string(),
    fileSize: z.number(),
    uploadedAt: z.string()
  })).min(1, 'Cần ít nhất 1 tài liệu')
});

export default async function sellerApplicationRoutes(fastify: FastifyInstance) {
  
  // ========== USER ENDPOINTS ==========
  
  // SA-001: POST /seller-applications - Create new application
  fastify.post('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Check if user has buyer role
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              roles: true
            }
          }
        }
      });
      
      if (!user) {
        return reply.status(404).send({ success: false, message: 'User not found' });
      }
      
      // Check if user already has seller role
      const hasSeller = user.user_roles.some(ur => ur.roles.code === 'seller');
      if (hasSeller) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Bạn đã là nhà cung cấp rồi' 
        });
      }
      
      // Check if user has pending application
      const existingApp = await prisma.seller_applications.findFirst({
        where: {
          user_id: userId,
          status: { in: ['PENDING', 'UNDER_REVIEW', 'INFO_REQUIRED'] }
        }
      });
      
      if (existingApp) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Bạn đã có đơn đang chờ xử lý' 
        });
      }
      
      // Validate request body
      const validatedData = createApplicationSchema.parse(request.body);
      
      // Generate application code (APP-YYYYMMDD-XXX)
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = nanoid(3).toUpperCase();
      const applicationCode = `APP-${dateStr}-${randomStr}`;
      
      // Create application
      const application = await prisma.seller_applications.create({
        data: {
          user_id: userId,
          application_code: applicationCode,
          business_type: validatedData.businessType,
          business_name: validatedData.businessName,
          tax_code: validatedData.taxCode,
          national_id: validatedData.nationalId,
          address: validatedData.address,
          province: validatedData.province,
          city: validatedData.city,
          representative_name: validatedData.representativeName,
          website: validatedData.website,
          
          depot_name: validatedData.depotName,
          depot_address: validatedData.depotAddress,
          depot_province: validatedData.depotProvince,
          depot_city: validatedData.depotCity,
          depot_latitude: validatedData.depotLatitude,
          depot_longitude: validatedData.depotLongitude,
          depot_area_sqm: validatedData.depotAreaSqm,
          depot_capacity_teu: validatedData.depotCapacityTeu,
          depot_images: validatedData.depotImages,
          
          bank_name: validatedData.bankName,
          bank_branch: validatedData.bankBranch,
          bank_account_number: validatedData.bankAccountNumber,
          bank_account_holder: validatedData.bankAccountHolder,
          
          years_experience: validatedData.yearsExperience,
          container_types: validatedData.containerTypes,
          supply_source: validatedData.supplySource,
          current_inventory: validatedData.currentInventory,
          business_description: validatedData.businessDescription,
          
          documents: validatedData.documents,
          
          status: 'PENDING',
          submitted_at: new Date()
        }
      });
      
      // Create log
      await prisma.application_logs.create({
        data: {
          application_id: application.id,
          action: 'SUBMITTED',
          new_status: 'PENDING',
          performed_by: userId,
          performed_by_role: 'buyer',
          notes: 'Đơn đăng ký được tạo'
        }
      });
      
      // Send email
      try {
        await sendApplicationReceivedEmail(
          user.email!,
          user.full_name || user.display_name || 'Khách hàng',
          applicationCode
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
      
      return reply.status(201).send({
        success: true,
        message: 'Đơn đăng ký đã được tạo thành công',
        data: {
          applicationId: application.id,
          applicationCode: application.application_code,
          status: application.status
        }
      });
      
    } catch (error: any) {
      console.error('Create application error:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // SA-002: GET /seller-applications/my - Get my applications
  fastify.get('/my', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const applications = await prisma.seller_applications.findMany({
        where: {
          user_id: userId
        },
        orderBy: {
          created_at: 'desc'
        },
        select: {
          id: true,
          application_code: true,
          business_name: true,
          business_type: true,
          status: true,
          submitted_at: true,
          reviewed_at: true,
          rejection_reason: true,
          required_info: true,
          created_at: true
        }
      });
      
      return reply.send({
        success: true,
        data: { applications }
      });
      
    } catch (error) {
      console.error('Get my applications error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // SA-003: GET /seller-applications/:id - Get application detail
  fastify.get('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const userId = request.user.userId;
      
      // Check if user is admin
      const userRoles = await prisma.user_roles.findMany({
        where: { user_id: userId },
        include: { roles: true }
      });
      
      const isAdmin = userRoles.some(ur => ur.roles.code === 'admin');
      
      const application = await prisma.seller_applications.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
              display_name: true,
              phone: true
            }
          },
          application_logs: {
            orderBy: { created_at: 'desc' }
          }
        }
      });
      
      if (!application) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy đơn đăng ký'
        });
      }
      
      // Check authorization (own application or admin)
      if (application.user_id !== userId && !isAdmin) {
        return reply.status(403).send({
          success: false,
          message: 'Không có quyền xem đơn này'
        });
      }
      
      return reply.send({
        success: true,
        data: { application }
      });
      
    } catch (error) {
      console.error('Get application detail error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // SA-004: PUT /seller-applications/:id - Update/Resubmit application
  fastify.put('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const userId = request.user.userId;
      
      const application = await prisma.seller_applications.findUnique({
        where: { id }
      });
      
      if (!application) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy đơn đăng ký'
        });
      }
      
      // Check ownership
      if (application.user_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Không có quyền cập nhật đơn này'
        });
      }
      
      // Only allow update if status is INFO_REQUIRED or DRAFT
      if (!['INFO_REQUIRED', 'DRAFT'].includes(application.status)) {
        return reply.status(400).send({
          success: false,
          message: 'Không thể cập nhật đơn ở trạng thái này'
        });
      }
      
      // Validate request body
      const validatedData = createApplicationSchema.parse(request.body);
      
      // Update application
      const updatedApplication = await prisma.seller_applications.update({
        where: { id },
        data: {
          business_type: validatedData.businessType,
          business_name: validatedData.businessName,
          tax_code: validatedData.taxCode,
          national_id: validatedData.nationalId,
          address: validatedData.address,
          province: validatedData.province,
          city: validatedData.city,
          representative_name: validatedData.representativeName,
          website: validatedData.website,
          
          depot_name: validatedData.depotName,
          depot_address: validatedData.depotAddress,
          depot_province: validatedData.depotProvince,
          depot_city: validatedData.depotCity,
          depot_latitude: validatedData.depotLatitude,
          depot_longitude: validatedData.depotLongitude,
          depot_area_sqm: validatedData.depotAreaSqm,
          depot_capacity_teu: validatedData.depotCapacityTeu,
          depot_images: validatedData.depotImages,
          
          bank_name: validatedData.bankName,
          bank_branch: validatedData.bankBranch,
          bank_account_number: validatedData.bankAccountNumber,
          bank_account_holder: validatedData.bankAccountHolder,
          
          years_experience: validatedData.yearsExperience,
          container_types: validatedData.containerTypes,
          supply_source: validatedData.supplySource,
          current_inventory: validatedData.currentInventory,
          business_description: validatedData.businessDescription,
          
          documents: validatedData.documents,
          
          status: 'PENDING',
          submitted_at: new Date(),
          required_info: null // Clear required info after resubmit
        }
      });
      
      // Create log
      await prisma.application_logs.create({
        data: {
          application_id: application.id,
          action: application.status === 'INFO_REQUIRED' ? 'INFO_SUBMITTED' : 'UPDATED',
          old_status: application.status,
          new_status: 'PENDING',
          performed_by: userId,
          performed_by_role: 'buyer',
          notes: 'Đơn đăng ký được cập nhật và gửi lại'
        }
      });
      
      return reply.send({
        success: true,
        message: 'Đơn đăng ký đã được cập nhật thành công',
        data: {
          applicationId: updatedApplication.id,
          status: updatedApplication.status
        }
      });
      
    } catch (error: any) {
      console.error('Update application error:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // ========== ADMIN ENDPOINTS ==========
  
  // SA-005: GET /seller-applications/admin/list - List all applications (Admin only)
  fastify.get('/admin/list', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        
        // Check if user is admin
        const userRoles = await prisma.user_roles.findMany({
          where: { user_id: request.user.userId },
          include: { roles: true }
        });
        
        const isAdmin = userRoles.some(ur => ur.roles.code === 'admin');
        if (!isAdmin) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Không có quyền truy cập' 
          });
        }
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const { status, search, page = 1, limit = 20 } = request.query as any;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { application_code: { contains: search, mode: 'insensitive' } },
          { business_name: { contains: search, mode: 'insensitive' } },
          { tax_code: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      const [applications, total] = await Promise.all([
        prisma.seller_applications.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { submitted_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                full_name: true,
                display_name: true,
                phone: true
              }
            }
          }
        }),
        prisma.seller_applications.count({ where })
      ]);
      
      return reply.send({
        success: true,
        data: {
          applications,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('List applications error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // SA-006: POST /seller-applications/:id/approve - Approve application (Admin only)
  fastify.post('/:id/approve', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        
        const userRoles = await prisma.user_roles.findMany({
          where: { user_id: request.user.userId },
          include: { roles: true }
        });
        
        const isAdmin = userRoles.some(ur => ur.roles.code === 'admin');
        if (!isAdmin) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Không có quyền truy cập' 
          });
        }
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const adminId = request.user.userId;
      
      const application = await prisma.seller_applications.findUnique({
        where: { id },
        include: {
          user: true
        }
      });
      
      if (!application) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy đơn đăng ký'
        });
      }
      
      if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
        return reply.status(400).send({
          success: false,
          message: 'Không thể duyệt đơn ở trạng thái này'
        });
      }
      
      // Start transaction
      await prisma.$transaction(async (tx) => {
        // 1. Update application status
        await tx.seller_applications.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewed_at: new Date(),
            reviewed_by: adminId
          }
        });
        
        // 2. Assign seller role to user
        const sellerRole = await tx.roles.findUnique({
          where: { code: 'seller' }
        });
        
        if (sellerRole) {
          await tx.user_roles.create({
            data: {
              user_id: application.user_id,
              role_id: sellerRole.id,
              assigned_by: adminId,
              assigned_at: new Date()
            }
          });
        }
        
        // 3. Create depot
        const depotCode = `DEPOT-${nanoid(8).toUpperCase()}`;
        await tx.depots.create({
          data: {
            id: nanoid(),
            name: application.depot_name,
            code: depotCode,
            address: application.depot_address,
            province: application.depot_province,
            city: application.depot_city,
            geo_point: application.depot_latitude && application.depot_longitude 
              ? `${application.depot_latitude},${application.depot_longitude}`
              : null,
            capacity_teu: application.depot_capacity_teu,
            contact: {
              name: application.representative_name,
              phone: application.user.phone,
              email: application.user.email
            },
            status: 'ACTIVE'
          }
        });
        
        // 4. Create log
        await tx.application_logs.create({
          data: {
            application_id: application.id,
            action: 'APPROVED',
            old_status: application.status,
            new_status: 'APPROVED',
            performed_by: adminId,
            performed_by_role: 'admin',
            notes: 'Đơn đăng ký được duyệt'
          }
        });
      });
      
      // Send email
      try {
        await sendApplicationApprovedEmail(
          application.user.email!,
          application.user.full_name || application.user.display_name || 'Khách hàng',
          application.application_code,
          application.business_name
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
      
      return reply.send({
        success: true,
        message: 'Đơn đăng ký đã được duyệt thành công'
      });
      
    } catch (error) {
      console.error('Approve application error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // SA-007: POST /seller-applications/:id/reject - Reject application (Admin only)
  fastify.post('/:id/reject', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        
        const userRoles = await prisma.user_roles.findMany({
          where: { user_id: request.user.userId },
          include: { roles: true }
        });
        
        const isAdmin = userRoles.some(ur => ur.roles.code === 'admin');
        if (!isAdmin) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Không có quyền truy cập' 
          });
        }
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { reason } = request.body as any;
      const adminId = request.user.userId;
      
      if (!reason || reason.trim().length < 10) {
        return reply.status(400).send({
          success: false,
          message: 'Vui lòng nhập lý do từ chối (ít nhất 10 ký tự)'
        });
      }
      
      const application = await prisma.seller_applications.findUnique({
        where: { id },
        include: { user: true }
      });
      
      if (!application) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy đơn đăng ký'
        });
      }
      
      if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
        return reply.status(400).send({
          success: false,
          message: 'Không thể từ chối đơn ở trạng thái này'
        });
      }
      
      // Update application
      await prisma.seller_applications.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewed_at: new Date(),
          reviewed_by: adminId,
          rejection_reason: reason
        }
      });
      
      // Create log
      await prisma.application_logs.create({
        data: {
          application_id: application.id,
          action: 'REJECTED',
          old_status: application.status,
          new_status: 'REJECTED',
          performed_by: adminId,
          performed_by_role: 'admin',
          notes: reason
        }
      });
      
      // Send email
      try {
        await sendApplicationRejectedEmail(
          application.user.email!,
          application.user.full_name || application.user.display_name || 'Khách hàng',
          application.application_code,
          reason
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
      
      return reply.send({
        success: true,
        message: 'Đơn đăng ký đã bị từ chối'
      });
      
    } catch (error) {
      console.error('Reject application error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
  
  // SA-008: POST /seller-applications/:id/request-info - Request additional info (Admin only)
  fastify.post('/:id/request-info', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        
        const userRoles = await prisma.user_roles.findMany({
          where: { user_id: request.user.userId },
          include: { roles: true }
        });
        
        const isAdmin = userRoles.some(ur => ur.roles.code === 'admin');
        if (!isAdmin) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Không có quyền truy cập' 
          });
        }
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { requiredInfo } = request.body as any;
      const adminId = request.user.userId;
      
      if (!requiredInfo || requiredInfo.trim().length < 10) {
        return reply.status(400).send({
          success: false,
          message: 'Vui lòng nhập thông tin cần bổ sung (ít nhất 10 ký tự)'
        });
      }
      
      const application = await prisma.seller_applications.findUnique({
        where: { id },
        include: { user: true }
      });
      
      if (!application) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy đơn đăng ký'
        });
      }
      
      if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
        return reply.status(400).send({
          success: false,
          message: 'Không thể yêu cầu bổ sung cho đơn ở trạng thái này'
        });
      }
      
      // Update application
      await prisma.seller_applications.update({
        where: { id },
        data: {
          status: 'INFO_REQUIRED',
          reviewed_at: new Date(),
          reviewed_by: adminId,
          required_info: requiredInfo
        }
      });
      
      // Create log
      await prisma.application_logs.create({
        data: {
          application_id: application.id,
          action: 'INFO_REQUESTED',
          old_status: application.status,
          new_status: 'INFO_REQUIRED',
          performed_by: adminId,
          performed_by_role: 'admin',
          notes: requiredInfo
        }
      });
      
      // Send email
      try {
        await sendApplicationInfoRequiredEmail(
          application.user.email!,
          application.user.full_name || application.user.display_name || 'Khách hàng',
          application.application_code,
          requiredInfo
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
      
      return reply.send({
        success: true,
        message: 'Đã gửi yêu cầu bổ sung thông tin'
      });
      
    } catch (error) {
      console.error('Request info error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
}
