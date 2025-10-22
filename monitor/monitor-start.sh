#!/bin/sh

# Check if .env file exists in parent directory
if [ ! -f ../.env ]; then
  echo "Error: .env file not found in train-service directory!"
  echo "Please copy .env.example to .env and fill in your credentials"
  exit 1
fi

# Load environment variables from parent .env file
set -a
. ../.env
set +a

docker run \
  -v ./monitor.alloy:/etc/alloy/config.alloy \
  -v "/var/run/docker.sock:/var/run/docker.sock" \
  -v "$(pwd)/../logs:/var/log/train-service" \
  -e GRAFANA_CLOUD_OTLP_ENDPOINT="${GRAFANA_CLOUD_OTLP_ENDPOINT}" \
  -e GRAFANA_CLOUD_INSTANCE_ID="${GRAFANA_CLOUD_INSTANCE_ID}" \
  -e GRAFANA_CLOUD_API_KEY="${GRAFANA_CLOUD_API_KEY}" \
  -e GRAFANA_LOKI_USER_ID="${GRAFANA_LOKI_USER_ID}" \
  -p 12345:12345 \
  -p 4317:4317 \
  -p 4318:4318 \
  grafana/alloy:latest \
    run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data \
    /etc/alloy/config.alloy