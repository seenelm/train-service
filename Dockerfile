# syntax=docker/dockerfile:1.4
# FROM node:23-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# ARG APP_VERSION
# ARG NODE_ENV=$NODE_ENV
# ARG MONGO_URI
# ARG SECRET_CODE
# LABEL train.api.version="$APP_VERSION"
# LABEL train.api.build.timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# # Build api
# RUN npm run build

# # Set environment variables
# ENV NODE_ENV=$NODE_ENV
# ENV MONGO_URI=$MONGO_URI
# ENV SECRET_CODE=$SECRET_CODE
# CMD ["node", "./dist/src/server.js"]

# ========== BUILD STAGE ==============
FROM node:23-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY config ./config

RUN npm run build

# ========== RUNTIME STAGE ==========
FROM node:23-alpine AS runtime
WORKDIR /app

COPY --from=builder /app /app

ARG APP_VERSION
ARG NODE_ENV=$NODE_ENV
ARG MONGO_URI
ARG SECRET_CODE
LABEL train.api.version="$APP_VERSION"
LABEL train.api.build.timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV MONGO_URI=$MONGO_URI
ENV SECRET_CODE=$SECRET_CODE
CMD ["node", "./dist/src/server.js"]

# ========== TEST STAGE ==========
FROM node:23-alpine AS test
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app /app
COPY test-entrypoint.sh /app/test-entrypoint.sh

RUN chmod +x /app/test-entrypoint.sh
CMD ["/app/test-entrypoint.sh"]

