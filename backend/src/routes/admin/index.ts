// @ts-nocheck
import { FastifyInstance } from 'fastify';
import adminUserRoutes from './users';

export default async function adminRoutes(fastify: FastifyInstance) {
  // Register admin user routes
  await fastify.register(adminUserRoutes, { prefix: '/users' });
}