#!/bin/bash

# Build script for Teacher AI Frontend
# Usage: ./build.sh

set -e

echo "🔨 Building Teacher AI Frontend..."

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Build Docker image
print_message "Building Docker image..."
docker build -t teacher-ai-fe-learning:latest .

print_message "✅ Build completed successfully!"
print_message "Image: teacher-ai-fe-learning:latest"

