# ===============================
# 1. Build stage
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng cache
COPY package*.json ./

RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build


# ===============================
# 2. Production stage
# ===============================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Chỉ copy những thứ cần thiết
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port (đổi nếu app bạn khác)
EXPOSE 3000

# Chạy migration khi start (optional – rất hay cho production)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
