import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Import routes
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import serviceRoutes from './routes/serviceRoutes'
import bookingRoutes from './routes/bookingRoutes'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'

dotenv.config()

const app: Application = express()

// Initialize Supabase with your credentials
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'https://www.meidriveafrica.com', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'MeiDriveAfrica API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      services: '/api/v1/services',
      bookings: '/api/v1/bookings'
    }
  })
})

// API routes
const apiPrefix = process.env.API_PREFIX || '/api/v1'
app.use(`${apiPrefix}/auth`, authRoutes)
app.use(`${apiPrefix}/users`, userRoutes)
app.use(`${apiPrefix}/services`, serviceRoutes)
app.use(`${apiPrefix}/bookings`, bookingRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 10000
app.listen(PORT, () => {
  console.log(`
    🚀 MeiDriveAfrica Backend Server
    📍 Port: ${PORT}
    🌍 Environment: ${process.env.NODE_ENV}
    🔗 API URL: http://localhost:${PORT}${apiPrefix}
    📝 Supabase: Connected
    🌐 Frontend: ${process.env.FRONTEND_URL}
  `)
})

export default app
