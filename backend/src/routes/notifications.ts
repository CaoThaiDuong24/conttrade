import { FastifyInstance } from 'fastify';

export default async function notificationRoutes(fastify: FastifyInstance) {
  // GET /notifications - Get user notifications
  fastify.get('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    
    try {
      const { NotificationService } = await import('../lib/notifications/notification-service');
      const result = await NotificationService.getNotifications(userId, 20);
      
      return reply.send({
        success: true,
        data: result.notifications || []
      });
    } catch (error: any) {
      fastify.log.error('Error getting notifications:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  });

  // POST /notifications/:id/read - Mark notification as read
  fastify.post<{ Params: { id: string } }>('/:id/read', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;
    
    try {
      const { NotificationService } = await import('../lib/notifications/notification-service');
      const result = await NotificationService.markAsRead(userId, id);
      
      return reply.send({
        success: result.success,
        message: result.success ? 'Notification marked as read' : 'Failed to mark as read'
      });
    } catch (error: any) {
      fastify.log.error('Error marking notification as read:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  });
}