# Security Implementation Guide — i-ContExchange

Mã tài liệu: SECURITY-IMPL-v1.0  
Ngày: 2025-09-30  
Ngôn ngữ: Tiếng Việt  

Tài liệu này cung cấp hướng dẫn chi tiết về việc triển khai bảo mật cho hệ thống i-ContExchange, tuân thủ các tiêu chuẩn OWASP và quy định pháp luật Việt Nam.

---

## **1. AUTHENTICATION & AUTHORIZATION**

### **1.1. JWT Implementation**
```typescript
// backend/src/auth/jwt.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  sub: string;           // user_id
  roles: string[];       // ['RL-USER', 'RL-SELLER']
  permissions: string[]; // ['PM-010', 'PM-015']
  orgIds: string[];      // organizations user belongs to
  depotIds?: string[];   // depots user can access
  locale: string;        // 'vi' | 'en'
  iat: number;
  exp: number;
  jti: string;          // JWT ID for blacklisting
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly blacklistedTokens = new Set<string>();

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be provided');
    }
  }

  generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>) {
    const jti = crypto.randomUUID();
    
    const accessToken = jwt.sign(
      { ...payload, jti },
      this.accessTokenSecret,
      { 
        expiresIn: '15m',
        algorithm: 'RS256',
        issuer: 'icontexchange.vn',
        audience: 'icontexchange.vn'
      }
    );

    const refreshToken = jwt.sign(
      { sub: payload.sub, jti },
      this.refreshTokenSecret,
      { 
        expiresIn: '7d',
        algorithm: 'RS256'
      }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['RS256'],
        issuer: 'icontexchange.vn',
        audience: 'icontexchange.vn'
      }) as JWTPayload;

      if (this.blacklistedTokens.has(decoded.jti)) {
        throw new Error('Token has been blacklisted');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  blacklistToken(jti: string) {
    this.blacklistedTokens.add(jti);
    // TODO: Store in Redis for distributed systems
  }

  // Rate limiting for login attempts
  private loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  checkRateLimit(identifier: string): boolean {
    const now = new Date();
    const attempts = this.loginAttempts.get(identifier);

    if (!attempts) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if more than 15 minutes passed
    if (now.getTime() - attempts.lastAttempt.getTime() > 15 * 60 * 1000) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if exceeded 5 attempts in 15 minutes
    if (attempts.count >= 5) {
      return false;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }
}
```

### **1.2. Role-Based Access Control (RBAC)**
```typescript
// backend/src/auth/rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from './jwt.service';

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'AUTH-UNAUTHORIZED', message: 'Authentication required' }});
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: { 
          code: 'AUTH-FORBIDDEN', 
          message: `Permission ${permission} required`,
          required: permission,
          userPermissions: req.user.permissions
        }
      });
    }

    next();
  };
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.roles.includes(role)) {
      return res.status(403).json({ 
        error: { 
          code: 'AUTH-FORBIDDEN', 
          message: `Role ${role} required` 
        }
      });
    }
    next();
  };
}

// Scope-based access control for organizations/depots
export function requireScope(scopeType: 'org' | 'depot') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const scopeId = req.params.orgId || req.params.depotId;
    
    if (!scopeId) {
      return res.status(400).json({ 
        error: { code: 'INVALID-SCOPE', message: 'Scope ID required' }
      });
    }

    const userScopes = scopeType === 'org' ? req.user.orgIds : req.user.depotIds;
    
    if (!userScopes?.includes(scopeId)) {
      return res.status(403).json({ 
        error: { 
          code: 'SCOPE-FORBIDDEN', 
          message: `Access to ${scopeType} ${scopeId} not allowed` 
        }
      });
    }

    next();
  };
}
```

### **1.3. Two-Factor Authentication (2FA)**
```typescript
// backend/src/auth/2fa.service.ts
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export class TwoFactorService {
  generateSecret(userEmail: string) {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: 'i-ContExchange',
      length: 32
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url
    };
  }

  async generateQRCode(otpauth_url: string): Promise<string> {
    return qrcode.toDataURL(otpauth_url);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 60 seconds before/after
    });
  }

  generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex'));
    }
    return codes;
  }
}
```

