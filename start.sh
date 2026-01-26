#!/bin/bash

# Start script for Teacher AI Frontend
# Usage: ./start.sh [environment]
# environment: dev|prod (default: dev)

set -e

ENVIRONMENT=${1:-dev}

echo "▶️  Starting Teacher AI Frontend in $ENVIRONMENT mode..."

if [ "$ENVIRONMENT" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Application started on http://localhost:5173"
else
    docker-compose up -d
    echo "✅ Application started on http://localhost:3000"
fi

echo "📊 View logs with: docker-compose logs -f"

