# 🐳 Docker Deployment Guide - Teacher AI Frontend

Hướng dẫn triển khai ứng dụng Teacher AI Frontend sử dụng Docker trên Ubuntu Server.

## 📋 Yêu cầu hệ thống

- Ubuntu Server 20.04 LTS trở lên
- Docker 20.10+ 
- Docker Compose 2.0+
- 2GB RAM tối thiểu
- 10GB dung lượng ổ cứng

## 🚀 Cài đặt Docker & Docker Compose

### Cài đặt Docker

```bash
# Update package index
sudo apt-get update

# Install prerequisite packages
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Verify Docker installation
sudo docker --version
```

### Cài đặt Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Apply executable permissions
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Cấu hình quyền cho user

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply changes (logout and login again or run)
newgrp docker

# Verify you can run docker without sudo
docker ps
```

## 📦 Deployment

### 1. Clone Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd teacher-ai-fe-learning

# Make scripts executable
chmod +x build.sh deploy.sh start.sh stop.sh
```

### 2. Build & Deploy

#### Development Environment

```bash
# Build and start containers
./deploy.sh dev

# Or manually
docker-compose up -d --build
```

Ứng dụng sẽ chạy tại: **http://localhost:80**

#### Production Environment

```bash
# Build and start containers
./deploy.sh prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build
```

Ứng dụng sẽ chạy tại: **http://localhost:8080**

### 3. Chỉ Build Image

```bash
# Build only
./build.sh

# Or manually
docker build -t teacher-ai-fe-learning:latest .
```

## 🛠️ Quản lý Container

### Xem logs

```bash
# Development
docker logs -f teacher-ai-fe-learning

# Production
docker logs -f teacher-ai-fe-learning-prod

# Với docker-compose
docker-compose logs -f
```

### Khởi động lại container

```bash
# Development
./stop.sh && ./start.sh

# Production
docker-compose -f docker-compose.prod.yml restart
```

### Dừng container

```bash
# Using script
./stop.sh

# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Xóa container và images

```bash
# Stop and remove containers
docker-compose down -v

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove all unused data
docker system prune -a -f --volumes
```

### Kiểm tra trạng thái

```bash
# List running containers
docker ps

# Check container health
docker inspect teacher-ai-fe-learning | grep -A 10 Health

# Check resource usage
docker stats teacher-ai-fe-learning
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
NODE_ENV=production
VITE_API_URL=https://your-api-url.com
```

### Custom Nginx Configuration

Chỉnh sửa file `nginx.conf` để cấu hình nginx server.

### Build với ARG

```bash
# Build với custom build args
docker build \
  --build-arg NODE_ENV=production \
  -t teacher-ai-fe-learning:latest .
```

## 📊 Health Check

Container có health check tự động:

```bash
# Check health status
docker inspect --format='{{json .State.Health}}' teacher-ai-fe-learning | jq

# Manual health check
curl -f http://localhost/ || echo "Service is down"
```

## 🔒 Security Best Practices

1. **Chạy container với non-root user**
2. **Giới hạn resources**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```
3. **Sử dụng secrets cho sensitive data**
4. **Update images thường xuyên**
5. **Scan vulnerabilities**:
   ```bash
   docker scan teacher-ai-fe-learning:latest
   ```

## 🚨 Troubleshooting

### Container không start

```bash
# Kiểm tra logs
docker logs teacher-ai-fe-learning

# Kiểm tra events
docker events --filter container=teacher-ai-fe-learning

# Inspect container
docker inspect teacher-ai-fe-learning
```

### Build failed

```bash
# Clear build cache
docker builder prune -a -f

# Rebuild without cache
docker build --no-cache -t teacher-ai-fe-learning:latest .
```

### Port conflicts

```bash
# Check what's using port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Kill process or change port in docker-compose.yml
```

### Permission denied

```bash
# Fix Docker socket permission
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## 📈 Monitoring & Logging

### Centralized Logging

```bash
# View logs with docker-compose
docker-compose logs -f --tail=100

# Export logs to file
docker logs teacher-ai-fe-learning > app.log 2>&1
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Export metrics
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy
        run: |
          ./build.sh
          ./deploy.sh prod
```

## 📝 Scripts Overview

- **`build.sh`**: Build Docker image
- **`deploy.sh`**: Deploy application (dev/prod)
- **`start.sh`**: Start containers
- **`stop.sh`**: Stop containers

## 🌐 Network Configuration

Container sử dụng bridge network `teacher-ai-network`:

```bash
# Inspect network
docker network inspect teacher-ai-network

# List containers in network
docker network inspect teacher-ai-network --format '{{range .Containers}}{{.Name}} {{end}}'
```

## 💾 Backup & Restore

### Backup Image

```bash
# Save image to tar
docker save teacher-ai-fe-learning:latest | gzip > teacher-ai-fe-backup.tar.gz

# Load image from tar
docker load < teacher-ai-fe-backup.tar.gz
```

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs container
2. Kiểm tra health check
3. Kiểm tra nginx configuration
4. Tạo issue trên repository

## 📚 Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
