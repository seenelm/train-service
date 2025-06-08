# syntax=docker/dockerfile:1.4

# ========== BUILD STAGE ==============
FROM node:23-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
#COPY config ./config

RUN npm run build

# ========== RUNTIME STAGE ==========
FROM node:23-alpine AS runtime
WORKDIR /app

COPY --from=builder /app /app

ARG APP_VERSION
ARG NODE_ENV=$NODE_ENV
ARG MONGO_URI

LABEL train.api.version="$APP_VERSION"
LABEL train.api.build.timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV MONGO_URI=$MONGO_URI
ENV SECRET_CODE=$SECRET_CODE
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV EMAIL_FROM=$EMAIL_FROM
ENV SMTP_SECURE=$SMTP_SECURE
ENV REFRESH_TOKEN_EXPIRY=$REFRESH_TOKEN_EXPIRY
ENV ACCESS_TOKEN_EXPIRY=$ACCESS_TOKEN_EXPIRY

CMD ["node", "./dist/src/server.js"]

# ========== TEST STAGE ==========
FROM node:23-alpine AS test
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app /app
COPY test-entrypoint.sh /app/test-entrypoint.sh

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV MONGO_URI=$MONGO_URI
ENV SECRET_CODE=$SECRET_CODE
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV EMAIL_FROM=$EMAIL_FROM
ENV SMTP_SECURE=$SMTP_SECURE
ENV REFRESH_TOKEN_EXPIRY=$REFRESH_TOKEN_EXPIRY
ENV ACCESS_TOKEN_EXPIRY=$ACCESS_TOKEN_EXPIRY

RUN chmod +x /app/test-entrypoint.sh
CMD ["/app/test-entrypoint.sh"]