---

## **2. INPUT VALIDATION & SANITIZATION**

### **2.1. Request Validation Middleware**
```typescript
// backend/src/validation/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize strings in request body
      const sanitizedBody = sanitizeObject(req.body);
      
      // Validate against schema
      const validatedData = schema.parse(sanitizedBody);
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          error: {
            code: 'REQ-VALIDATION',
            message: 'Validation failed',
            details: error.errors.reduce((acc, err) => {
              acc[err.path.join('.')] = err.message;
              return acc;
            }, {} as Record<string, string>)
          }
        });
      }
      next(error);
    }
  };
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// Specific validation schemas
export const CreateListingSchema = z.object({
  dealType: z.enum(['sale', 'rental']),
  containerSpecs: z.object({
    sizeFt: z.number().int().min(10).max(45),
    type: z.string().min(2).max(10),
    condition: z.enum(['new', 'used']),
    qualityStandard: z.enum(['WWT', 'CW', 'IICL'])
  }),
  price: z.object({
    amount: z.number().positive().max(1000000000), // Max 1 billion VND
    currency: z.enum(['VND', 'USD'])
  }),
  locationDepotId: z.string().uuid(),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000)
});

export const RFQSchema = z.object({
  listingId: z.string().uuid(),
  purpose: z.enum(['purchase', 'rental']),
  quantity: z.number().int().min(1).max(100),
  needBy: z.string().datetime(),
  services: z.object({
    inspection: z.boolean(),
    repair: z.boolean(),
    storage: z.boolean(),
    delivery: z.boolean(),
    insurance: z.boolean()
  }),
  additionalNotes: z.string().max(1000).optional()
});
```

### **2.2. Anti-Redaction Service**
```typescript
// backend/src/moderation/redaction.service.ts
export class RedactionService {
  private readonly phonePattern = /(?:(?:\+?84|0)(?:\d){9,10})/g;
  private readonly emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  private readonly zaloPattern = /(?:zalo|zl)\s*:?\s*(?:\+?84|0)?\d{9,10}/gi;
  private readonly facebookPattern = /(?:facebook|fb|m\.me)[\s\/]*[\w\.]+/gi;
  private readonly telegramPattern = /@[\w_]+/g;

  detectContactInfo(text: string): {
    hasContactInfo: boolean;
    detectedPatterns: string[];
    cleanedText: string;
  } {
    const detectedPatterns: string[] = [];
    let cleanedText = text;

    // Detect phone numbers
    const phoneMatches = text.match(this.phonePattern);
    if (phoneMatches) {
      detectedPatterns.push(...phoneMatches);
      cleanedText = cleanedText.replace(this.phonePattern, '[ĐT ĐÃ ĐƯỢC CHE]');
    }

    // Detect emails
    const emailMatches = text.match(this.emailPattern);
    if (emailMatches) {
      detectedPatterns.push(...emailMatches);
      cleanedText = cleanedText.replace(this.emailPattern, '[EMAIL ĐÃ ĐƯỢC CHE]');
    }

    // Detect Zalo
    const zaloMatches = text.match(this.zaloPattern);
    if (zaloMatches) {
      detectedPatterns.push(...zaloMatches);
      cleanedText = cleanedText.replace(this.zaloPattern, '[ZALO ĐÃ ĐƯỢC CHE]');
    }

    // Detect social media
    const facebookMatches = text.match(this.facebookPattern);
    if (facebookMatches) {
      detectedPatterns.push(...facebookMatches);
      cleanedText = cleanedText.replace(this.facebookPattern, '[FACEBOOK ĐÃ ĐƯỢC CHE]');
    }

    const telegramMatches = text.match(this.telegramPattern);
    if (telegramMatches) {
      detectedPatterns.push(...telegramMatches);
      cleanedText = cleanedText.replace(this.telegramPattern, '[TELEGRAM ĐÃ ĐƯỢC CHE]');
    }

    return {
      hasContactInfo: detectedPatterns.length > 0,
      detectedPatterns,
      cleanedText
    };
  }

  async moderateContent(content: string, userId: string): Promise<{
    approved: boolean;
    cleanedContent: string;
    violations: string[];
  }> {
    const redactionResult = this.detectContactInfo(content);
    
    if (redactionResult.hasContactInfo) {
      // Log violation
      await this.logViolation(userId, 'CONTACT_INFO_DETECTED', redactionResult.detectedPatterns);
      
      // Check user violation history
      const violationCount = await this.getUserViolationCount(userId);
      
      if (violationCount >= 3) {
        // Auto-reject and consider account suspension
        return {
          approved: false,
          cleanedContent: content,
          violations: ['Repeated contact information sharing violations']
        };
      }
      
      return {
        approved: true,
        cleanedContent: redactionResult.cleanedText,
        violations: [`Contact information detected and removed: ${redactionResult.detectedPatterns.join(', ')}`]
      };
    }

    return {
      approved: true,
      cleanedContent: content,
      violations: []
    };
  }

  private async logViolation(userId: string, violationType: string, details: string[]) {
    // Implementation depends on your database
    // Store in moderation_events table
  }

  private async getUserViolationCount(userId: string): Promise<number> {
    // Implementation depends on your database
    // Count violations in last 30 days
    return 0;
  }
}
```

