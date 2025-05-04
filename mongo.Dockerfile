# ========== CONFIGURE MONGODB ==========
FROM mongodb/mongodb-atlas-local:7.0.7

RUN mkdir -p /data/configdb && \
    openssl rand -base64 756 > /data/configdb/keyfile && \
    chmod 400 /data/configdb/keyfile 