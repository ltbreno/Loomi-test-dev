# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared package
COPY shared ./shared

# Copy transactions service
COPY services/transactions ./services/transactions

# Install dependencies
RUN npm ci

# Build shared package
WORKDIR /app/shared
RUN npm run build

# Build transactions service
WORKDIR /app/services/transactions
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy shared package
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist

# Copy transactions service
COPY --from=builder /app/services/transactions/package.json ./services/transactions/
COPY --from=builder /app/services/transactions/dist ./services/transactions/dist

# Install production dependencies only
RUN npm ci --only=production

WORKDIR /app/services/transactions

EXPOSE 3002

CMD ["node", "dist/main.js"]

