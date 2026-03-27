FROM node:22-alpine AS base
WORKDIR /repo

FROM base AS deps
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY packages/shared/package*.json packages/shared/
RUN npm ci --workspaces --include-workspace-root=false --workspace @packages/shared --workspace @apps/backend

FROM base AS builder
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build --workspace @packages/shared \
  && npm run build --workspace @apps/backend

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /repo/apps/backend/dist ./apps/backend/dist
COPY --from=builder /repo/apps/backend/sql ./apps/backend/sql
COPY --from=builder /repo/apps/backend/package*.json ./apps/backend/
COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=deps /repo/node_modules ./node_modules
EXPOSE 4000
CMD ["sh", "-c", "cd /app/apps/backend && npm run db:init && npm run start"]
