// @ts-nocheck
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

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
      const userResult = await prisma.$queryRaw`
        INSERT INTO users (id, email, phone, password_hash, "displayName", "defaultLocale", status, "kycStatus", "createdAt", "updatedAt", "fullName")
        VALUES (${userId}, ${email}, ${phone}, ${passwordHash}, ${displayName}, ${defaultLocale || 'vi'}, 'ACTIVE', 'unverified', NOW(), NOW(), ${fullName})
        RETURNING id, email, phone, "displayName", "defaultLocale", status, "kycStatus", "fullName"
      `;
      const user = Array.isArray(userResult) ? userResult[0] : userResult;

      // Tạo JWT token
      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
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
            displayName: user.displayName,
            defaultLocale: user.defaultLocale,
            status: user.status,
            kycStatus: user.kycStatus
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

      // Tìm user theo email hoặc phone với roles
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
              roles: true
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

      // Lấy danh sách roles của user
      const roles = user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.code);
      console.log('🔐 User roles on login:', roles);

      // Tạo JWT token với roles
      const token = fastify.jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          roles: roles
        },
        { expiresIn: '7d' }
      );

      // Cập nhật last_login_at
      await prisma.users.update({
        where: { id: user.id },
        data: { last_login_at: new Date() }
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
        include: { users: true }
      });

      if (!tokenRecord || tokenRecord.revokedAt) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Refresh token không hợp lệ' 
        });
      }

      // Tạo token mới
      const newToken = fastify.jwt.sign(
        { userId: tokenRecord.userId, email: tokenRecord.users.email },
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
            displayName: user.displayName,
            defaultLocale: user.defaultLocale,
            status: user.status,
            kycStatus: user.kycStatus,
            createdAt: user.createdAt,
            roles: user.user_roles_user_roles_user_idTousers.map(ur => ({
              id: ur.roles.id,
              code: ur.roles.code,
              name: ur.roles.name,
              permissions: ur.roles.role_permissions.map(rp => ({
                id: rp.permissions.id,
                code: rp.permissions.code,
                name: rp.permissions.name
              }))
            })),
            organizations: user.org_users.map(ou => ({
              id: ou.organization.id,
              name: ou.organization.name,
              position: ou.position
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
          displayName,
          defaultLocale
        }
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            phone: updatedUser.phone,
            displayName: updatedUser.displayName,
            defaultLocale: updatedUser.defaultLocale,
            status: updatedUser.status,
            kycStatus: updatedUser.kycStatus
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

    const user = await prisma.userss.findUnique({
      where: { id: userId }
    });      if (!user) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Không tìm thấy tài khoản' 
        });
      }

      // Kiểm tra mật khẩu hiện tại
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
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
        data: { password: newPasswordHash }
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
}
