# Multi-stage build for Node.js backend

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install Yarn 1.x (Classic) to match existing yarn.lock format
# Disable corepack and install classic Yarn
RUN corepack disable && \
    npm install -g --force yarn@1.22.19

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install all dependencies (we need tsx which is in devDependencies)
# Note: We keep dev dependencies since tsx is needed at runtime
RUN yarn install --frozen-lockfile && \
    yarn add prisma --production 2>/dev/null || yarn add prisma && \
    yarn cache clean

# Stage 2: Dev dependencies (for building)
FROM node:20-alpine AS build

WORKDIR /app

# Install Yarn 1.x (Classic) to match existing yarn.lock format
# Disable corepack and install classic Yarn
RUN corepack disable && \
    npm install -g --force yarn@1.22.19

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install all dependencies (including dev)
RUN yarn install --frozen-lockfile && \
    yarn cache clean

# Copy source code and config files
COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh || true

# Generate Prisma Client
RUN yarn prisma generate

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install yarn and netcat for production stage (needed for entrypoint script)
RUN corepack disable && \
    npm install -g --force yarn@1.22.19 && \
    apk add --no-cache netcat-openbsd

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy all dependencies from build stage (we need tsx which is in devDependencies)
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/tsconfig.json ./
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nodejs:nodejs /app/environment.env* ./
COPY --from=build --chown=nodejs:nodejs /app/entrypoint.sh ./entrypoint.sh

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3006/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Entrypoint to run migrations before starting
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "--import", "tsx", "src/server.ts"]

