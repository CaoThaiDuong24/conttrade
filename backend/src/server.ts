// @ts-nocheck
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from environment.env
config({ path: join(__dirname, '../../environment.env') })

import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import prisma from './lib/prisma'
import authRoutes from './routes/auth'
import listingRoutes from './routes/listings'
import adminRoutes from './routes/admin'
import depotRoutes from './routes/depots'
import masterDataRoutes from './routes/master-data-simple'
import rfqRoutes from './routes/rfqs'
import quoteRoutes from './routes/quotes'
import orderRoutes from './routes/orders'
import deliveryRoutes from './routes/deliveries'
import disputesRoutes from './routes/disputes'
import notificationRoutes from './routes/notifications'
import mediaRoutes from './routes/media'
import { messagesRoutes } from './routes/messages.js'
import { favoritesRoutes } from './routes/favorites.js'
import { reviewsRoutes } from './routes/reviews.js'
import paymentRoutes from './routes/payments'
import dashboardRoutes from './routes/dashboard'
import { initializeCronJobs } from './services/cron-jobs.js'

const app = Fastify({ logger: true })

const JWT_SECRET = process.env.JWT_SECRET?.trim() || 'dev-secret-change-me'

console.log('Configuring CORS...')
await app.register(cors, {
  origin: true,
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Idempotency-Key',
    'idempotency-key',
    'X-Requested-With',
    'Accept',
    'Accept-Language'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400
});

console.log('Registering sensible plugin...')
// await app.register(sensible) // Commented out - causing issues

console.log('Registering JWT plugin...')
await app.register(jwt, { 
  secret: JWT_SECRET
})

console.log('Registering multipart plugin...')
await app.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10 // max 10 files per request
  }
})

console.log('Registering static file serving...')
await app.register(fastifyStatic, {
  root: join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  decorateReply: false
})

console.log('Setting up JSON parser...')
// Built-in JSON support for Fastify 4.x
app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body: string | Buffer, done) {
  try {
    const bodyString = typeof body === 'string' ? body : body.toString()
    // Handle empty body
    if (!bodyString || bodyString.trim() === '') {
      done(null, {})
      return
    }
    const json = JSON.parse(bodyString)
    done(null, json)
  } catch (err) {
    done(err as Error, undefined)
  }
})

// Ensure DB connection on startup
console.log('Connecting to database...')
try {
  await prisma.$connect()
  app.log.info('Prisma connected')
  console.log('Database connected successfully!')
} catch (err) {
  app.log.error({ err }, 'Prisma connect failed')
  console.error('Database connection failed:', err)
}

// Helpers
function signAccessToken(payload: any) {
	return app.jwt.sign(payload, { expiresIn: '15m' })
}
function signRefreshToken(payload: any) {
	return app.jwt.sign(payload, { expiresIn: '7d' })
}

// Health
console.log('Registering health endpoint...')
app.get('/api/v1/health', async () => {
  console.log('Health endpoint called!')
  return { ok: true, timestamp: new Date().toISOString() }
})