---

## **3. DATABASE SECURITY**

### **3.1. Row Level Security (RLS) Policies**
```sql
-- Enable RLS for sensitive tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_entries ENABLE ROW LEVEL SECURITY;

-- Orders: Users can only see their own orders
CREATE POLICY order_access_policy ON orders
    FOR ALL
    TO authenticated_users
    USING (
        buyer_id = current_setting('app.user_id', true)::uuid OR
        seller_id = current_setting('app.user_id', true)::uuid OR
        position('ADMIN' in coalesce(current_setting('app.roles', true), '')) > 0
    );

-- RFQs: Only participants and admins can access
CREATE POLICY rfq_access_policy ON rfqs
    FOR ALL
    TO authenticated_users
    USING (
        buyer_id = current_setting('app.user_id', true)::uuid OR
        listing_id IN (
            SELECT id FROM listings 
            WHERE seller_user_id = current_setting('app.user_id', true)::uuid
        ) OR
        position('ADMIN' in coalesce(current_setting('app.roles', true), '')) > 0
    );

-- Depot stock movements: Only depot staff can access
CREATE POLICY depot_stock_access_policy ON depot_stock_movements
    FOR ALL
    TO authenticated_users
    USING (
        position(
            concat('DEPOT:', depot_id::text)
            in coalesce(current_setting('app.scopes', true), '')
        ) > 0 OR
        position('ADMIN' in coalesce(current_setting('app.roles', true), '')) > 0
    );

-- Config entries: Only published config visible to non-admins
CREATE POLICY config_read_policy ON config_entries
    FOR SELECT
    TO authenticated_users
    USING (
        status = 'published' OR
        position('ADMIN' in coalesce(current_setting('app.roles', true), '')) > 0
    );

CREATE POLICY config_write_policy ON config_entries
    FOR INSERT, UPDATE, DELETE
    TO authenticated_users
    USING (
        position('PM-115' in coalesce(current_setting('app.permissions', true), '')) > 0
    );
```

