FROM node:20-alpine AS base

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

FROM base AS development
CMD ["sh", "-c", "npx prisma generate && npm run dev"]

FROM base AS production
RUN npm run build
CMD ["sh", "-c", "npx prisma generate && npm start"]
