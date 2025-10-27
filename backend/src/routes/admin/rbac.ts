// @ts-nocheck
/**
 * Admin RBAC Management Routes
 * Quản lý động Roles, Permissions, và User Assignments
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../../lib/prisma.js'

// Type definitions
interface RoleCreateBody {
  code: string
  name: string
  description?: string
  level: number
}

interface PermissionCreateBody {
  code: string
  name: string
  description?: string
  category?: string
}

interface RolePermissionAssignBody {
  roleId: string
  permissionIds: string[]
  scope?: string
}

interface UserRoleAssignBody {
  userId: string
  roleIds: string[]
}

export default async function adminRBACRoutes(fastify: FastifyInstance) {
  
  // ==================== ROLES MANAGEMENT ====================
  
  /**
   * GET /api/admin/rbac/roles
   * Lấy danh sách tất cả roles
   */
  fastify.get('/roles', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const roles = await prisma.roles.findMany({
        include: {
          role_permissions: {
            include: {
              permissions: true
            }
          },
          user_roles: {
            include: {
              users_user_roles_user_idTousers: {
                select: {
                  id: true,
                  email: true,
                  display_name: true
                }
              }
            }
          }
        },
        orderBy: {
          level: 'desc'
        }
      })

      // Transform data
      const rolesWithStats = roles.map(role => ({
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystemRole: role.is_system_role,
        permissionCount: role.role_permissions?.length || 0,
        userCount: role.user_roles?.length || 0,
        permissions: role.role_permissions?.map((rp: any) => ({
          id: rp.permissions?.id,
          code: rp.permissions?.code,
          name: rp.permissions?.name,
          category: rp.permissions?.category,
          scope: rp.scope
        })) || [],
        createdAt: role.created_at,
        updatedAt: role.updated_at
      }))

      reply.send({
        success: true,
        data: rolesWithStats
      })
    } catch (error) {
      fastify.log.error('Get roles error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi lấy danh sách roles'
      })
    }
  })

  /**
   * GET /api/admin/rbac/roles/:id
   * Lấy chi tiết một role
   */
  fastify.get('/roles/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params

      const role = await prisma.roles.findUnique({
        where: { id },
        include: {
          role_permissions: {
            include: {
              permissions: true
            }
          },
          user_roles: {
            include: {
              users_user_roles_user_idTousers: {
                select: {
                  id: true,
                  email: true,
                  display_name: true,
                  avatar_url: true,
                  status: true
                }
              }
            }
          }
        }
      })

      if (!role) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy role'
        })
      }

      reply.send({
        success: true,
        data: {
          ...role,
          permissions: role.role_permissions.map(rp => rp.permissions),
          users: role.user_roles.map(ur => ur.users_user_roles_user_idTousers)
        }
      })
    } catch (error) {
      fastify.log.error('Get role error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi lấy thông tin role'
      })
    }
  })

  /**
   * POST /api/admin/rbac/roles
   * Tạo role mới
   */
  fastify.post('/roles', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Body: RoleCreateBody }>, reply: FastifyReply) => {
    try {
      const { code, name, description, level } = request.body

      // Check if code already exists
      const existing = await prisma.roles.findUnique({
        where: { code }
      })

      if (existing) {
        return reply.status(400).send({
          success: false,
          message: 'Mã role đã tồn tại'
        })
      }

      // Create role
      const role = await prisma.roles.create({
        data: {
          id: `role-${code}`,
          code,
          name,
          description,
          level: level || 0,
          is_system_role: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      reply.status(201).send({
        success: true,
        message: 'Tạo role thành công',
        data: role
      })
    } catch (error) {
      fastify.log.error('Create role error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi tạo role'
      })
    }
  })

  /**
   * PUT /api/admin/rbac/roles/:id
   * Cập nhật role
   */
  fastify.put('/roles/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: Partial<RoleCreateBody> }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const { name, description, level } = request.body

      // Check if role exists
      const existing = await prisma.roles.findUnique({
        where: { id }
      })

      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy role'
        })
      }

      // Cannot edit system roles
      if (existing.is_system_role) {
        return reply.status(403).send({
          success: false,
          message: 'Không thể chỉnh sửa system role'
        })
      }

      // Update role
      const role = await prisma.roles.update({
        where: { id },
        data: {
          name: name || existing.name,
          description: description !== undefined ? description : existing.description,
          level: level !== undefined ? level : existing.level,
          updated_at: new Date()
        }
      })

      reply.send({
        success: true,
        message: 'Cập nhật role thành công',
        data: role
      })
    } catch (error) {
      fastify.log.error('Update role error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi cập nhật role'
      })
    }
  })

  /**
   * DELETE /api/admin/rbac/roles/:id
   * Xóa role
   */
  fastify.delete('/roles/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params

      // Check if role exists
      const role = await prisma.roles.findUnique({
        where: { id },
        include: {
          user_roles: true
        }
      })

      if (!role) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy role'
        })
      }

      // Cannot delete system roles
      if (role.is_system_role) {
        return reply.status(403).send({
          success: false,
          message: 'Không thể xóa system role'
        })
      }

      // Cannot delete if role has users
      if (role.user_roles.length > 0) {
        return reply.status(400).send({
          success: false,
          message: `Không thể xóa role đang có ${role.user_roles.length} người dùng`
        })
      }

      // Delete role (cascade delete role_permissions)
      await prisma.roles.delete({
        where: { id }
      })

      reply.send({
        success: true,
        message: 'Xóa role thành công'
      })
    } catch (error) {
      fastify.log.error('Delete role error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi xóa role'
      })
    }
  })

  // ==================== PERMISSIONS MANAGEMENT ====================

  /**
   * GET /api/admin/rbac/permissions
   * Lấy danh sách tất cả permissions
   */
  fastify.get('/permissions', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const permissions = await prisma.permissions.findMany({
        include: {
          role_permissions: {
            include: {
              roles: true
            }
          }
        },
        orderBy: {
          code: 'asc'
        }
      })

      // Group by category
      const grouped = permissions.reduce((acc, perm) => {
        const category = perm.category || 'other'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push({
          id: perm.id,
          code: perm.code,
          name: perm.name,
          description: perm.description,
          category: perm.category,
          roleCount: perm.role_permissions.length,
          roles: perm.role_permissions.map(rp => ({
            id: rp.roles.id,
            code: rp.roles.code,
            name: rp.roles.name
          }))
        })
        return acc
      }, {} as Record<string, any[]>)

      reply.send({
        success: true,
        data: {
          all: permissions.map(p => ({
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description,
            category: p.category,
            roleCount: p.role_permissions.length
          })),
          byCategory: grouped
        }
      })
    } catch (error) {
      fastify.log.error('Get permissions error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi lấy danh sách permissions'
      })
    }
  })

  /**
   * POST /api/admin/rbac/permissions
   * Tạo permission mới
   */
  fastify.post('/permissions', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Body: PermissionCreateBody }>, reply: FastifyReply) => {
    try {
      const { code, name, description, category } = request.body

      // Check if code already exists
      const existing = await prisma.permissions.findUnique({
        where: { code }
      })

      if (existing) {
        return reply.status(400).send({
          success: false,
          message: 'Mã permission đã tồn tại'
        })
      }

      // Create permission
      const permission = await prisma.permissions.create({
        data: {
          id: `perm-${code.toLowerCase()}`,
          code,
          name,
          description,
          category,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      reply.status(201).send({
        success: true,
        message: 'Tạo permission thành công',
        data: permission
      })
    } catch (error) {
      fastify.log.error('Create permission error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi tạo permission'
      })
    }
  })

  /**
   * PUT /api/admin/rbac/permissions/:id
   * Cập nhật permission
   */
  fastify.put('/permissions/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: Partial<PermissionCreateBody> }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const { name, description, category } = request.body

      const permission = await prisma.permissions.update({
        where: { id },
        data: {
          name,
          description,
          category,
          updated_at: new Date()
        }
      })

      reply.send({
        success: true,
        message: 'Cập nhật permission thành công',
        data: permission
      })
    } catch (error) {
      fastify.log.error('Update permission error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi cập nhật permission'
      })
    }
  })

  /**
   * DELETE /api/admin/rbac/permissions/:id
   * Xóa permission
   */
  fastify.delete('/permissions/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params

      // Check if permission is in use
      const inUse = await prisma.role_permissions.count({
        where: { permission_id: id }
      })

      if (inUse > 0) {
        return reply.status(400).send({
          success: false,
          message: `Permission đang được sử dụng bởi ${inUse} role(s)`
        })
      }

      await prisma.permissions.delete({
        where: { id }
      })

      reply.send({
        success: true,
        message: 'Xóa permission thành công'
      })
    } catch (error) {
      fastify.log.error('Delete permission error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi xóa permission'
      })
    }
  })

  // ==================== ROLE-PERMISSION ASSIGNMENT ====================

  /**
   * POST /api/admin/rbac/role-permissions/assign
   * Gán permissions cho role
   */
  fastify.post('/role-permissions/assign', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Body: RolePermissionAssignBody }>, reply: FastifyReply) => {
    try {
      const { roleId, permissionIds, scope = 'GLOBAL' } = request.body

      // Validate role exists
      const role = await prisma.roles.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy role'
        })
      }

      // Use transaction with raw SQL to bypass Prisma bug
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Delete existing permissions using raw SQL
        await tx.$executeRawUnsafe(
          'DELETE FROM role_permissions WHERE role_id = $1',
          roleId
        )

        // Step 2: Insert new assignments using raw SQL
        const { randomUUID } = await import('crypto')
        const insertedIds: string[] = []
        
        for (const permissionId of permissionIds) {
          const id = randomUUID()
          await tx.$executeRawUnsafe(
            `INSERT INTO role_permissions (id, role_id, permission_id, scope, created_at) 
             VALUES ($1, $2, $3, $4::"PermissionScope", CURRENT_TIMESTAMP)`,
            id,
            roleId,
            permissionId,
            scope
          )
          insertedIds.push(id)
        }

        // Step 3: Fetch created records using Prisma (read operations work fine)
        const newAssignments = await tx.role_permissions.findMany({
          where: {
            id: {
              in: insertedIds
            }
          },
          include: {
            permissions: true
          }
        })

        return newAssignments
      })

      reply.send({
        success: true,
        message: `Đã gán ${result.length} permissions cho role`,
        data: result
      })
    } catch (error) {
      fastify.log.error('Assign role permissions error:', error)
      console.error('❌ DETAILED ERROR:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi gán permissions',
        error: error.message,
        details: error.toString()
      })
    }
  })

  /**
   * GET /api/admin/rbac/permission-matrix
   * Lấy ma trận permissions × roles
   */
  fastify.get('/permission-matrix', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [roles, permissions, rolePermissions, categories] = await Promise.all([
        prisma.roles.findMany({
          orderBy: { level: 'desc' }
        }),
        prisma.permissions.findMany({
          orderBy: { code: 'asc' }
        }),
        prisma.role_permissions.findMany(),
        prisma.$queryRaw<Array<{ code: string; name: string; icon: string; sort_order: number }>>`
          SELECT code, name, icon, sort_order FROM categories ORDER BY sort_order
        `.catch(() => [] as Array<{ code: string; name: string; icon: string; sort_order: number }>)
      ])

      // Create category map
      const categoryMap = new Map<string, { name: string; icon: string; sortOrder: number }>()
      categories.forEach(cat => {
        categoryMap.set(cat.code, { 
          name: cat.name, 
          icon: cat.icon || '❓',
          sortOrder: cat.sort_order || 999
        })
      })

      // Create matrix
      const matrix = permissions.map(permission => {
        const categoryCode = permission.category || 'other'
        const categoryInfo = categoryMap.get(categoryCode) || { 
          name: categoryCode, 
          icon: '❓',
          sortOrder: 999
        }
        
        const row: any = {
          permissionId: permission.id,
          code: permission.code,
          name: permission.name,
          description: permission.description,
          category: categoryCode,
          categoryLabel: categoryInfo.name,
          categoryIcon: categoryInfo.icon,
          categorySortOrder: categoryInfo.sortOrder
        }

        roles.forEach(role => {
          const hasPermission = rolePermissions.some(
            rp => rp.role_id === role.id && rp.permission_id === permission.id
          )
          row[role.code] = hasPermission
        })

        return row
      })

      reply.send({
        success: true,
        data: {
          roles: roles.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            level: r.level
          })),
          permissions: permissions.map(p => {
            const categoryCode = p.category || 'other'
            const categoryInfo = categoryMap.get(categoryCode) || { 
              name: categoryCode, 
              icon: '❓',
              sortOrder: 999
            }
            return {
              id: p.id,
              code: p.code,
              name: p.name,
              description: p.description,
              category: categoryCode,
              categoryLabel: categoryInfo.name,
              categoryIcon: categoryInfo.icon
            }
          }),
          matrix,
          categories: Array.from(categoryMap.entries()).map(([code, info]) => ({
            code,
            name: info.name,
            icon: info.icon,
            sortOrder: info.sortOrder
          })).sort((a, b) => a.sortOrder - b.sortOrder)
        }
      })
    } catch (error) {
      fastify.log.error('Get permission matrix error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi lấy ma trận phân quyền'
      })
    }
  })

  // ==================== USER-ROLE ASSIGNMENT ====================

  /**
   * POST /api/admin/rbac/user-roles/assign
   * Gán roles cho user
   */
  fastify.post('/user-roles/assign', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Body: UserRoleAssignBody }>, reply: FastifyReply) => {
    try {
      const { userId, roleIds } = request.body
      const adminUserId = (request as any).user.userId

      // Validate user exists
      const user = await prisma.users.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy người dùng'
        })
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing roles
        await tx.user_roles.deleteMany({
          where: { user_id: userId }
        })

        // Create new assignments
        const assignments = await Promise.all(
          roleIds.map(async (roleId) => {
            return tx.user_roles.create({
              data: {
                id: `ur-${userId}-${roleId}`,
                user_id: userId,
                role_id: roleId,
                assigned_at: new Date(),
                assigned_by: adminUserId,
                created_at: new Date()
              }
            })
          })
        )

        // CRITICAL: Update permissions_updated_at to invalidate old tokens
        await tx.users.update({
          where: { id: userId },
          data: {
            permissions_updated_at: new Date(),
            updated_at: new Date()
          }
        })

        return assignments
      })

      reply.send({
        success: true,
        message: `Đã gán ${result.length} roles cho người dùng. User cần đăng nhập lại để áp dụng quyền mới.`,
        data: result
      })
    } catch (error) {
      fastify.log.error('Assign user roles error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi gán roles'
      })
    }
  })

  /**
   * GET /api/admin/rbac/users/:userId/roles
   * Lấy danh sách roles của user
   */
  fastify.get('/users/:userId/roles', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params

      const userRoles = await prisma.user_roles.findMany({
        where: { user_id: userId },
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
      })

      reply.send({
        success: true,
        data: userRoles.map(ur => ({
          ...ur.roles,
          assignedAt: ur.assigned_at,
          assignedBy: ur.assigned_by,
          permissions: ur.roles.role_permissions.map(rp => rp.permissions)
        }))
      })
    } catch (error) {
      fastify.log.error('Get user roles error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi lấy roles của user'
      })
    }
  })

  /**
   * GET /api/admin/rbac/stats
   * Thống kê RBAC
   */
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [
        totalRoles,
        totalPermissions,
        totalUsers,
        rolePermissionCount,
        userRoleCount
      ] = await Promise.all([
        prisma.roles.count(),
        prisma.permissions.count(),
        prisma.users.count(),
        prisma.role_permissions.count(),
        prisma.user_roles.count()
      ])

      // Get role distribution
      const roleDistribution = await prisma.user_roles.groupBy({
        by: ['role_id'],
        _count: true
      })

      const rolesWithCounts = await Promise.all(
        roleDistribution.map(async (rd) => {
          const role = await prisma.roles.findUnique({
            where: { id: rd.role_id }
          })
          return {
            roleId: rd.role_id,
            roleName: role?.name,
            userCount: rd._count
          }
        })
      )

      reply.send({
        success: true,
        data: {
          overview: {
            totalRoles,
            totalPermissions,
            totalUsers,
            rolePermissionCount,
            userRoleCount
          },
          roleDistribution: rolesWithCounts
        }
      })
    } catch (error) {
      fastify.log.error('Get RBAC stats error:', error)
      reply.status(500).send({
        success: false,
        message: 'Lỗi khi lấy thống kê'
      })
    }
  })
}
