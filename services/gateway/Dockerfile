# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared package
COPY shared ./shared

# Copy gateway service
COPY services/gateway ./services/gateway

# Install dependencies
RUN npm ci

# Build shared package
WORKDIR /app/shared
RUN npm run build

# Build gateway service
WORKDIR /app/services/gateway
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy shared package
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist

# Copy gateway service
COPY --from=builder /app/services/gateway/package.json ./services/gateway/
COPY --from=builder /app/services/gateway/dist ./services/gateway/dist

# Install production dependencies only
RUN npm ci --only=production

WORKDIR /app/services/gateway

EXPOSE 3000

CMD ["node", "dist/main.js"]

