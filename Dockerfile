FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json turbo.json ./
COPY apps/website/package.json apps/website/
COPY apps/admin/package.json apps/admin/
COPY packages/models/package.json packages/models/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN npm ci --workspaces --include-workspace-root

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --filter=@agroconnect/website

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/website/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/static ./apps/website/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/website/server.js"]
