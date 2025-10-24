// @ts-nocheck
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export default async function authRoutes(fastify: FastifyInstance) {
  
  fastify.post('/login', async (request, reply) => {
    try {
      console.log('🔑 Login starting...');
      
      const { email, phone, password } = request.body as any;
      console.log('🔑 Login for:', email || phone);

      if (!password) {
        return reply.status(400).send({
          success: false,
          message: 'Password required'
        });
      }

      const user = await (prisma as any).users.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { phone: phone || undefined }
          ],
          status: 'active'
        }
      });

      console.log('👤 User found:', !!user);

      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔐 Password valid:', isValidPassword);

      if (!isValidPassword) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      let roles: string[] = [];
      try {
        const userRolesData = await (prisma as any).user_roles.findMany({
          where: { userId: user.id },
          include: { roles: true }
        });
        roles = userRolesData.map((ur: any) => ur.roles?.code).filter(Boolean);
        console.log('🎯 User roles:', roles);
      } catch (roleError) {
        console.log('⚠️ Role error, using empty');
        roles = [];
      }

      const token = fastify.jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          roles: roles
        },
        { expiresIn: '7d' }
      );

      const refreshToken = fastify.jwt.sign(
        { userId: user.id, roles: roles },
        { expiresIn: '30d' }
      );

      console.log('✅ Login successful:', user.email);

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
            roles: roles
          },
          accessToken: token,
          refreshToken
        }
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'System error'
      });
    }
  });

  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user as any;
      
      const userInfo = await (prisma as any).users.findUnique({
        where: { id: user.userId }
      });

      if (!userInfo) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      return reply.send({
        success: true,
        data: {
          user: {
            id: userInfo.id,
            email: userInfo.email,
            phone: userInfo.phone,
            displayName: userInfo.displayName,
            defaultLocale: userInfo.defaultLocale,
            status: userInfo.status,
            kycStatus: userInfo.kycStatus
          }
        }
      });
    } catch (error) {
      console.error('Get me error:', error);
      return reply.status(500).send({
        success: false,
        message: 'System error'
      });
    }
  });

}
