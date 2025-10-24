// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import prisma from '../lib/prisma';

export default async function mediaRoutes(fastify: FastifyInstance) {
  // Test endpoint without auth
  fastify.get('/test', async (request, reply) => {
    return { success: true, message: 'Media routes working!' };
  });

  // M-001: POST /media/upload - Upload media files
  fastify.post('/upload', {
    preHandler: async (request, reply) => {
      try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error:', err.message);
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      console.log('=== UPLOAD MEDIA DEBUG ===');
      
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('File info:', {
        filename: data.filename,
        mimetype: data.mimetype,
        encoding: data.encoding
      });

      // Validate file type
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
      const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MPEG, MOV) are allowed.'
        });
      }

      // Validate file size (max 10MB for images, 100MB for videos)
      const maxImageSize = 10 * 1024 * 1024; // 10MB
      const maxVideoSize = 100 * 1024 * 1024; // 100MB
      const isImage = allowedImageTypes.includes(data.mimetype);
      const maxSize = isImage ? maxImageSize : maxVideoSize;

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'media');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(data.filename || '');
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      console.log('Saving file to:', filePath);

      // Save file to disk
      await pipeline(data.file, createWriteStream(filePath));

      // Check file size after saving
      const stats = await fs.stat(filePath);
      if (stats.size > maxSize) {
        // Delete the file if it's too large
        await fs.unlink(filePath);
        return reply.status(400).send({
          success: false,
          message: `File too large. Maximum size is ${isImage ? '10MB' : '100MB'}.`
        });
      }

      // Generate media URL (this would be your CDN or static file URL)
      const mediaUrl = `/uploads/media/${uniqueFilename}`;
      const mediaType = isImage ? 'image' : 'video';

      console.log('Media uploaded successfully');

      return reply.send({
        success: true,
        data: {
          media: {
            id: randomUUID(), // Temporary ID for frontend tracking
            url: mediaUrl,
            type: mediaType,
            size: stats.size,
            filename: data.filename,
            uniqueFilename: uniqueFilename
          }
        }
      });

    } catch (error: any) {
      console.error('=== UPLOAD MEDIA ERROR ===');
      console.error('Error details:', error);
      
      fastify.log.error('Upload media error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống khi upload file',
        error: error.message 
      });
    }
  });

  // M-002: DELETE /media/:filename - Delete media file
  fastify.delete('/:filename', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Token không hợp lệ' });
      }
    }
  }, async (request, reply) => {
    try {
      const { filename } = request.params as any;

      // Delete file from disk
      const filePath = path.join(process.cwd(), 'uploads', 'media', filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Could not delete file from disk:', err);
        return reply.status(404).send({
          success: false,
          message: 'File not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Media deleted successfully'
      });

    } catch (error: any) {
      fastify.log.error('Delete media error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // M-003: GET /media/:filename - Get media file info
  fastify.get('/:filename', async (request, reply) => {
    try {
      const { filename } = request.params as any;
      const filePath = path.join(process.cwd(), 'uploads', 'media', filename);

      // Check if file exists
      try {
        const stats = await fs.stat(filePath);
        
        return reply.send({
          success: true,
          data: {
            filename: filename,
            size: stats.size,
            url: `/uploads/media/${filename}`,
            created: stats.birthtime
          }
        });
      } catch (err) {
        return reply.status(404).send({
          success: false,
          message: 'File not found'
        });
      }

    } catch (error: any) {
      fastify.log.error('Get media error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });
}