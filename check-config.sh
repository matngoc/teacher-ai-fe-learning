#!/bin/bash

# Script kiểm tra cấu hình và API URL

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "🔍 Checking Teacher AI Frontend Configuration..."
echo ""

# Check .env file
if [ -f .env ]; then
    print_message ".env file exists"
    source .env

    if [ -n "$VITE_API_URL" ]; then
        print_message "VITE_API_URL is set: $VITE_API_URL"
    else
        print_error "VITE_API_URL is not set in .env"
    fi

    if [ -n "$VITE_AI_BE_URL" ]; then
        print_message "VITE_AI_BE_URL is set: $VITE_AI_BE_URL"
    else
        print_warning "VITE_AI_BE_URL is not set in .env"
    fi
else
    print_error ".env file not found"
    echo "Please create .env file with:"
    echo "  VITE_API_URL=https://your-api-url.com"
    echo "  VITE_AI_BE_URL=https://your-ai-api-url.com"
    exit 1
fi

echo ""

# Check if container is running
CONTAINER_NAME="teacher-ai-fe-learning"
if docker ps | grep -q $CONTAINER_NAME; then
    print_message "Container is running"

    # Check what API URL was built into the app
    echo ""
    echo "📦 Checking built API URL in container..."
    BUILT_URL=$(docker exec $CONTAINER_NAME sh -c "cat /usr/share/nginx/html/assets/index-*.js 2>/dev/null | grep -o 'VITE_API_URL[^\"]*' | head -1" || echo "NOT_FOUND")

    if [ "$BUILT_URL" != "NOT_FOUND" ] && [ -n "$BUILT_URL" ]; then
        print_message "Found API URL in built files: $BUILT_URL"
    else
        print_error "API URL not found in built files!"
        print_warning "You need to rebuild with correct .env:"
        echo "  docker-compose down"
        echo "  docker-compose build --no-cache"
        echo "  docker-compose up -d"
    fi
else
    print_warning "Container is not running"
    echo "Start it with: docker-compose up -d"
fi

echo ""

# Check if API is accessible
if [ -n "$VITE_API_URL" ]; then
    echo "🌐 Testing API connectivity..."
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$VITE_API_URL" &>/dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$VITE_API_URL")
        if [ "$HTTP_CODE" != "000" ]; then
            print_message "API is accessible (HTTP $HTTP_CODE)"
        else
            print_error "Cannot connect to API"
        fi
    else
        print_error "Cannot connect to API at $VITE_API_URL"
        print_warning "Make sure:"
        echo "  1. API backend is running"
        echo "  2. API URL is accessible from internet"
        echo "  3. Firewall allows connections"
    fi
fi

echo ""
echo "✅ Check complete!"

