FROM node:22-alpine AS base
WORKDIR /repo

FROM base AS deps
COPY package*.json ./
COPY apps/mock-server/package*.json apps/mock-server/
COPY packages/shared/package*.json packages/shared/
RUN npm ci --workspaces --include-workspace-root=false --workspace @packages/shared --workspace @apps/mock-server

FROM base AS builder
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build --workspace @packages/shared \
  && npm run build --workspace @apps/mock-server

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /repo/apps/mock-server/dist ./apps/mock-server/dist
COPY --from=builder /repo/apps/mock-server/package*.json ./apps/mock-server/
COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=deps /repo/node_modules ./node_modules
EXPOSE 5001
CMD ["sh", "-c", "cd /app/apps/mock-server && npm run start"]