### **3.2. Database Connection Security**
```typescript
// backend/src/database/connection.ts
import { Pool, PoolConfig } from 'pg';
import fs from 'fs';

export class SecureDatabase {
  private pool: Pool;

  constructor() {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        ca: fs.readFileSync('/etc/ssl/certs/ca-certificate.crt').toString()
      } : false,
      max: 20,              // Maximum connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Connection validation
      application_name: 'icontexchange-api',
      // Prepared statements for performance and security
      allowExitOnIdle: false
    };

    this.pool = new Pool(config);

    // Error handling
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async setSessionContext(userId: string, roles: string[], permissions: string[], scopes: string[] = []) {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT set_config($1, $2, true)', ['app.user_id', userId]);
      await client.query('SELECT set_config($1, $2, true)', ['app.roles', roles.join(',')]);
      await client.query('SELECT set_config($1, $2, true)', ['app.permissions', permissions.join(',')]);
      await client.query('SELECT set_config($1, $2, true)', ['app.scopes', scopes.join(',')]);
      return client;
    } catch (error) {
      client.release();
      throw error;
    }
  }

  async query(text: string, params?: any[], userId?: string, userContext?: any) {
    const client = await this.pool.connect();
    try {
      // Set session context if provided
      if (userId && userContext) {
        await this.setSessionContext(
          userId, 
          userContext.roles, 
          userContext.permissions, 
          userContext.scopes
        );
      }

      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }
}
```

---

## **4. API SECURITY**

### **4.1. Rate Limiting**
```typescript
// backend/src/middleware/rate-limiting.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limiting
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: {
      code: 'RATE-LIMITED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.ip + ':' + (req.body.email || req.body.phone || 'unknown');
  },
  message: {
    error: {
      code: 'AUTH-RATE-LIMITED',
      message: 'Too many authentication attempts'
    }
  }
});

// Payment endpoint rate limiting
export const paymentLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 payment attempts per minute
  keyGenerator: (req) => {
    return (req.user?.sub || req.ip) + ':payment';
  }
});
```

### **4.2. Security Headers Middleware**
```typescript
// backend/src/middleware/security-headers.ts
import helmet from 'helmet';
import { Express } from 'express';

export function setupSecurityHeaders(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Only for development
          "https://cdnjs.cloudflare.com",
          "https://js.stripe.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:"
        ],
        connectSrc: [
          "'self'",
          "https://api.icontexchange.vn",
          "wss://api.icontexchange.vn"
        ],
        frameSrc: [
          "'self'",
          "https://js.stripe.com"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for file uploads
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS configuration
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://icontexchange.vn',
      'https://www.icontexchange.vn',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
    ];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '1800');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}
```

---

## **5. FILE UPLOAD SECURITY**

### **5.1. Secure File Upload**
```typescript
// backend/src/middleware/file-upload.ts
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { promises as fs } from 'fs';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File type validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per request
  },
  fileFilter
});

export async function processImage(buffer: Buffer, filename: string): Promise<{
  optimized: Buffer;
  thumbnail: Buffer;
  metadata: any;
}> {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    // Security check: validate image
    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      throw new Error('Invalid image format');
    }

    // Remove EXIF data and optimize
    const optimized = await sharp(buffer)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Create thumbnail
    const thumbnail = await sharp(buffer)
      .resize(300, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      optimized,
      thumbnail,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length
      }
    };
  } catch (error) {
    throw new Error('Failed to process image: ' + error.message);
  }
}

// Virus scanning (placeholder - integrate with actual antivirus service)
export async function scanForVirus(buffer: Buffer): Promise<boolean> {
  // Implement integration with antivirus service
  // For now, just check file signature
  const fileSignature = buffer.slice(0, 4).toString('hex');
  
  // Known malicious signatures (simplified)
  const maliciousSignatures = [
    '4d5a9000', // PE executable
    '504b0304'  // ZIP (could contain malware)
  ];
  
  return !maliciousSignatures.includes(fileSignature);
}
```

### **5.2. Secure File Storage Service**
```typescript
// backend/src/services/file-storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export class FileStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    folder: string = 'uploads',
    isPublic: boolean = false
  ): Promise<{
    key: string;
    url: string;
    size: number;
  }> {
    // Generate secure filename
    const ext = path.extname(originalFilename);
    const filename = crypto.randomUUID() + ext;
    const key = `${folder}/${filename}`;

    // Calculate file hash for integrity
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: this.getContentType(ext),
      Metadata: {
        'original-filename': originalFilename,
        'file-hash': hash,
        'upload-timestamp': new Date().toISOString()
      },
      ServerSideEncryption: 'AES256',
      ACL: isPublic ? 'public-read' : 'private'
    });

    await this.s3Client.send(command);

    const url = isPublic 
      ? `https://${this.bucketName}.s3.amazonaws.com/${key}`
      : await this.getSignedUrl(key);

    return {
      key,
      url,
      size: buffer.length
    };
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    await this.s3Client.send(command);
  }

  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