// Enhanced error handler to prevent crashes
app.setErrorHandler((error, request, reply) => {
  console.error('🚨 Error Handler Triggered:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method
  })
  
  // Log but don't crash
  app.log.error({
    err: error,
    req: {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  }, 'Request error handled')
  
  const statusCode = error.statusCode || 500
  const message = statusCode >= 500 ? 'Internal Server Error' : error.message
  
  return reply.status(statusCode).send({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
})

// Auth preHandler
app.decorate('authenticate', async (req: any, res: any) => {
	try {
		await req.jwtVerify()
	} catch (err) {
		return res.unauthorized()
	}
})

// Register routes
console.log('Registering routes...')
try {
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  console.log('✅ Auth routes registered')
  
  await app.register(listingRoutes, { prefix: '/api/v1/listings' })
  console.log('✅ Listing routes registered')
  
  await app.register(adminRoutes, { prefix: '/api/v1/admin' })
  console.log('✅ Admin routes registered')
  
  await app.register(depotRoutes, { prefix: '/api/v1/depots' })
  console.log('✅ Depot routes registered')
  
  await app.register(masterDataRoutes, { prefix: '/api/v1/master-data' })
  console.log('✅ Master data routes registered')
  
  await app.register(mediaRoutes, { prefix: '/api/v1/media' })
  console.log('✅ Media routes registered')
  
  await app.register(rfqRoutes, { prefix: '/api/v1/rfqs' })
  console.log('✅ RFQ routes registered')
  
  await app.register(quoteRoutes, { prefix: '/api/v1/quotes' })
  console.log('✅ Quote routes registered')
  
  await app.register(orderRoutes, { prefix: '/api/v1/orders' })
  console.log('✅ Order routes registered')
  
  await app.register(deliveryRoutes, { prefix: '/api/v1/deliveries' })
  console.log('✅ Delivery routes registered')
  
  await app.register(disputesRoutes, { prefix: '/api/v1/disputes' })
  console.log('✅ Disputes routes registered')
  
  await app.register(notificationRoutes, { prefix: '/api/v1/notifications' })
  console.log('✅ Notification routes registered')
  
  await app.register(messagesRoutes, { prefix: '/api/v1/messages' })
  console.log('✅ Messages routes registered')
  
  await app.register(favoritesRoutes, { prefix: '/api/v1/favorites' })
  console.log('✅ Favorites routes registered')
  
  await app.register(reviewsRoutes, { prefix: '/api/v1/reviews' })
  console.log('✅ Reviews routes registered')
  
  await app.register(paymentRoutes, { prefix: '/api/v1/payments' })
  console.log('✅ Payment routes registered')
  
  await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
  console.log('✅ Dashboard routes registered')
} catch (err) {
  console.error('❌ Error registering routes:', err)
  throw err
}

const port = 3006  // Hardcoded to bypass env cache issue
const host = '0.0.0.0'  // Bind to all interfaces

console.log(`Port from env: ${process.env.PORT}`)
console.log(`Final port: ${port}`)
console.log(`Attempting to start server on ${host}:${port}...`)

try {
  await app.listen({ port, host })
  console.log(`✅ Server started successfully!`)
  console.log(`🌐 API running at http://localhost:${port}`)
  console.log(`🌐 API also available at http://127.0.0.1:${port}`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🕒 Started at: ${new Date().toISOString()}`)
  
  // Initialize cron jobs
  console.log('\n🕐 Initializing scheduled tasks...')
  initializeCronJobs()
  
  app.log.info(`API running at http://localhost:${port}`)
  app.log.info(`API also available at http://127.0.0.1:${port}`)
  
  // Periodic health check to ensure server stays alive
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toISOString()}`)
  }, 30000) // Every 30 seconds
  
  // Enhanced process stability
  let isShuttingDown = false
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', err)
    app.log.error({ err }, 'Uncaught exception - keeping server alive')
    // Don't exit - log and continue
  })
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
    app.log.error({ reason }, 'Unhandled promise rejection - keeping server alive')
    // Don't exit - log and continue
  })
  
  // Only shutdown on explicit SIGTERM or double SIGINT
  process.on('SIGTERM', gracefulShutdown)
  let sigintCount = 0
  process.on('SIGINT', () => {
    sigintCount++
    if (sigintCount === 1) {
      console.log('\n⚠️  Press Ctrl+C again to force shutdown')
      setTimeout(() => { sigintCount = 0 }, 5000) // Reset after 5 seconds
    } else {
      gracefulShutdown()
    }
  })
  
  async function gracefulShutdown() {
    if (isShuttingDown) return
    isShuttingDown = true
    
    console.log('\n🛑 Shutting down gracefully...')
    try {
      await app.close()
      await prisma.$disconnect()
      console.log('✅ Server shutdown complete')
    } catch (err) {
      console.error('❌ Error during shutdown:', err)
    }
    process.exit(0)
  }
  
} catch (err) {
  console.error('❌ Server startup failed:', err)
  app.log.error(err)
  process.exit(1)
}

