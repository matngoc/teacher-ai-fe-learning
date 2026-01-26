.PHONY: help build build-prod start start-prod stop stop-prod restart logs clean deploy deploy-prod

# Default target
help:
	@echo "🐳 Teacher AI Frontend - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build        - Build development image"
	@echo "  make build-prod   - Build production image"
	@echo "  make start        - Start development container"
	@echo "  make start-prod   - Start production container"
	@echo "  make stop         - Stop development container"
	@echo "  make stop-prod    - Stop production container"
	@echo "  make restart      - Restart development container"
	@echo "  make logs         - View logs (development)"
	@echo "  make logs-prod    - View logs (production)"
	@echo "  make clean        - Clean up Docker resources"
	@echo "  make deploy       - Deploy development (build + start)"
	@echo "  make deploy-prod  - Deploy production (build + start)"
	@echo "  make shell        - Access container shell"
	@echo "  make ps           - Show container status"
	@echo ""

# Development commands
build:
	@echo "🔨 Building development image..."
	docker-compose build --no-cache

start:
	@echo "▶️  Starting development container..."
	docker-compose up -d
	@echo "✅ Application started on http://localhost:80"

stop:
	@echo "⏹️  Stopping development container..."
	docker-compose down

restart:
	@echo "🔄 Restarting development container..."
	docker-compose restart

logs:
	@echo "📊 Showing logs (Ctrl+C to exit)..."
	docker-compose logs -f

deploy:
	@echo "🚀 Deploying development..."
	docker-compose down || true
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Deployment complete! Access at http://localhost:5173"

# Production commands
build-prod:
	@echo "🔨 Building production image..."
	docker-compose -f docker-compose.prod.yml build --no-cache

start-prod:
	@echo "▶️  Starting production container..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Application started on http://localhost:8080"

stop-prod:
	@echo "⏹️  Stopping production container..."
	docker-compose -f docker-compose.prod.yml down

restart-prod:
	@echo "🔄 Restarting production container..."
	docker-compose -f docker-compose.prod.yml restart

logs-prod:
	@echo "📊 Showing production logs (Ctrl+C to exit)..."
	docker-compose -f docker-compose.prod.yml logs -f

deploy-prod:
	@echo "🚀 Deploying production..."
	docker-compose -f docker-compose.prod.yml down || true
	docker-compose -f docker-compose.prod.yml build --no-cache
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete! Access at http://localhost:5173"

# Utility commands
shell:
	@echo "🐚 Accessing container shell..."
	docker exec -it teacher-ai-fe-learning sh

ps:
	@echo "📋 Container status:"
	docker ps -a | grep teacher-ai || echo "No containers found"

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v || true
	docker-compose -f docker-compose.prod.yml down -v || true
	docker system prune -f
	@echo "✅ Cleanup complete!"

clean-all:
	@echo "🧹 Deep cleaning Docker resources..."
	docker-compose down -v || true
	docker-compose -f docker-compose.prod.yml down -v || true
	docker system prune -a -f --volumes
	@echo "✅ Deep cleanup complete!"

# Health check
health:
	@echo "🏥 Checking container health..."
	@docker inspect --format='{{.State.Health.Status}}' teacher-ai-fe-learning 2>/dev/null || echo "Container not running"

# Stats
stats:
	@echo "📊 Container resource usage:"
	docker stats --no-stream teacher-ai-fe-learning 2>/dev/null || echo "Container not running"