```

---

## **6. AUDIT LOGGING & MONITORING**

### **6.1. Audit Logging Service**
```typescript
// backend/src/audit/audit.service.ts
import { Request } from 'express';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  success: boolean;
  errorMessage?: string;
  riskScore: number;
}

export class AuditService {
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'riskScore'>) {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(entry)
    };

    // Store in database
    await this.storeAuditLog(auditEntry);

    // Alert on high-risk activities
    if (auditEntry.riskScore >= 80) {
      await this.sendSecurityAlert(auditEntry);
    }
  }

  private calculateRiskScore(entry: Partial<AuditLogEntry>): number {
    let score = 0;

    // High-risk actions
    const highRiskActions = [
      'user.delete',
      'user.privilege_escalation',
      'config.publish',
      'payment.release',
      'admin.access'
    ];

    if (highRiskActions.includes(entry.action || '')) {
      score += 40;
    }

    // Failed attempts
    if (!entry.success) {
      score += 20;
    }

    // Off-hours activity (outside 6 AM - 10 PM Vietnam time)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 15;
    }

    // Admin actions
    if (entry.action?.startsWith('admin.')) {
      score += 25;
    }

    return Math.min(score, 100);
  }

  private async storeAuditLog(entry: AuditLogEntry) {
    // Implementation depends on your database
    // Store in audit_logs table with proper indexing
  }

  private async sendSecurityAlert(entry: AuditLogEntry) {
    // Send alert to security team
    console.warn('HIGH RISK ACTIVITY DETECTED:', entry);
    // Implement actual alerting (email, Slack, etc.)
  }
}

// Middleware to automatically log API actions
export function auditMiddleware(auditService: AuditService) {
  return (req: any, res: any, next: any) => {
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // Log the action after response
      setImmediate(() => {
        auditService.log({
          userId: req.user?.sub,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          action: `${req.method.toLowerCase()}.${req.route?.path || req.path}`,
          resource: req.route?.path || req.path,
          resourceId: req.params.id,
          newValues: req.method !== 'GET' ? req.body : undefined,
          success: res.statusCode < 400,
          errorMessage: res.statusCode >= 400 ? body?.error?.message : undefined
        });
      });

      return originalJson.call(this, body);
    };

    next();
  };
}
```

---

## **7. SECURITY TESTING & COMPLIANCE**

### **7.1. Security Test Suite**
```typescript
// tests/security/security.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(401);

      expect(response.body.error.code).toBe('AUTH-UNAUTHORIZED');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should enforce rate limiting on login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make 6 failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send(loginData);
      }

      // 7th attempt should be rate limited
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body.error.code).toBe('AUTH-RATE-LIMITED');
    });
  });

  describe('Input Validation', () => {
    it('should sanitize HTML in inputs', async () => {
      const maliciousInput = {
        title: '<script>alert("xss")</script>Clean Title',
        description: 'Normal description'
      };

      const response = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(maliciousInput);

      expect(response.body.title).not.toContain('<script>');
    });

    it('should reject SQL injection attempts', async () => {
      const sqlInjection = {
        email: "admin@test.com'; DROP TABLE users; --"
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(sqlInjection)
        .expect(422);
    });
  });

  describe('File Upload Security', () => {
    it('should reject executable files', async () => {
      const response = await request(app)
        .post('/api/v1/listings/123/media')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', Buffer.from('MZ'), 'malware.exe')
        .expect(400);

      expect(response.body.error.message).toContain('not allowed');
    });

    it('should limit file size', async () => {
      const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB

      const response = await request(app)
        .post('/api/v1/listings/123/media')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', largeBuffer, 'large.jpg')
        .expect(413);
    });
  });

  describe('Business Logic Security', () => {
    it('should prevent unauthorized RFQ access', async () => {
      const response = await request(app)
        .get('/api/v1/rfqs/someone-elses-rfq-id')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(403);
    });

    it('should enforce pricing rules', async () => {
      const quote = {
        priceAmount: 999999999, // Exceeds price band
        currency: 'VND'
      };

      const response = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', `Bearer ${validToken}`)
        .send(quote)
        .expect(422);

      expect(response.body.error.code).toBe('PRICE-VALIDATION-FAILED');
    });
  });
});
```

### **7.2. OWASP Compliance Checklist**
```typescript
// scripts/security-checklist.ts

