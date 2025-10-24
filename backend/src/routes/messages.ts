// @ts-nocheck
/**
 * MESSAGING API - Buyer và Seller chat trực tiếp
 */
import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export async function messagesRoutes(server: FastifyInstance) {
  // GET /conversations
  server.get('/conversations', {
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
      const conversations = await prisma.conversations.findMany({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        include: {
          listing: { select: { id: true, title: true, priceAmount: true, priceCurrency: true, status: true } },
          buyer: { select: { id: true, displayName: true, fullName: true, avatar: true } },
          seller: { select: { id: true, displayName: true, fullName: true, avatar: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true, senderId: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      reply.send({
        success: true,
        data: conversations.map((conv: any) => ({
          ...conv,
          unreadCount: conv.buyerId === userId ? conv.buyerUnread : conv.sellerUnread,
          otherUser: conv.buyerId === userId ? conv.seller : conv.buyer,
          lastMessage: conv.messages[0] || null,
        })),
      });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /conversations/:id
  server.get<{ Params: { id: string } }>('/conversations/:id', {
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
      const conversation = await prisma.conversations.findUnique({
        where: { id: req.params.id },
        include: {
          listing: true,
          buyer: { select: { id: true, displayName: true, fullName: true, avatar: true } },
          seller: { select: { id: true, displayName: true, fullName: true, avatar: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, displayName: true, fullName: true, avatar: true } } },
          },
        },
      });

      if (!conversation) {
        return reply.code(404).send({ success: false, error: 'Not found' });
      }
      if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
        return reply.code(403).send({ success: false, error: 'Access denied' });
      }

      // Mark as read
      const unread = (conversation.messages as any[]).filter(msg => msg.senderId !== userId && !msg.isRead);
      if (unread.length > 0) {
        await prisma.$transaction([
          prisma.messages.updateMany({
            where: { id: { in: unread.map(m => m.id) } },
            data: { isRead: true, readAt: new Date() },
          }),
          prisma.conversations.update({
            where: { id: conversation.id },
            data: conversation.buyerId === userId ? { buyerUnread: 0 } : { sellerUnread: 0 },
          }),
        ]);
      }

      reply.send({
        success: true,
        data: { ...conversation, otherUser: conversation.buyerId === userId ? conversation.seller : conversation.buyer },
      });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /messages
  server.post<{ Body: { conversationId?: string; listingId?: string; content: string; attachments?: any[] } }>('/', {
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
      const { conversationId, listingId, content, attachments } = req.body;

      if (!content?.trim()) {
        return reply.code(400).send({ success: false, error: 'Content required' });
      }

      let conversation;
      if (!conversationId && listingId) {
        const listing = await prisma.listings.findUnique({ where: { id: listingId }, select: { sellerUserId: true } });
        if (!listing) return reply.code(404).send({ success: false, error: 'Listing not found' });
        if (listing.sellerUserId === userId) return reply.code(400).send({ success: false, error: 'Cannot message yourself' });

        conversation = await prisma.conversations.findFirst({
          where: { listingId, buyerId: userId, sellerId: listing.sellerUserId },
        });

        if (!conversation) {
          conversation = await prisma.conversations.create({
            data: { listingId, buyerId: userId, sellerId: listing.sellerUserId, lastMessageAt: new Date() },
          });
        }
      } else if (conversationId) {
        conversation = await prisma.conversations.findUnique({ where: { id: conversationId } });
        if (!conversation) return reply.code(404).send({ success: false, error: 'Conversation not found' });
        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
          return reply.code(403).send({ success: false, error: 'Access denied' });
        }
      } else {
        return reply.code(400).send({ success: false, error: 'conversationId or listingId required' });
      }

      const message = await prisma.messages.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: content.trim(),
          attachments: attachments || [],
        },
        include: { sender: { select: { id: true, displayName: true, fullName: true, avatar: true } } },
      });

      await prisma.conversations.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          ...(conversation.buyerId === userId ? { sellerUnread: { increment: 1 } } : { buyerUnread: { increment: 1 } }),
        },
      });

      reply.code(201).send({ success: true, data: { message, conversationId: conversation.id } });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /unread-count
  server.get('/unread-count', {
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
      const conversations = await prisma.conversations.findMany({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        select: { buyerId: true, buyerUnread: true, sellerUnread: true },
      });

      const totalUnread = conversations.reduce((sum, conv) => {
        return sum + (conv.buyerId === userId ? conv.buyerUnread : conv.sellerUnread);
      }, 0);

      reply.send({ success: true, data: { totalUnread, conversationCount: conversations.length } });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}

