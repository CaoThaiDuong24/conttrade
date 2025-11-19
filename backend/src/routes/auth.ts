// @ts-nocheck
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // A-001: POST /auth/register - Đăng ký tài khoản
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, phone, password, displayName, defaultLocale } = request.body as any;

      // Kiểm tra email hoặc phone đã tồn tại
      const existingUser = await prisma.$queryRaw`
        SELECT id FROM users 
        WHERE email = ${email || null} OR phone = ${phone || null}
        LIMIT 1
      `;

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Email hoặc số điện thoại đã được sử dụng' 
        });
      }

      // Mã hóa password
      const passwordHash = await bcrypt.hash(password, 12);

      // Tạo user mới
      const { randomUUID } = await import('crypto');
      const userId = randomUUID();
      const fullName = displayName; // fallback
      const userResult = await prisma.$queryRaw`
        INSERT INTO users (id, email, phone, password_hash, display_name, default_locale, status, kyc_status, created_at, updated_at)
        VALUES (${userId}, ${email}, ${phone}, ${passwordHash}, ${displayName}, ${defaultLocale || 'vi'}, 'ACTIVE', 'UNVERIFIED', NOW(), NOW())
        RETURNING id, email, phone, display_name, default_locale, status, kyc_status
      `;
      const user = Array.isArray(userResult) ? userResult[0] : userResult;

      // Tự động gán buyer role cho người dùng mới
      try {
        const buyerRole = await prisma.roles.findUnique({
          where: { code: 'buyer' }
        });

        if (buyerRole) {
          await prisma.user_roles.create({
            data: {
              id: randomUUID(),
              user_id: user.id,
              role_id: buyerRole.id,
              assigned_at: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          fastify.log.info(`✅ Assigned buyer role to new user: ${user.email}`);
        } else {
          fastify.log.warn('⚠️ Buyer role not found, user created without role');
        }
      } catch (roleError) {
        fastify.log.error('Error assigning buyer role:', roleError);
        // Không throw error, để user vẫn được tạo thành công
      }

      // Lấy lại user với roles và permissions để tạo JWT token đầy đủ
      const userWithRoles = await prisma.users.findUnique({
        where: { id: user.id },
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

      // Lấy danh sách roles và permissions
      const roles = userWithRoles?.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code) || [];
      const permissions = new Set<string>();
      
      userWithRoles?.user_roles_user_roles_user_idTousers.forEach(ur => {
        ur.roles.role_permissions.forEach(rp => {
          permissions.add(rp.permissions.code);
        });
      });

      // Tạo JWT token với roles và permissions
      const token = fastify.jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          roles: roles,
          permissions: Array.from(permissions)
        },
        { expiresIn: '7d' }
      );

      // Tạo refresh token
      const refreshToken = fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: '30d' }
      );

      await prisma.refresh_tokens.create({
        data: {
          token: refreshToken,
          user_id: user.id
        }
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.display_name,
            defaultLocale: user.default_locale,
            status: user.status,
            kycStatus: user.kyc_status,
            roles: roles
          },
          accessToken: token,
          refreshToken
        }
      });
    } catch (error) {
      fastify.log.error('Register error:', error);
      console.error('Detailed register error:', {
        error: error,
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      });
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    }
  });

  // A-002: POST /auth/login - Đăng nhập
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, phone, password } = request.body as any;

      // Tìm user theo email hoặc phone với roles và permissions
      const user = await prisma.users.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { phone: phone || undefined }
          ],
          status: 'ACTIVE'
        },
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
        return reply.status(401).send({ 
          success: false, 
          message: 'Thông tin đăng nhập không chính xác' 
        });
      }

      // Kiểm tra password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Thông tin đăng nhập không chính xác' 
        });
      }

      // Lấy danh sách roles và permissions của user
      const roles = user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code);
      const roleVersions: Record<string, number> = {};
      const permissions = new Set<string>();
      
      user.user_roles_user_roles_user_idTousers.forEach(ur => {
        roleVersions[ur.roles.code] = ur.roles.role_version || 1;
        // Collect all permissions from this role
        ur.roles.role_permissions.forEach(rp => {
          permissions.add(rp.permissions.code);
        });
      });
      
      console.log('🔐 User roles on login:', roles, 'Versions:', roleVersions);
      console.log('🔑 User permissions:', Array.from(permissions));

      // Tạo JWT token với roles, permissions và roleVersions
      const token = fastify.jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          roles: roles,
          permissions: Array.from(permissions),
          roleVersions: roleVersions // Track version for real-time permission updates
        },
        { expiresIn: '7d' }
      );

      // Cập nhật last_login_at và reset permissions_updated_at
      // Reset permissions_updated_at vì user đã nhận permissions mới qua JWT
      await prisma.users.update({
        where: { id: user.id },
        data: { 
          last_login_at: new Date(),
          permissions_updated_at: null // Reset để token không bị reject ngay
        }
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            display_name: user.display_name,
            first_name: user.first_name,
            last_name: user.last_name,
            default_locale: user.default_locale,
            status: user.status,
            kyc_status: user.kyc_status,
            roles: roles
          },
          token: token
        }
      });
    } catch (error) {
      fastify.log.error('Login error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-003: POST /auth/refresh - Làm mới token
  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as any;

      // Kiểm tra refresh token
      const tokenRecord = await prisma.refresh_tokens.findUnique({
        where: { token: refreshToken },
        include: { 
          users: {
            include: {
              user_roles_user_roles_user_idTousers: {
                include: {
                  roles: true
                }
              }
            }
          }
        }
      });

      if (!tokenRecord || tokenRecord.revokedAt) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Refresh token không hợp lệ' 
        });
      }

      // Lấy roles và roleVersions mới nhất
      const roles = tokenRecord.users.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code);
      const roleVersions: Record<string, number> = {};
      tokenRecord.users.user_roles_user_roles_user_idTousers.forEach(ur => {
        roleVersions[ur.roles.code] = ur.roles.role_version || 1;
      });

      // Tạo token mới với roleVersions mới nhất
      const newToken = fastify.jwt.sign(
        { 
          userId: tokenRecord.userId, 
          email: tokenRecord.users.email,
          roles: roles,
          roleVersions: roleVersions
        },
        { expiresIn: '7d' }
      );

      return reply.send({
        success: true,
        data: { accessToken: newToken }
      });
    } catch (error) {
      fastify.log.error('Refresh token error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-003.1: GET /auth/check-version - Kiểm tra version của permissions (Real-time Permission Check)
  fastify.get('/check-version', async (request, reply) => {
    try {
      // Verify JWT token
      await request.jwtVerify();
      const { userId, roleVersions: tokenRoleVersions } = request.user as any;

      // Lấy version hiện tại từ database
      const userWithRoles = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles_user_roles_user_idTousers: {
            include: {
              roles: true
            }
          }
        }
      });

      if (!userWithRoles) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      // So sánh version
      const currentRoleVersions: Record<string, number> = {};
      userWithRoles.user_roles_user_roles_user_idTousers.forEach(ur => {
        currentRoleVersions[ur.roles.code] = ur.roles.role_version || 1;
      });

      let hasChanges = false;
      const changedRoles: string[] = [];

      // Kiểm tra version có thay đổi không
      if (tokenRoleVersions) {
        for (const [roleCode, tokenVersion] of Object.entries(tokenRoleVersions)) {
          const dbVersion = currentRoleVersions[roleCode];
          if (dbVersion && dbVersion > tokenVersion) {
            hasChanges = true;
            changedRoles.push(roleCode);
          }
        }
      }

      return reply.send({
        success: true,
        data: {
          hasChanges,
          changedRoles,
          currentVersions: currentRoleVersions,
          tokenVersions: tokenRoleVersions || {},
          requireReauth: hasChanges // Client should logout and re-login
        }
      });
    } catch (error) {
      fastify.log.error('Check version error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });

  // A-004: POST /auth/logout - Đăng xuất
  fastify.post('/logout', async (request, reply) => {
    try {
      const { refreshToken } = request.body as any;

      if (refreshToken) {
        await prisma.refresh_tokens.updateMany({
          where: { token: refreshToken },
          data: { revokedAt: new Date() }
        });
      }

      return reply.send({ success: true, message: 'Đăng xuất thành công' });
    } catch (error) {
      fastify.log.error('Logout error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-005: POST /auth/forgot-password - Quên mật khẩu
  fastify.post('/forgot-password', async (request, reply) => {
    try {
      const { email, phone } = request.body as any;

      const user = await prisma.userss.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { phone: phone || undefined }
          ]
        }
      });

      if (!user) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tài khoản' 
        });
      }

      // TODO: Gửi email/SMS reset password
      // Tạo reset token và lưu vào database
      // Gửi link reset qua email/SMS

      return reply.send({ 
        success: true, 
        message: 'Hướng dẫn đặt lại mật khẩu đã được gửi' 
      });
    } catch (error) {
      fastify.log.error('Forgot password error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-006: POST /auth/reset-password - Đặt lại mật khẩu
  fastify.post('/reset-password', async (request, reply) => {
    try {
      const { token, newPassword } = request.body as any;

      // TODO: Verify reset token và update password
      // Kiểm tra token có hợp lệ không
      // Mã hóa password mới và update

      return reply.send({ 
        success: true, 
        message: 'Mật khẩu đã được đặt lại thành công' 
      });
    } catch (error) {
      fastify.log.error('Reset password error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-007: GET /auth/me - Thông tin tài khoản hiện tại
  // ⚡ PERFORMANCE: Optimized query with select to avoid fetching unnecessary data
  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;

      // ⚡ OPTIMIZED: Use selective fields instead of fetching everything
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          display_name: true,
          default_locale: true,
          status: true,
          kyc_status: true,
          created_at: true,
          // Only select necessary role data
          user_roles_user_roles_user_idTousers: {
            select: {
              roles: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  // Only fetch permission codes, not full objects
                  role_permissions: {
                    select: {
                      permissions: {
                        select: {
                          id: true,
                          code: true,
                          name: true
                        }
                      }
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
          message: 'Không tìm thấy tài khoản' 
        });
      }

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.display_name,
            defaultLocale: user.default_locale,
            status: user.status,
            kycStatus: user.kyc_status,
            createdAt: user.created_at,
            roles: user.user_roles_user_roles_user_idTousers.map(ur => ({
              id: ur.roles.id,
              code: ur.roles.code,
              name: ur.roles.name,
              permissions: ur.roles.role_permissions.map(rp => ({
                id: rp.permissions.id,
                code: rp.permissions.code,
                name: rp.permissions.name
              }))
            }))
          }
        }
      });
    } catch (error) {
      fastify.log.error('Get me error:', error);
      return reply.status(401).send({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
  });

  // A-008: PUT /auth/profile - Cập nhật thông tin cá nhân
  fastify.put('/profile', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;
      const { displayName, defaultLocale } = request.body as any;

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          display_name: displayName,
          default_locale: defaultLocale
        }
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            phone: updatedUser.phone,
            displayName: updatedUser.display_name,
            defaultLocale: updatedUser.default_locale,
            status: updatedUser.status,
            kycStatus: updatedUser.kyc_status
          }
        }
      });
    } catch (error) {
      fastify.log.error('Update profile error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-009: PUT /auth/change-password - Đổi mật khẩu
  fastify.put('/change-password', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;
      const { currentPassword, newPassword } = request.body as any;

      const user = await prisma.users.findUnique({
        where: { id: userId }
      });      if (!user) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tài khoản' 
        });
      }

      // Kiểm tra mật khẩu hiện tại
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Mật khẩu hiện tại không chính xác' 
        });
      }

      // Mã hóa mật khẩu mới
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await prisma.users.update({
        where: { id: userId },
        data: { password_hash: newPasswordHash }
      });

      return reply.send({ 
        success: true, 
        message: 'Mật khẩu đã được thay đổi thành công' 
      });
    } catch (error) {
      fastify.log.error('Change password error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-010: POST /auth/refresh-permissions - Làm mới permissions trong JWT
  // Dùng khi admin thay đổi quyền của user, user gọi endpoint này để lấy token mới
  fastify.post('/refresh-permissions', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;

      // Lấy lại roles và permissions mới nhất từ database
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
          message: 'Không tìm thấy tài khoản'
        });
      }

      // Lấy danh sách roles và permissions mới nhất
      const roles = user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code);
      const roleVersions: Record<string, number> = {};
      const permissions = new Set<string>();
      
      user.user_roles_user_roles_user_idTousers.forEach(ur => {
        roleVersions[ur.roles.code] = ur.roles.role_version || 1;
        ur.roles.role_permissions.forEach(rp => {
          permissions.add(rp.permissions.code);
        });
      });

      console.log('🔄 Refreshing permissions for user:', userId);
      console.log('   New roles:', roles);
      console.log('   New permissions:', Array.from(permissions));

      // Reset permissions_updated_at vì user đã nhận permissions mới
      await prisma.users.update({
        where: { id: userId },
        data: { 
          permissions_updated_at: null,
          updated_at: new Date()
        }
      });

      // Tạo JWT token mới với permissions cập nhật
      const newToken = fastify.jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          roles: roles,
          permissions: Array.from(permissions),
          roleVersions: roleVersions
        },
        { expiresIn: '7d' }
      );

      return reply.send({
        success: true,
        message: 'Quyền đã được cập nhật',
        data: {
          token: newToken,
          roles: roles,
          permissions: Array.from(permissions)
        }
      });
    } catch (error) {
      fastify.log.error('Refresh permissions error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
}
