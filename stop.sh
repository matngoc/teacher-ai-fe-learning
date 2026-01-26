#!/bin/bash

# Stop script for Teacher AI Frontend
# Usage: ./stop.sh [environment]
# environment: dev|prod (default: dev)

set -e

ENVIRONMENT=${1:-dev}

echo "⏹️  Stopping Teacher AI Frontend..."

if [ "$ENVIRONMENT" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml down
else
    docker-compose down
fi

echo "✅ Application stopped successfully!"

