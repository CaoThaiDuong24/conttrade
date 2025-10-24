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
      const userResult = await prisma.$queryRaw`
        INSERT INTO users (email, phone, password, display_name, default_locale, status, kyc_status, created_at, updated_at)
        VALUES (${email}, ${phone}, ${passwordHash}, ${displayName}, ${defaultLocale || 'vi'}, 'active', 'unverified', NOW(), NOW())
        RETURNING id, email, phone, display_name, default_locale, status, kyc_status
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

      await prisma.$queryRaw`
        INSERT INTO refresh_tokens (token, user_id, created_at)
        VALUES (${refreshToken}, ${user.id}, NOW())
      `;

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
            kycStatus: user.kyc_status
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

      // Tìm user theo email hoặc phone
      const userResult = await prisma.$queryRaw`
        SELECT id, email, phone, password, display_name, default_locale, status, kyc_status
        FROM users 
        WHERE (email = ${email || null} OR phone = ${phone || null})
        AND status = 'active'
        LIMIT 1
      `;
      
      const user = Array.isArray(userResult) && userResult.length > 0 ? userResult[0] : null;

      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Thông tin đăng nhập không chính xác' 
        });
      }

      // Kiểm tra password
      const isValidPassword = await bcrypt.compare(password, user.password);
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
        INSERT INTO refresh_tokens (token, user_id, created_at)
        VALUES (${refreshToken}, ${user.id}, NOW())
      `;

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
            kycStatus: user.kyc_status
          },
          accessToken: token,
          refreshToken
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
}

