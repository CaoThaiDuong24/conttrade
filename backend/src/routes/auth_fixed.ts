// @ts-nocheck
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // A-001: POST /auth/register - Đăng ký tài khoản
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, phone, password, displayName, fullName, defaultLocale, type, acceptTos } = request.body as any;

      // Validation
      if (!acceptTos) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Vui lòng đồng ý với điều khoản sử dụng' 
        });
      }

      if (!email && !phone) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Vui lòng nhập email hoặc số điện thoại' 
        });
      }

      if (!password || password.length < 6) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Mật khẩu phải có ít nhất 6 ký tự' 
        });
      }

      // Mã hóa password
      const passwordHash = await bcrypt.hash(password, 12);

      // Kiểm tra email hoặc phone đã tồn tại
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { phone: phone || undefined }
          ]
        }
      });

      if (existingUser) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Email hoặc số điện thoại đã được sử dụng' 
        });
      }

      // Tạo user mới
      const user = await (prisma.user as any).create({
        data: {
          email,
          phone,
          password: passwordHash,
          displayName: displayName || fullName || 'User',
          status: 'ACTIVE',
          kycStatus: 'UNVERIFIED'
        }
      });

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

      await prisma.$queryRaw`
        INSERT INTO sessions (id, "sessionToken", "userId", expires)
        VALUES (gen_random_uuid(), ${refreshToken}, ${user.id}, NOW() + INTERVAL '30 days')
      `;

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
    } catch (error: any) {
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

      // Tìm user theo email hoặc phone
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { phone: phone || undefined }
          ],
          status: 'ACTIVE'
        }
      });

      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Thông tin đăng nhập không chính xác' 
        });
      }

      // Kiểm tra password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Thông tin đăng nhập không chính xác' 
        });
      }

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

      await prisma.$queryRaw`
        INSERT INTO sessions (id, "sessionToken", "userId", expires)
        VALUES (gen_random_uuid(), ${refreshToken}, ${user.id}, NOW() + INTERVAL '30 days')
      `;

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
    } catch (error: any) {
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
      const tokenResult = await prisma.$queryRaw`
        SELECT "userId", expires FROM sessions 
        WHERE "sessionToken" = ${refreshToken}
        AND expires > NOW()
        LIMIT 1
      `;
      
      const tokenRecord = Array.isArray(tokenResult) && tokenResult.length > 0 ? tokenResult[0] : null;

      if (!tokenRecord) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Refresh token không hợp lệ' 
        });
      }

      // Lấy thông tin user
      const userResult = await prisma.$queryRaw`
        SELECT id, email, phone, "displayName", "defaultLocale", status, "kycStatus"
        FROM users 
        WHERE id = ${tokenRecord.userId}
        LIMIT 1
      `;
      
      const user = Array.isArray(userResult) && userResult.length > 0 ? userResult[0] : null;

      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'User không tồn tại' 
        });
      }

      // Tạo token mới
      const newToken = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '7d' }
      );

      return reply.send({
        success: true,
        data: { accessToken: newToken }
      });
    } catch (error: any) {
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
        await prisma.$queryRaw`
          DELETE FROM sessions 
          WHERE "sessionToken" = ${refreshToken}
        `;
      }

      return reply.send({ success: true, message: 'Đăng xuất thành công' });
    } catch (error: any) {
      fastify.log.error('Logout error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // A-007: GET /auth/me - Thông tin tài khoản hiện tại
  fastify.get('/me', async (request, reply) => {
    try {
      // Lấy token từ header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Token không hợp lệ' 
        });
      }

      const token = authHeader.substring(7);
      
      // Verify token
      const decoded = fastify.jwt.verify(token) as any;
      
      // Lấy thông tin user
      const userResult = await prisma.$queryRaw`
        SELECT id, email, phone, "displayName", "defaultLocale", status, "kycStatus"
        FROM users 
        WHERE id = ${decoded.userId}
        LIMIT 1
      `;
      
      const user = Array.isArray(userResult) && userResult.length > 0 ? userResult[0] : null;

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
            kycStatus: user.kycStatus
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Get me error:', error);
      return reply.status(401).send({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
  });
}

