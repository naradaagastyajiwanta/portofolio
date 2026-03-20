FROM node:20-alpine AS base

RUN apk add --no-cache openssl curl

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Remove the broken Prisma client from npm package
RUN rm -rf node_modules/.prisma

# Copy prisma schema and pre-downloaded engines
COPY prisma prisma/
COPY prisma-engines/ /tmp/prisma-engines/

# Manually create .prisma/client with engines first, then run generate
RUN mkdir -p node_modules/.prisma/client && \
    cp /tmp/prisma-engines/libquery_engine.so.node node_modules/.prisma/client/ && \
    cp /tmp/prisma-engines/schema-engine node_modules/.prisma/client/ && \
    chmod 755 node_modules/.prisma/client/*.so.node node_modules/.prisma/client/schema-engine

# Copy all source code
COPY . .

# Run prisma generate to create proper client code (using local engines)
RUN npx prisma generate

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm run build
CMD ["npm", "start"]
