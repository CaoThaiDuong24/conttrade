// @ts-nocheck
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  orgUsers: any[];
}

export default async function authRBACRoutes(fastify: FastifyInstance) {
  const { prisma } = fastify;
  
  // Handle OPTIONS requests for CORS
  fastify.options('/*', async (request, reply) => {
    reply.code(200).send();
  });
  
  // Enhanced Login with RBAC
  fastify.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    try {
      const { email, password, rememberMe = false } = request.body;

      // Find user with roles and permissions
      const user = await prisma.users.findUnique({
        where: { email },
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
          org_users: {
            include: {
              orgs: true
            }
          }
        }
      });
      
      console.log('🔍🔍🔍 FULL USER DATA:', JSON.stringify(user, null, 2).substring(0, 2000));

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Check user status
      if (user.status !== 'ACTIVE') {
        return reply.status(403).send({
          success: false,
          message: 'Tài khoản đã bị khóa hoặc chưa được kích hoạt'
        });
      }

      // Collect permissions
      const permissions = new Set<string>();
      
      console.log('🔍 Debug user data:', {
        email: user.email,
        hasRoles: user.user_roles_user_roles_user_idTousers?.length > 0,
        rolesCount: user.user_roles_user_roles_user_idTousers?.length
      });
      
      // Add role-based permissions
      user.user_roles_user_roles_user_idTousers.forEach((userRole: any) => {
        console.log('🔍 Processing role:', userRole.roles.code);
        console.log('   Permissions in role:', userRole.roles.role_permissions?.length);
        
        userRole.roles.role_permissions.forEach((rolePermission: any) => {
          console.log('   Adding permission:', rolePermission.permissions.code);
          permissions.add(rolePermission.permissions.code);
        });
      });

      const roles = user.user_roles_user_roles_user_idTousers.map((userRole: any) => userRole.roles.code);
      
      console.log('✅ Final permissions:', Array.from(permissions));
      console.log('✅ Final roles:', roles);

      // Generate tokens
      const tokenExpiry = rememberMe ? '30d' : '24h';
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          roles,
          permissions: Array.from(permissions)
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: tokenExpiry }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        { expiresIn: '90d' }
      );

      // Update last login
      await prisma.users.update({
        where: { id: user.id },
        data: { 
          last_login_at: new Date()
        }
      });

      // Prepare user data
      const userData: UserData = {
        id: user.id,
        email: user.email,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        displayName: user.display_name || user.email || '',
        avatar: user.avatar_url,
        roles,
        permissions: Array.from(permissions),
        orgUsers: user.org_users.map((orgUser: any) => ({
          org: {
            id: orgUser.orgs.id,
            name: orgUser.orgs.name,
            type: orgUser.orgs.type
          },
          position: orgUser.position,
          isOwner: orgUser.is_owner,
          isAdmin: orgUser.is_admin
        }))
      };

      reply.send({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          accessToken,
          refreshToken,
          user: userData
        }
      });

    } catch (error) {
      fastify.log.error('Login error:', error);
      reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống, vui lòng thử lại'
      });
    }
  });

  // Get current user info with RBAC
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId;

      const user = await prisma.users.findUnique({
        where: { id: userId },
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
          org_users: {
            include: {
              orgs: true
            }
          }
        }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Collect permissions
      const permissions = new Set<string>();
      
      user.user_roles_user_roles_user_idTousers.forEach((userRole: any) => {
        userRole.roles.role_permissions.forEach((rolePermission: any) => {
          permissions.add(rolePermission.permissions.code);
        });
      });

      const roles = user.user_roles_user_roles_user_idTousers.map((userRole: any) => userRole.roles.code);

      const userData: UserData = {
        id: user.id,
        email: user.email,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        displayName: user.display_name || user.email || '',
        avatar: user.avatar_url,
        roles,
        permissions: Array.from(permissions),
        orgUsers: user.org_users.map((orgUser: any) => ({
          org: {
            id: orgUser.orgs.id,
            name: orgUser.orgs.name,
            type: orgUser.orgs.type
          },
          position: orgUser.position,
          isOwner: orgUser.is_owner,
          isAdmin: orgUser.is_admin
        }))
      };

      reply.send({
        success: true,
        data: { user: userData }
      });

    } catch (error) {
      fastify.log.error('Get user error:', error);
      reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });

  // Check user permissions
  fastify.post('/check-permission', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId;
      const { permission } = request.body as { permission: string };

      const user = await prisma.users.findUnique({
        where: { id: userId },
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
          }
        }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Check permissions
      const permissions = new Set<string>();
      
      user.user_roles_user_roles_user_idTousers.forEach((userRole: any) => {
        userRole.roles.role_permissions.forEach((rolePermission: any) => {
          permissions.add(rolePermission.permissions.code);
        });
      });

      const hasPermission = permissions.has(permission);

      reply.send({
        success: true,
        data: { hasPermission }
      });

    } catch (error) {
      fastify.log.error('Check permission error:', error);
      reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });

  // Logout
  fastify.post('/logout', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      reply.send({
        success: true,
        message: 'Đăng xuất thành công'
      });

    } catch (error) {
      fastify.log.error('Logout error:', error);
      reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });

  // Refresh token
  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      // For now, just return unauthorized - session table doesn't exist
      return reply.status(401).send({
        success: false,
        message: 'Refresh token không được hỗ trợ. Vui lòng đăng nhập lại.'
      });

    } catch (error) {
      fastify.log.error('Refresh token error:', error);
      reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
}