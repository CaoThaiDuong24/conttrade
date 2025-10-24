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
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          },
          userPermissions: {
            include: {
              permission: true
            }
          },
          orgUsers: {
            include: {
              org: true
            }
          }
        }
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
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
      
      // Add role-based permissions
      user.userRoles.forEach((userRole: any) => {
        userRole.role.rolePermissions.forEach((rolePermission: any) => {
          permissions.add(rolePermission.permission.code);
        });
      });

      // Add/remove user-specific permissions
      user.userPermissions.forEach((userPermission: any) => {
        if (userPermission.granted) {
          permissions.add(userPermission.permission.code);
        } else {
          permissions.delete(userPermission.permission.code);
        }
      });

      const roles = user.userRoles.map((userRole: any) => userRole.role.code);

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

      // Save session
      await prisma.userSession.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
          expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000))
        }
      });

      // Log successful login
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          email: user.email,
          success: true,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          loginAttempts: 0,
          lockedUntil: null
        }
      });

      // Prepare user data
      const userData: UserData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName || '',
        displayName: user.displayName || '',
        avatar: user.avatar,
        roles,
        permissions: Array.from(permissions),
        orgUsers: user.orgUsers.map((orgUser: any) => ({
          org: {
            id: orgUser.org.id,
            name: orgUser.org.name,
            type: orgUser.org.type
          },
          position: orgUser.position,
          isOwner: orgUser.isOwner,
          isAdmin: orgUser.isAdmin
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

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          },
          userPermissions: {
            include: {
              permission: true
            }
          },
          orgUsers: {
            include: {
              org: true
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
      
      user.userRoles.forEach((userRole: any) => {
        userRole.role.rolePermissions.forEach((rolePermission: any) => {
          permissions.add(rolePermission.permission.code);
        });
      });

      user.userPermissions.forEach((userPermission: any) => {
        if (userPermission.granted) {
          permissions.add(userPermission.permission.code);
        } else {
          permissions.delete(userPermission.permission.code);
        }
      });

      const roles = user.userRoles.map((userRole: any) => userRole.role.code);

      const userData: UserData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName || '',
        displayName: user.displayName || '',
        avatar: user.avatar,
        roles,
        permissions: Array.from(permissions),
        orgUsers: user.orgUsers.map((orgUser: any) => ({
          org: {
            id: orgUser.org.id,
            name: orgUser.org.name,
            type: orgUser.org.type
          },
          position: orgUser.position,
          isOwner: orgUser.isOwner,
          isAdmin: orgUser.isAdmin
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

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          },
          userPermissions: {
            include: {
              permission: true
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
      
      user.userRoles.forEach((userRole: any) => {
        userRole.role.rolePermissions.forEach((rolePermission: any) => {
          permissions.add(rolePermission.permission.code);
        });
      });

      user.userPermissions.forEach((userPermission: any) => {
        if (userPermission.granted) {
          permissions.add(userPermission.permission.code);
        } else {
          permissions.delete(userPermission.permission.code);
        }
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
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Deactivate session
        await prisma.userSession.updateMany({
          where: { token },
          data: { isActive: false }
        });
      }

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

      const session = await prisma.userSession.findUnique({
        where: { refreshToken },
        include: {
          user: {
            include: {
              userRoles: {
                include: {
                  role: {
                    include: {
                      rolePermissions: {
                        include: {
                          permission: true
                        }
                      }
                    }
                  }
                }
              },
              userPermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return reply.status(401).send({
          success: false,
          message: 'Refresh token không hợp lệ'
        });
      }

      const user = session.user;

      // Collect permissions
      const permissions = new Set<string>();
      
      user.userRoles.forEach((userRole: any) => {
        userRole.role.rolePermissions.forEach((rolePermission: any) => {
          permissions.add(rolePermission.permission.code);
        });
      });

      user.userPermissions.forEach((userPermission: any) => {
        if (userPermission.granted) {
          permissions.add(userPermission.permission.code);
        } else {
          permissions.delete(userPermission.permission.code);
        }
      });

      const roles = user.userRoles.map((userRole: any) => userRole.role.code);

      // Generate new access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          roles,
          permissions: Array.from(permissions)
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Update session
      await prisma.userSession.update({
        where: { id: session.id },
        data: { 
          token: newAccessToken,
          lastUsedAt: new Date()
        }
      });

      reply.send({
        success: true,
        data: { accessToken: newAccessToken }
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