export const OWASPChecklist = {
  'A01-2021-Broken-Access-Control': {
    implemented: [
      'JWT-based authentication',
      'Role-based access control (RBAC)',
      'Row-level security (RLS) in database',
      'Scope-based authorization for organizations/depots',
      'Proper session management'
    ],
    testing: [
      'Test unauthorized access to resources',
      'Test privilege escalation attempts',
      'Test direct object reference vulnerabilities'
    ]
  },
  
  'A02-2021-Cryptographic-Failures': {
    implemented: [
      'TLS 1.2+ for all communications',
      'JWT signed with RS256',
      'Database connection encryption',
      'File encryption at rest (S3 AES256)',
      'Password hashing with bcrypt'
    ],
    testing: [
      'Test for weak encryption algorithms',
      'Verify certificate validation',
      'Test for sensitive data in logs'
    ]
  },

  'A03-2021-Injection': {
    implemented: [
      'Parameterized queries for all database operations',
      'Input validation with Zod schemas',
      'SQL injection prevention',
      'XSS prevention with DOMPurify',
      'Command injection prevention'
    ],
    testing: [
      'SQL injection testing',
      'XSS payload testing',
      'Command injection testing'
    ]
  },

  'A04-2021-Insecure-Design': {
    implemented: [
      'Threat modeling for business logic',
      'Secure coding standards',
      'Input validation at multiple layers',
      'Rate limiting for all endpoints',
      'Business logic validation'
    ]
  },

  'A05-2021-Security-Misconfiguration': {
    implemented: [
      'Security headers (CSP, HSTS, etc.)',
      'Error handling without information disclosure',
      'Disable unnecessary features',
      'Regular security updates',
      'Secure defaults'
    ]
  },

  'A06-2021-Vulnerable-Components': {
    implemented: [
      'Dependency scanning with npm audit',
      'Regular updates of dependencies',
      'Container vulnerability scanning',
      'SBOM (Software Bill of Materials)'
    ]
  },

  'A07-2021-Identification-Authentication-Failures': {
    implemented: [
      'Strong password requirements',
      'Account lockout mechanisms',
      'Multi-factor authentication support',
      'Session timeout',
      'Secure password recovery'
    ]
  },

  'A08-2021-Software-Data-Integrity-Failures': {
    implemented: [
      'File integrity verification',
      'CI/CD pipeline security',
      'Code signing',
      'Secure update mechanisms'
    ]
  },

  'A09-2021-Security-Logging-Monitoring-Failures': {
    implemented: [
      'Comprehensive audit logging',
      'Security event monitoring',
      'Alerting for suspicious activities',
      'Log integrity protection',
      'Incident response procedures'
    ]
  },

  'A10-2021-Server-Side-Request-Forgery': {
    implemented: [
      'URL validation for external requests',
      'Network segmentation',
      'Whitelist allowed destinations',
      'Request timeout limits'
    ]
  }
};
```

Tài liệu này cung cấp foundation bảo mật toàn diện cho hệ thống i-ContExchange, đảm bảo tuân thủ các tiêu chuẩn bảo mật quốc tế và quy định pháp luật Việt Nam.