# -----------------------
# STAGE 1 — BUILDER
# -----------------------
FROM node:20-slim AS builder

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .


# -----------------------
# STAGE 2 — RUNNER
# -----------------------
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# ✅ Install OpenSSL (required by Prisma)
RUN apt-get update \
	&& apt-get install -y openssl \
	&& rm -rf /var/lib/apt/lists/*

# Copy only code + generated Prisma client
COPY --from=builder /app .

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 4005

CMD ["sh", "-c", "npx prisma migrate deploy && node app.js"]