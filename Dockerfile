# ==========================================
# 🔹 STAGE 1: Dependencies
# ==========================================
FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# ==========================================
# 🔹 STAGE 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Security: Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

USER nodejs

EXPOSE 5000

CMD ["node", "server.js"]
