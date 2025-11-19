import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createNotificationsTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes separately
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at)`;
    
    console.log('✅ Notifications table created successfully');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createNotificationsTable();