FROM node:22-alpine AS base
WORKDIR /repo

# Install workspace dependencies once
FROM base AS deps
COPY package*.json ./
COPY apps/frontend/package*.json apps/frontend/
COPY packages/shared/package*.json packages/shared/
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000 \
  && npm config set maxsockets 1 \
  && npm ci --workspaces --include-workspace-root=false --workspace @packages/shared --workspace @apps/frontend

# Build shared + frontend
FROM base AS builder
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build --workspace @packages/shared \
  && npm run build --workspace @apps/frontend

# Production runtime
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy only built artifacts and needed runtime deps
COPY --from=builder /repo/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /repo/apps/frontend/public ./apps/frontend/public
COPY --from=builder /repo/apps/frontend/package*.json ./apps/frontend/
COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=deps /repo/node_modules ./node_modules

EXPOSE 3000
CMD ["sh", "-c", "cd /app/apps/frontend && npm run start"]
