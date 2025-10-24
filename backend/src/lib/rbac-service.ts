// @ts-nocheck
// RBAC Service for i-ContExchange
// Handles all role-based access control operations

import prisma from './prisma.js'
import type { User, Role, Permission, UserRole, RolePermission, UserPermission } from '@prisma/client'

export interface Permission {
  id: string
  code: string
  name: string
  module: string
  action: string
  resource?: string
}

export interface Role {
  id: string
  code: string
  name: string
  level: number
  permissions: Permission[]
}

export interface UserWithPermissions {
  id: string
  email: string
  fullName?: string
  roles: Role[]
  permissions: Permission[]
}

export class RBACService {
  
  /**
   * Get user with all their roles and permissions
   */
  static async getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                rolePermissions: {
                  where: { isActive: true },
                  include: {
                    permission: {
                      where: { isActive: true }
                    }
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          where: { isActive: true },
          include: {
            permission: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!user) return null

    // Collect all permissions from roles
    const rolePermissions = user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission)
    )

    // Collect direct user permissions
    const directPermissions = user.userPermissions.map(up => up.permission)

    // Combine and deduplicate permissions
    const allPermissions = [...rolePermissions, ...directPermissions]
    const uniquePermissions = allPermissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.id === permission.id)
    )

    // Map roles
    const roles = user.userRoles.map(ur => ({
      id: ur.role.id,
      code: ur.role.code,
      name: ur.role.name,
      level: ur.role.level,
      permissions: ur.role.rolePermissions.map(rp => rp.permission)
    }))

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles,
      permissions: uniquePermissions
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const userWithPermissions = await this.getUserWithPermissions(userId)
    if (!userWithPermissions) return false

    return userWithPermissions.permissions.some(p => p.code === permissionCode)
  }

  /**
   * Check if user has any of the specified permissions
   */
  static async hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    const userWithPermissions = await this.getUserWithPermissions(userId)
    if (!userWithPermissions) return false

    return userWithPermissions.permissions.some(p => permissionCodes.includes(p.code))
  }

  /**
   * Check if user has all of the specified permissions
   */
  static async hasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    const userWithPermissions = await this.getUserWithPermissions(userId)
    if (!userWithPermissions) return false

    const userPermissionCodes = userWithPermissions.permissions.map(p => p.code)
    return permissionCodes.every(code => userPermissionCodes.includes(code))
  }

  /**
   * Get navigation menu based on user permissions
   */
  static async getNavigationMenu(userId: string) {
    const userWithPermissions = await this.getUserWithPermissions(userId)
    if (!userWithPermissions) return []

    const permissions = userWithPermissions.permissions.map(p => p.code)
    const menu = []

    // Dashboard - always available for authenticated users
    menu.push({
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      permissions: []
    })

    // Admin section
    if (permissions.some(p => p.startsWith('admin.'))) {
      menu.push({
        title: 'Admin',
        icon: 'settings',
        children: [
          ...(permissions.includes('admin.users.read') ? [{
            title: 'User Management',
            href: '/admin/users',
            icon: 'users'
          }] : []),
          ...(permissions.includes('admin.roles.read') ? [{
            title: 'Role Management',
            href: '/admin/roles',
            icon: 'shield'
          }] : []),
          ...(permissions.includes('admin.permissions.read') ? [{
            title: 'Permissions',
            href: '/admin/permissions',
            icon: 'key'
          }] : []),
          ...(permissions.includes('admin.organizations.read') ? [{
            title: 'Organizations',
            href: '/admin/organizations',
            icon: 'building'
          }] : []),
          ...(permissions.includes('admin.system.read') ? [{
            title: 'System Settings',
            href: '/admin/system',
            icon: 'cog'
          }] : [])
        ]
      })
    }

    // Listings/Marketplace
    if (permissions.some(p => p.startsWith('listings.'))) {
      menu.push({
        title: 'Marketplace',
        icon: 'shopping-cart',
        children: [
          ...(permissions.includes('listings.read') ? [{
            title: 'Browse Listings',
            href: '/listings',
            icon: 'list'
          }] : []),
          ...(permissions.includes('listings.write') ? [{
            title: 'My Listings',
            href: '/listings/my',
            icon: 'package'
          }] : []),
          ...(permissions.includes('listings.write') ? [{
            title: 'Create Listing',
            href: '/listings/create',
            icon: 'plus'
          }] : [])
        ]
      })
    }

    // Orders
    if (permissions.some(p => p.startsWith('orders.'))) {
      menu.push({
        title: 'Orders',
        icon: 'clipboard',
        children: [
          ...(permissions.includes('orders.read') ? [{
            title: 'My Orders',
            href: '/orders',
            icon: 'list'
          }] : []),
          ...(permissions.includes('orders.approve') ? [{
            title: 'Order Approval',
            href: '/orders/approval',
            icon: 'check'
          }] : [])
        ]
      })
    }

    // Depot Management
    if (permissions.some(p => p.startsWith('depot.'))) {
      menu.push({
        title: 'Depot',
        icon: 'warehouse',
        children: [
          ...(permissions.includes('depot.inventory.read') ? [{
            title: 'Inventory',
            href: '/depot/inventory',
            icon: 'boxes'
          }] : []),
          ...(permissions.includes('depot.receiving.write') ? [{
            title: 'Receiving',
            href: '/depot/receiving',
            icon: 'truck'
          }] : []),
          ...(permissions.includes('depot.delivery.write') ? [{
            title: 'Delivery',
            href: '/depot/delivery',
            icon: 'shipping'
          }] : [])
        ]
      })
    }

    // Inspection
    if (permissions.some(p => p.startsWith('inspection.'))) {
      menu.push({
        title: 'Inspection',
        icon: 'search',
        children: [
          ...(permissions.includes('inspection.read') ? [{
            title: 'Inspection Reports',
            href: '/inspection',
            icon: 'file-text'
          }] : []),
          ...(permissions.includes('inspection.write') ? [{
            title: 'Create Report',
            href: '/inspection/create',
            icon: 'plus'
          }] : [])
        ]
      })
    }

    // Financial
    if (permissions.some(p => p.startsWith('billing.'))) {
      menu.push({
        title: 'Financial',
        icon: 'dollar-sign',
        children: [
          ...(permissions.includes('billing.read') ? [{
            title: 'Billing',
            href: '/billing',
            icon: 'credit-card'
          }] : []),
          ...(permissions.includes('billing.invoices.read') ? [{
            title: 'Invoices',
            href: '/billing/invoices',
            icon: 'receipt'
          }] : [])
        ]
      })
    }

    // Disputes
    if (permissions.some(p => p.startsWith('disputes.'))) {
      menu.push({
        title: 'Disputes',
        href: '/disputes',
        icon: 'alert-triangle'
      })
    }

    // Account settings - always available
    menu.push({
      title: 'Account',
      href: '/account',
      icon: 'user'
    })

    return menu.filter(item => item !== null)
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId: string, roleCode: string, assignedBy?: string) {
    const role = await prisma.role.findUnique({
      where: { code: roleCode, isActive: true }
    })

    if (!role) {
      throw new Error(`Role ${roleCode} not found`)
    }

    return await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
        assignedBy
      }
    })
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: string, roleCode: string) {
    const role = await prisma.role.findUnique({
      where: { code: roleCode }
    })

    if (!role) {
      throw new Error(`Role ${roleCode} not found`)
    }

    return await prisma.userRole.updateMany({
      where: {
        userId,
        roleId: role.id
      },
      data: {
        isActive: false
      }
    })
  }

  /**
   * Grant permission directly to user
   */
  static async grantPermission(userId: string, permissionCode: string, grantedBy?: string, expiresAt?: Date) {
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode, isActive: true }
    })

    if (!permission) {
      throw new Error(`Permission ${permissionCode} not found`)
    }

    return await prisma.userPermission.create({
      data: {
        userId,
        permissionId: permission.id,
        grantedBy,
        expiresAt
      }
    })
  }

  /**
   * Revoke permission from user
   */
  static async revokePermission(userId: string, permissionCode: string) {
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode }
    })

    if (!permission) {
      throw new Error(`Permission ${permissionCode} not found`)
    }

    return await prisma.userPermission.updateMany({
      where: {
        userId,
        permissionId: permission.id
      },
      data: {
        isActive: false
      }
    })
  }
}

export default RBACService