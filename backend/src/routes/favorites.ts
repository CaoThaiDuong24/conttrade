// @ts-nocheck
/**
 * FAVORITES API - Lưu listings yêu thích
 */
import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export async function favoritesRoutes(server: FastifyInstance) {
  // GET /favorites
  server.get('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const favorites = await prisma.favorites.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              seller: { select: { id: true, displayName: true, fullName: true, avatar: true } },
              locationDepot: { select: { id: true, name: true, code: true, province: true } },
              facets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      reply.send({
        success: true,
        data: favorites.map((fav: any) => ({
          favoriteId: fav.id,
          favoritedAt: fav.createdAt,
          listing: fav.listing,
        })),
        total: favorites.length,
      });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /favorites
  server.post<{ Body: { listingId: string } }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { listingId } = req.body;

      if (!listingId) {
        return reply.code(400).send({ success: false, error: 'listingId required' });
      }

      const listing = await prisma.listings.findUnique({ where: { id: listingId } });
      if (!listing) {
        return reply.code(404).send({ success: false, error: 'Listing not found' });
      }

      const existing = await prisma.favorites.findUnique({
        where: { userId_listingId: { userId, listingId } },
      });

      if (existing) {
        return reply.code(400).send({ success: false, error: 'Already in favorites' });
      }

      const favorite = await prisma.favorites.create({
        data: { userId, listingId },
        include: { listing: { select: { id: true, title: true, priceAmount: true, priceCurrency: true, status: true } } },
      });

      reply.code(201).send({ success: true, data: favorite, message: 'Added to favorites' });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // DELETE /favorites/:listingId
  server.delete<{ Params: { listingId: string } }>('/:listingId', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { listingId } = req.params;

      const favorite = await prisma.favorites.findUnique({
        where: { userId_listingId: { userId, listingId } },
      });

      if (!favorite) {
        return reply.code(404).send({ success: false, error: 'Favorite not found' });
      }

      await prisma.favorites.delete({
        where: { userId_listingId: { userId, listingId } },
      });

      reply.send({ success: true, message: 'Removed from favorites' });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /favorites/check/:listingId
  server.get<{ Params: { listingId: string } }>('/check/:listingId', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { listingId } = req.params;

      const favorite = await prisma.favorites.findUnique({
        where: { userId_listingId: { userId, listingId } },
      });

      reply.send({
        success: true,
        data: { isFavorite: !!favorite, favoriteId: favorite?.id || null },
      });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /favorites/stats
  server.get('/stats', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const count = await prisma.favorites.count({ where: { userId } });

      reply.send({ success: true, data: { totalFavorites: count } });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}

