// @ts-nocheck
/**
 * Admin RBAC Management Routes
 * Cho phép admin quản lý roles, permissions và role_permissions qua API
 */

import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

export default async function adminRbacRoutes(fastify: FastifyInstance) {
  
  // Middleware: Chỉ admin mới được truy cập
  const adminOnly = async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      const userRoles = request.user.roles || [];
      
      if (!userRoles.includes('admin')) {
        return reply.status(403).send({
          success: false,
          message: 'Chỉ admin mới có quyền truy cập'
        });
      }
    } catch (error) {
      return reply.status(401).send({
        success: false,
        message: 'Unauthorized'
      });
    }
  };

  // ==================== PERMISSIONS MANAGEMENT ====================
  
  // GET /admin/rbac/permissions - Lấy tất cả permissions
  fastify.get('/permissions', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const permissions = await prisma.permissions.findMany({
        orderBy: [
          { module: 'asc' },
          { code: 'asc' }
        ]
      });

      // Group by module
      const grouped = permissions.reduce((acc: any, perm) => {
        if (!acc[perm.module]) {
          acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
      }, {});

      return reply.send({
        success: true,
        data: {
          permissions,
          grouped,
          total: permissions.length
        }
      });
    } catch (error: any) {
      fastify.log.error('Get permissions error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch permissions',
        error: error.message
      });
    }
  });

  // POST /admin/rbac/permissions - Tạo permission mới
  fastify.post('/permissions', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const { code, name, description, module, action } = request.body as any;

      // Validate required fields
      if (!code || !name || !module || !action) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: code, name, module, action'
        });
      }

      // Check if code already exists
      const existing = await prisma.permissions.findUnique({
        where: { code }
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          message: `Permission code ${code} already exists`
        });
      }

      // Create permission
      const permission = await prisma.permissions.create({
        data: {
          id: `perm-${code.toLowerCase()}`,
          code,
          name,
          description: description || '',
          module,
          action
        }
      });

      fastify.log.info(`✅ Created permission: ${code}`);

      return reply.status(201).send({
        success: true,
        message: 'Permission created successfully',
        data: { permission }
      });
    } catch (error: any) {
      fastify.log.error('Create permission error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create permission',
        error: error.message
      });
    }
  });

  // PUT /admin/rbac/permissions/:code - Cập nhật permission
  fastify.put('/permissions/:code', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const { code } = request.params as any;
      const { name, description, module, action } = request.body as any;

      const permission = await prisma.permissions.update({
        where: { code },
        data: {
          name: name || undefined,
          description: description || undefined,
          module: module || undefined,
          action: action || undefined,
          updated_at: new Date()
        }
      });

      fastify.log.info(`✅ Updated permission: ${code}`);

      return reply.send({
        success: true,
        message: 'Permission updated successfully',
        data: { permission }
      });
    } catch (error: any) {
      fastify.log.error('Update permission error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update permission',
        error: error.message
      });
    }
  });

  // DELETE /admin/rbac/permissions/:code - Xóa permission
  fastify.delete('/permissions/:code', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const { code } = request.params as any;

      // Delete permission (cascade will remove role_permissions)
      await prisma.permissions.delete({
        where: { code }
      });

      fastify.log.info(`✅ Deleted permission: ${code}`);

      return reply.send({
        success: true,
        message: 'Permission deleted successfully'
      });
    } catch (error: any) {
      fastify.log.error('Delete permission error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete permission',
        error: error.message
      });
    }
  });

  // ==================== ROLES MANAGEMENT ====================

  // GET /admin/rbac/roles - Lấy tất cả roles với permissions
  fastify.get('/roles', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          role_permissions: {
            include: {
              permissions: true
            }
          }
        },
        orderBy: {
          level: 'asc'
        }
      });

      // Format data
      const formatted = roles.map(role => ({
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        level: role.level,
        role_version: role.role_version,
        permissions: role.role_permissions.map(rp => ({
          code: rp.permissions.code,
          name: rp.permissions.name,
          module: rp.permissions.module,
          action: rp.permissions.action,
          scope: rp.scope
        })),
        permissions_count: role.role_permissions.length,
        created_at: role.created_at,
        updated_at: role.updated_at
      }));

      return reply.send({
        success: true,
        data: {
          roles: formatted,
          total: roles.length
        }
      });
    } catch (error: any) {
      fastify.log.error('Get roles error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      });
    }
  });

  // POST /admin/rbac/roles - Tạo role mới
  fastify.post('/roles', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const { code, name, description, level } = request.body as any;

      // Validate
      if (!code || !name) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: code, name'
        });
      }

      // Check if code exists
      const existing = await prisma.role.findUnique({
        where: { code }
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          message: `Role code ${code} already exists`
        });
      }

      // Create role
      const role = await prisma.role.create({
        data: {
          id: `role-${code.toLowerCase()}`,
          code,
          name,
          description: description || '',
          level: level || 1,
          role_version: 1
        }
      });

      fastify.log.info(`✅ Created role: ${code}`);

      return reply.status(201).send({
        success: true,
        message: 'Role created successfully',
        data: { role }
      });
    } catch (error: any) {
      fastify.log.error('Create role error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  });

  // ==================== ROLE-PERMISSION ASSIGNMENT ====================

  // POST /admin/rbac/roles/:roleCode/permissions - Gán permissions cho role
  fastify.post('/roles/:roleCode/permissions', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const { roleCode } = request.params as any;
      const { permissionCodes } = request.body as { permissionCodes: string[] };

      if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'permissionCodes must be a non-empty array'
        });
      }

      // Find role
      const role = await prisma.role.findUnique({
        where: { code: roleCode }
      });

      if (!role) {
        return reply.status(404).send({
          success: false,
          message: `Role ${roleCode} not found`
        });
      }

      // Find permissions
      const permissions = await prisma.permissions.findMany({
        where: {
          code: { in: permissionCodes }
        }
      });

      if (permissions.length !== permissionCodes.length) {
        const found = permissions.map(p => p.code);
        const missing = permissionCodes.filter(c => !found.includes(c));
        return reply.status(400).send({
          success: false,
          message: `Permissions not found: ${missing.join(', ')}`
        });
      }

      // Delete existing role_permissions
      await prisma.role_permissions.deleteMany({
        where: { role_id: role.id }
      });

      // Create new role_permissions
      const rolePermissions = await Promise.all(
        permissions.map(perm => 
          prisma.role_permissions.create({
            data: {
              id: uuidv4(),
              role_id: role.id,
              permission_id: perm.id,
              scope: 'GLOBAL'
            }
          })
        )
      );

      // Increment role_version để force user re-login
      await prisma.role.update({
        where: { id: role.id },
        data: {
          role_version: (role.role_version || 0) + 1,
          updated_at: new Date()
        }
      });

      // Update permissions_updated_at cho tất cả users có role này
      await prisma.$executeRaw`
        UPDATE users
        SET permissions_updated_at = NOW()
        WHERE id IN (
          SELECT user_id 
          FROM user_roles 
          WHERE role_id = ${role.id}
        )
      `;

      fastify.log.info(`✅ Assigned ${permissions.length} permissions to role ${roleCode}`);
      fastify.log.info(`📢 Users with role ${roleCode} will need to re-login to get new permissions`);

      return reply.send({
        success: true,
        message: `Successfully assigned ${permissions.length} permissions to role ${roleCode}. Users need to re-login.`,
        data: {
          role: role.code,
          permissions_count: permissions.length,
          new_role_version: (role.role_version || 0) + 1
        }
      });
    } catch (error: any) {
      fastify.log.error('Assign permissions error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to assign permissions',
        error: error.message
      });
    }
  });

  // DELETE /admin/rbac/roles/:roleCode/permissions/:permissionCode - Xóa permission khỏi role
  fastify.delete('/roles/:roleCode/permissions/:permissionCode', {
    preHandler: adminOnly
  }, async (request, reply) => {
    try {
      const { roleCode, permissionCode } = request.params as any;

      // Find role and permission
      const role = await prisma.role.findUnique({ where: { code: roleCode } });
      const permission = await prisma.permissions.findUnique({ where: { code: permissionCode } });

      if (!role || !permission) {
        return reply.status(404).send({
          success: false,
          message: 'Role or permission not found'
        });
      }

      // Delete role_permission
      await prisma.role_permissions.deleteMany({
        where: {
          role_id: role.id,
          permission_id: permission.id
        }
      });

      // Increment role_version
      await prisma.role.update({
        where: { id: role.id },
        data: {
          role_version: (role.role_version || 0) + 1,
          updated_at: new Date()
        }
      });

      // Update users permissions_updated_at
      await prisma.$executeRaw`
        UPDATE users
        SET permissions_updated_at = NOW()
        WHERE id IN (
          SELECT user_id 
          FROM user_roles 
          WHERE role_id = ${role.id}
        )
      `;

      fastify.log.info(`✅ Removed permission ${permissionCode} from role ${roleCode}`);

      return reply.send({
        success: true,
        message: `Permission removed from role. Users need to re-login.`
      });
    } catch (error: any) {
      fastify.log.error('Remove permission error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to remove permission',
        error: error.message
      });
    }
  });
}
