FROM node:20-alpine AS base

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Copy pre-downloaded Prisma Linux engines
COPY prisma-engines/ /tmp/prisma-engines/
RUN cp /tmp/prisma-engines/libquery_engine.so.node /app/node_modules/.prisma/client/ || true && \
    cp /tmp/prisma-engines/schema-engine /app/node_modules/.prisma/client/ || true && \
    chmod 755 /app/node_modules/.prisma/client/*.so.node /app/node_modules/.prisma/client/schema-engine || true

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm run build
CMD ["npm", "start"]
