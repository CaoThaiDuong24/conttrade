import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const rentalContainerStatsRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/rental/containers/stats - Get container statistics
  app.get('/rental/containers/stats', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as any)?.userId

      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      // Get all containers for seller
      const containers = await prisma.listing_containers.findMany({
        where: {
          listing: {
            seller_user_id: userId,
            deal_type: 'RENTAL',
          },
        },
        include: {
          listing: true,
        },
      })

      // Calculate stats
      const total = containers.length
      const available = containers.filter((c) => c.status === 'AVAILABLE').length
      const rented = containers.filter((c) => c.status === 'RENTED').length
      const maintenance = containers.filter((c) => c.status === 'IN_MAINTENANCE').length
      const reserved = containers.filter((c) => c.status === 'RESERVED').length

      return reply.send({
        total,
        available,
        rented,
        maintenance,
        reserved,
        utilization: total > 0 ? ((rented / total) * 100).toFixed(1) : '0',
      })
    } catch (error) {
      console.error('Error fetching container stats:', error)
      return reply.code(500).send({ error: 'Failed to fetch container stats' })
    }
  })

  // GET /api/v1/rental/containers - Get all rental containers for seller
  app.get('/rental/containers', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as any)?.userId

      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      const containers = await prisma.listing_containers.findMany({
        where: {
          listing: {
            seller_user_id: userId,
            deal_type: 'RENTAL',
          },
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price_amount: true,
              price_currency: true,
              rental_unit: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      })

      // Map containers with additional info
      const containersWithInfo = containers.map((container) => ({
        id: container.id,
        container_number: container.container_iso_code,
        status: container.status,
        manufactured_year: container.manufactured_year,
        rental_rate: container.listing?.price_amount ? `${container.listing.price_amount} ${container.listing.price_currency}` : null,
        listing_id: container.listing_id,
        // You can add current_rental and maintenance_scheduled by additional queries if needed
      }))

      return reply.send({
        containers: containersWithInfo,
        total: containersWithInfo.length,
      })
    } catch (error) {
      console.error('Error fetching containers:', error)
      return reply.code(500).send({ error: 'Failed to fetch containers' })
    }
  })
}

export default rentalContainerStatsRoutes
