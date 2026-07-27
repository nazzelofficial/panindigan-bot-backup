# ---------- Build Stage ----------
FROM node:24-alpine AS builder

WORKDIR /app

# Native build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Enable Corepack + PNPM
RUN corepack enable \
 && corepack prepare pnpm@11.17.0 --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.json ./
COPY config.json ./

# Install dependencies
RUN pnpm config set minimum-release-age 0 \
 && pnpm install --frozen-lockfile --ignore-scripts=false

# Copy source
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client
RUN pnpm prisma generate

# Build application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# ---------- Production Stage ----------
FROM node:24-alpine AS production

WORKDIR /app

# Runtime libraries
RUN apk add --no-cache \
    dumb-init \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg

# Create non-root user
RUN addgroup -S nodejs \
 && adduser -S nodejs -G nodejs

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/config.json ./config.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Create writable directories
RUN mkdir -p /app/logs \
 && chown -R nodejs:nodejs /app

# Run as non-root
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/bot/index.js"]