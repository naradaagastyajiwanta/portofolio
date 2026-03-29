FROM node:20-alpine AS base

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG INTERNAL_API_URL=http://localhost:3001
ARG NEXT_SERVER_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_SERVER_API_URL=$NEXT_SERVER_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS builder
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG INTERNAL_API_URL=http://localhost:3001
ARG NEXT_SERVER_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_SERVER_API_URL=$NEXT_SERVER_API_URL
RUN npm run build

FROM base AS production
COPY --from=builder /app/.next ./.next
CMD ["npm", "start"]
