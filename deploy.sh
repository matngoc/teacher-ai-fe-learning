#!/bin/bash

# Deploy script for Teacher AI Frontend on Ubuntu Server
# Usage: ./deploy.sh [environment]
# environment: dev|prod (default: dev)

set -e

ENVIRONMENT=${1:-dev}
PROJECT_NAME="teacher-ai-fe-learning"

echo "🚀 Starting deployment for $PROJECT_NAME in $ENVIRONMENT mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found!"
    print_warning "Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your actual API URLs before deploying:"
        print_warning "  VITE_API_URL=https://your-api-url.com"
        print_warning "  VITE_AI_BE_URL=https://your-ai-api-url.com"
        print_error "Deployment stopped. Edit .env file and run again."
        exit 1
    else
        print_error "No .env.example file found. Please create .env manually."
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)
print_message "Loaded environment variables from .env"
print_message "VITE_API_URL: $VITE_API_URL"

# Stop existing containers
print_message "Stopping existing containers..."
if [ "$ENVIRONMENT" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml down || true
else
    docker-compose down || true
fi

# Remove old images (optional)
print_message "Cleaning up old images..."
docker image prune -f

# Build and start containers
print_message "Building and starting containers..."
if [ "$ENVIRONMENT" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose build --no-cache
    docker-compose up -d
fi

# Wait for container to be healthy
print_message "Waiting for container to be healthy..."
sleep 10

# Check container status
if [ "$ENVIRONMENT" == "prod" ]; then
    CONTAINER_NAME="${PROJECT_NAME}-prod"
else
    CONTAINER_NAME="${PROJECT_NAME}"
fi

if docker ps | grep -q $CONTAINER_NAME; then
    print_message "✅ Container is running successfully!"
    print_message "Access the application at:"
    if [ "$ENVIRONMENT" == "prod" ]; then
        print_message "  http://localhost:5173"
    else
        print_message "  http://localhost:3000"
    fi
else
    print_error "❌ Container failed to start. Check logs with:"
    print_error "  docker logs $CONTAINER_NAME"
    exit 1
fi

# Show logs
print_message "Showing container logs (Ctrl+C to exit):"
docker logs -f $CONTAINER_NAME

