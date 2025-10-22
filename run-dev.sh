#!/bin/sh

# Check if .env file exists in parent directory
if [ ! -f .env ]; then
  echo "Error: .env file not found in train-service directory!"
  echo "Please copy .env.example to .env and fill in your credentials"
  exit 1
fi

# Load environment variables from parent .env file
set -a
. .env
set +a

export OTEL_TRACES_EXPORTER=${OTEL_TRACES_EXPORTER}
export OTEL_METRICS_EXPORTER=${OTEL_METRICS_EXPORTER}
export OTEL_LOGS_EXPORTER=${OTEL_LOGS_EXPORTER}
export OTEL_SERVICE_NAME=${OTEL_SERVICE_NAME}
export OTEL_EXPORTER_OTLP_HEADERS=${OTEL_EXPORTER_OTLP_HEADERS} 
export OTEL_EXPORTER_OTLP_ENDPOINT=${OTEL_EXPORTER_OTLP_ENDPOINT} 
export OTEL_RESOURCE_ATTRIBUTES=${OTEL_RESOURCE_ATTRIBUTES} 
export OTEL_NODE_RESOURCE_DETECTORS=${OTEL_NODE_RESOURCE_DETECTORS} 
export NODE_OPTIONS=${NODE_OPTIONS}
node dist/src/server.js