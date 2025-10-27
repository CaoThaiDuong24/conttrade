// @ts-nocheck
import { FastifyInstance } from 'fastify';
import adminUserRoutes from './users.js';
import rbacRoutes from './rbac.js';

export default async function adminRoutes(fastify: FastifyInstance) {
  // Register admin user routes
  await fastify.register(adminUserRoutes, { prefix: '/users' });
  
  // Register RBAC routes
  await fastify.register(rbacRoutes, { prefix: '/rbac' });
}