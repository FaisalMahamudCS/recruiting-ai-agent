# ── Stage 1: install deps for both api and worker ─────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY api/package*.json ./api/
COPY worker/package*.json ./worker/

RUN cd api && npm ci --omit=dev
RUN cd worker && npm ci --omit=dev

# ── Stage 2: production image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Install concurrently globally to manage both processes
RUN npm install -g concurrently

# Copy node_modules from deps stage
COPY --from=deps /app/api/node_modules ./api/node_modules
COPY --from=deps /app/worker/node_modules ./worker/node_modules

# Copy source code
COPY api/src ./api/src
COPY worker/src ./worker/src

# Render injects PORT automatically; default to 3000 for local use
EXPOSE 3000

# Start both the API server and the BullMQ worker in one container
CMD ["concurrently", "--kill-others-on-fail", "--prefix", "[{name}]", "--names", "api,worker", \
     "node api/src/index.js", \
     "node worker/src/index.js"]
