// @ts-nocheck
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export default async function simpleAuthRoutes(fastify: FastifyInstance) {
  // Handle OPTIONS requests for CORS
  fastify.options('/*', async (request, reply) => {
    reply.code(200).send();
  });
  
  // Simple login with comprehensive error handling
  fastify.post('/login', async (request, reply) => {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Request body:', request.body);
      
      const body = request.body as any;
      const { email, password } = body;

      // Input validation
      if (!email || !password) {
        console.log('Missing email or password');
        return reply.status(400).send({
          success: false,
          message: 'Email và password là bắt buộc'
        });
      }

      console.log('Looking up user with email:', email);

      // Simple user lookup with raw query to avoid Prisma issues
      const users = await prisma.$queryRaw`
        SELECT id, email, password, "displayName", status, "kycStatus" 
        FROM users 
        WHERE email = ${email}
        LIMIT 1
      `;

      console.log('Query result:', users);

      if (!Array.isArray(users) || users.length === 0) {
        console.log('User not found');
        return reply.status(401).send({
          success: false,
          message: 'Email hoặc password không đúng'
        });
      }

      const user = users[0] as any;
      console.log('Found user:', { id: user.id, email: user.email });

      // Password check
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValidPassword);

      if (!isValidPassword) {
        console.log('Invalid password');
        return reply.status(401).send({
          success: false,
          message: 'Email hoặc password không đúng'
        });
      }

      // Create token
      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '7d' }
      );

      console.log('Login successful for user:', user.email);

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            status: user.status,
            kycStatus: user.kycStatus
          },
          accessToken: token
        }
      });

    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      });
      
      fastify.log.error('Login error:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Health check
  fastify.get('/health', async (request, reply) => {
    return reply.send({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Get current user info (requires authentication)
  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({
          success: false,
          message: 'Token không hợp lệ'
        });
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user as any;
      console.log('Getting user info for:', user.userId);

      // Get user from database
      const users = await prisma.$queryRaw`
        SELECT id, email, "displayName", status, "kycStatus", "createdAt" 
        FROM users 
        WHERE id = ${user.userId}
        LIMIT 1
      `;

      if (!Array.isArray(users) || users.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      const userData = users[0] as any;

      return reply.send({
        success: true,
        data: {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          status: userData.status,
          kycStatus: userData.kycStatus,
          createdAt: userData.createdAt
        }
      });

    } catch (error: any) {
      console.error('Get user error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống'
      });
    }
  });
}
