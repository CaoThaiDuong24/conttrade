// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../../lib/prisma.js';

interface CreateUserBody {
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  password: string;
}

interface UpdateUserBody {
  fullName?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  roles?: string[];
}

export default async function adminUserRoutes(fastify: FastifyInstance) {
  
  // GET /admin/users - Lấy danh sách users (Admin only)
  fastify.get('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        const user = request.user as any;
        
        // Check if user has admin permission
        const userPerms = await prisma.user_permissions.findMany({
          where: { userId: user.userId },
          include: { permissions: true }
        });
        
        const hasAdminPerm = userPerms.some(up => 
          up.permissions.code === 'PM-001' || // System Admin
          up.permissions.code === 'PM-002'    // User Management
        );
        
        if (!hasAdminPerm) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Insufficient permissions' 
          });
        }
        
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          email: true,
          phone: true,
          displayName: true,
          status: true,
          kycStatus: true,
          createdAt: true,
          lastLogin: true,
          user_roles_user_roles_user_idTousers: {
            include: {
              roles: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  level: true
                }
              }
            }
          },
          orgUsers: {
            include: {
              org: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform data for frontend
      const transformedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        display_name: user.displayName,
        status: user.status,
        kycStatus: user.kycStatus,
        roles: user.user_roles_user_roles_user_idTousers.map(ur => ({
          id: ur.roles.id,
          code: ur.roles.code,
          name: ur.roles.name,
          level: ur.roles.level
        })),
        createdAt: user.createdAt.toISOString().split('T')[0],
        lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : null,
        organization: user.orgUsers[0]?.org?.name || null
      }));

      return reply.send({
        success: true,
        data: transformedUsers,
        total: transformedUsers.length
      });
      
    } catch (error) {
      console.error('Admin users list error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });

  // GET /admin/users/:id - Chi tiết user
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        const user = request.user as any;
        
        // Check admin permissions
        const userPerms = await prisma.user_permissions.findMany({
          where: { userId: user.userId },
          include: { permissions: true }
        });
        
        const hasAdminPerm = userPerms.some(up => 
          up.permissions.code === 'PM-001' || 
          up.permissions.code === 'PM-002'
        );
        
        if (!hasAdminPerm) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Insufficient permissions' 
          });
        }
        
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const user = await prisma.users.findUnique({
        where: { id },
        include: {
          user_roles_user_roles_user_idTousers: {
            include: {
              roles: {
                include: {
                  role_permissions: {
                    include: {
                      permissions: true
                    }
                  }
                }
              }
            }
          },
          user_permissions: {
            include: {
              permissions: true
            }
          },
          orgUsers: {
            include: {
              org: true
            }
          },
          listings: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true
            }
          },
          orders_orders_buyerIdTousers: {
            select: {
              id: true,
              status: true,
              total: true,
              createdAt: true
            }
          },
          orders_orders_sellerIdTousers: {
            select: {
              id: true,
              status: true,
              total: true,
              createdAt: true
            }
          }
        }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      const transformedUser = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.displayName,
        status: user.status,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        roles: user.user_roles_user_roles_user_idTousers.map(ur => ({
          id: ur.roles.id,
          code: ur.roles.code,
          name: ur.roles.name,
          level: ur.roles.level,
          assignedAt: ur.assigned_at,
          permissions: ur.roles.role_permissions.map(rp => ({
            code: rp.permissions.code,
            name: rp.permissions.name
          }))
        })),
        directPermissions: user.user_permissions.map(up => ({
          code: up.permissions.code,
          name: up.permissions.name
        })),
        organizations: user.orgUsers.map(ou => ({
          id: ou.org.id,
          name: ou.org.name,
          role: ou.role
        })),
        stats: {
          listings: user.listings.length,
          buyOrders: user.orders_orders_buyerIdTousers.length,
          sellOrders: user.orders_orders_sellerIdTousers.length
        }
      };

      return reply.send({
        success: true,
        data: transformedUser
      });
      
    } catch (error) {
      console.error('Admin user detail error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch user details'
      });
    }
  });

  // POST /admin/users - Tạo user mới
  fastify.post<{ Body: CreateUserBody }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        const user = request.user as any;
        
        // Check admin permissions
        const userPerms = await prisma.user_permissions.findMany({
          where: { userId: user.userId },
          include: { permissions: true }
        });
        
        const hasAdminPerm = userPerms.some(up => 
          up.permissions.code === 'PM-001' || 
          up.permissions.code === 'PM-002'
        );
        
        if (!hasAdminPerm) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Insufficient permissions' 
          });
        }
        
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { email, fullName, phone, roles, password } = request.body;
    
    try {
      // Check if email already exists
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password (simplified - should use proper hashing)
      const hashedPassword = password; // TODO: Implement proper password hashing
      
      // Create user
      const newUser = await prisma.users.create({
        data: {
          email,
          displayName: fullName,
          phone,
          passwordHash: hashedPassword,
          status: 'ACTIVE',
          kycStatus: 'UNVERIFIED',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Assign roles if provided
      if (roles && roles.length > 0) {
        // roles array contains role IDs
        const roleRecords = await prisma.roles.findMany({
          where: {
            id: { in: roles }
          }
        });
        
        if (roleRecords.length > 0) {
          const userRoles = roleRecords.map(role => ({
            id: `ur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: newUser.id,
            role_id: role.id,
            assigned_by: (request.user as any)?.userId,
            assigned_at: new Date(),
            created_at: new Date()
          }));
          
          await prisma.user_roles.createMany({
            data: userRoles
          });
        }
      }

      return reply.status(201).send({
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.displayName
        },
        message: 'User created successfully'
      });
      
    } catch (error) {
      console.error('Create user error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create user'
      });
    }
  });

  // PUT /admin/users/:id - Cập nhật user
  fastify.put<{ Params: { id: string }, Body: UpdateUserBody }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        const user = request.user as any;
        
        // Check admin permissions
        const userPerms = await prisma.user_permissions.findMany({
          where: { userId: user.userId },
          include: { permissions: true }
        });
        
        const hasAdminPerm = userPerms.some(up => 
          up.permissions.code === 'PM-001' || 
          up.permissions.code === 'PM-002'
        );
        
        if (!hasAdminPerm) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Insufficient permissions' 
          });
        }
        
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { fullName, phone, status, kycStatus, roles } = request.body;
    
    try {
      // Update user basic info
      const updateData: any = { updatedAt: new Date() };
      if (fullName !== undefined) updateData.displayName = fullName;
      if (phone !== undefined) updateData.phone = phone;
      if (status !== undefined) updateData.status = status;
      if (kycStatus !== undefined) updateData.kycStatus = kycStatus;
      
      const updatedUser = await prisma.users.update({
        where: { id },
        data: updateData
      });

      // Update roles if provided (roles array contains role IDs)
      if (roles !== undefined) {
        // Remove existing roles
        await prisma.user_roles.deleteMany({
          where: { user_id: id }
        });
        
        // Add new roles if any
        if (roles.length > 0) {
          const roleRecords = await prisma.roles.findMany({
            where: {
              id: { in: roles }
            }
          });
          
          if (roleRecords.length > 0) {
            const userRoles = roleRecords.map(role => ({
              id: `ur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              user_id: id,
              role_id: role.id,
              assigned_by: (request.user as any)?.userId,
              assigned_at: new Date(),
              created_at: new Date()
            }));
            
            await prisma.user_roles.createMany({
              data: userRoles
            });
          }
        }
      }

      return reply.send({
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.displayName,
          status: updatedUser.status,
          kycStatus: updatedUser.kycStatus
        },
        message: 'User updated successfully'
      });
      
    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to update user'
      });
    }
  });

  // DELETE /admin/users/:id - Xóa user
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
        const user = request.user as any;
        
        // Check admin permissions
        const userPerms = await prisma.user_permissions.findMany({
          where: { userId: user.userId },
          include: { permissions: true }
        });
        
        const hasAdminPerm = userPerms.some(up => 
          up.permissions.code === 'PM-001'
        );
        
        if (!hasAdminPerm) {
          return reply.status(403).send({ 
            success: false, 
            message: 'Only system admins can delete users' 
          });
        }
        
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      // Check if user exists
      const user = await prisma.users.findUnique({
        where: { id }
      });
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      // Delete user (this will cascade to related records)
      await prisma.users.delete({
        where: { id }
      });

      return reply.send({
        success: true,
        message: 'User deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete user error:', error);
      
      if (error.code === 'P2003') {
        return reply.status(400).send({
          success: false,
          message: 'Cannot delete user with existing orders or listings'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete user'
      });
    }
  });
}