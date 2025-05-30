#!/bin/sh
set -e

# Start the server in the background
npm run start &

# Wait for the server to be ready (adjust the URL and timeout as needed)
echo "Waiting for server to be ready..."
until curl -s http://localhost:3000/health; do
  sleep 1
done

echo "Waiting for MongoDB to be ready..."
until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 1
done

# Run integration tests
npm run test:integration