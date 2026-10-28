# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:26.12.1-alpine3.24

# ---- deps: install exact dependencies from the lockfile ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN apk upgrade --no-cache
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- builder: compile the Next.js app ----
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* values are inlined into the client bundle at build time
ARG NEXT_PUBLIC_RPC_URL
ENV NEXT_PUBLIC_RPC_URL=${NEXT_PUBLIC_RPC_URL}
RUN test -n "$NEXT_PUBLIC_RPC_URL" \
 || (echo "ERROR: --build-arg NEXT_PUBLIC_RPC_URL=<url> is required" >&2 && exit 1)

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# app/api/faucet/route.ts requires RPC_URL at module load, which `next build`
# triggers; use a placeholder here so no real endpoint is baked into the image
RUN RPC_URL=http://build-placeholder.invalid npm run build

# ---- runner: minimal production image ----
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Patch OS packages and strip npm/yarn/corepack, which are not needed at
# runtime and are the most common source of scanner findings in node images
RUN apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Runtime secrets (PRIVATE_KEY, RPC_URL) must be passed at `docker run` time
CMD ["node", "server.js"]
