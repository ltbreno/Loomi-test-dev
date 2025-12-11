# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared package
COPY shared ./shared

# Copy users service
COPY services/users ./services/users

# Install dependencies
RUN npm ci

# Build shared package
WORKDIR /app/shared
RUN npm run build

# Build users service
WORKDIR /app/services/users
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy shared package
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist

# Copy users service
COPY --from=builder /app/services/users/package.json ./services/users/
COPY --from=builder /app/services/users/dist ./services/users/dist

# Install production dependencies only
RUN npm ci --only=production

WORKDIR /app/services/users

EXPOSE 3001

CMD ["node", "dist/main.js"]

