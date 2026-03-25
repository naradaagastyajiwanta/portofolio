FROM node:20-alpine AS base

RUN apk add --no-cache openssl curl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Download Linux engines using curl (which works from Docker build)
RUN curl -L -o node_modules/.prisma/client/libquery_engine.so.node.gz \
    "https://binaries.prisma.sh/all_commits/605197351a3c8bdd595af2d2a9bc3025bca48ea2/linux-musl-openssl-3.0.x/libquery_engine.so.node.gz" && \
    gunzip -f node_modules/.prisma/client/libquery_engine.so.node.gz && \
    curl -L -o node_modules/.prisma/client/schema-engine.gz \
    "https://binaries.prisma.sh/all_commits/605197351a3c8bdd595af2d2a9bc3025bca48ea2/linux-musl-openssl-3.0.x/schema-engine.gz" && \
    gunzip -f node_modules/.prisma/client/schema-engine.gz && \
    chmod 755 node_modules/.prisma/client/libquery_engine.so.node node_modules/.prisma/client/schema-engine || true

# Generate Prisma client
RUN npx prisma generate || true

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm run build
CMD ["npm", "start"]
