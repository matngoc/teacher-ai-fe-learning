# 🐳 Docker Deployment Guide - Teacher AI Frontend

Hướng dẫn build và deploy ứng dụng Teacher AI Frontend trên Ubuntu Server sử dụng Docker.

---

## 📋 **Yêu Cầu Hệ Thống**

### **Ubuntu Server:**
- Ubuntu 20.04 LTS hoặc mới hơn
- RAM: Tối thiểu 2GB
- Disk: Tối thiểu 10GB trống
- Docker version 20.10+
- Docker Compose version 1.29+

---

## 🚀 **Cài Đặt Docker trên Ubuntu**

### **Bước 1: Cập nhật hệ thống**
```bash
sudo apt update
sudo apt upgrade -y
```

### **Bước 2: Cài đặt Docker**
```bash
# Cài đặt các gói cần thiết
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Thêm Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cập nhật và cài Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Kiểm tra cài đặt
docker --version
```

### **Bước 3: Cài đặt Docker Compose**
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Cấp quyền thực thi
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra cài đặt
docker-compose --version
```

### **Bước 4: Thêm user vào Docker group (Optional)**
```bash
# Thêm user hiện tại vào group docker
sudo usermod -aG docker $USER

# Logout và login lại để áp dụng
newgrp docker

# Test không cần sudo
docker ps
```

---

## 📦 **Các File Docker**

### **1. Dockerfile**
- Multi-stage build (builder + nginx)
- Node 18 Alpine cho build
- Nginx Alpine cho production
- Health check tích hợp

### **2. nginx.conf**
- SPA routing configuration
- Gzip compression
- Security headers
- Static asset caching
- API proxy ready

### **3. docker-compose.yml**
- Development environment
- Port 80
- Health check
- Network configuration

### **4. docker-compose.prod.yml**
- Production environment
- Port 8080
- Logging configuration
- Auto-restart policy

### **5. .dockerignore**
- Loại trừ node_modules, dist
- Giảm kích thước build context

---

## 🔧 **Các Lệnh Deployment**

### **Option 1: Sử dụng Script (Recommended)**

#### **1. Deploy Development:**
```bash
# Cấp quyền thực thi
chmod +x deploy.sh build.sh start.sh stop.sh

# Deploy development
./deploy.sh dev
```

#### **2. Deploy Production:**
```bash
./deploy.sh prod
```

#### **3. Build riêng:**
```bash
./build.sh
```

#### **4. Start/Stop:**
```bash
# Start
./start.sh dev    # hoặc ./start.sh prod

# Stop
./stop.sh dev     # hoặc ./stop.sh prod
```

---

### **Option 2: Sử dụng Docker Commands**

#### **1. Build Image:**
```bash
docker build -t teacher-ai-fe-learning:latest .
```

#### **2. Run Container (Development):**
```bash
# Với docker-compose
docker-compose up -d

# Hoặc với docker run
docker run -d \
  --name teacher-ai-fe-learning \
  -p 80:80 \
  --restart unless-stopped \
  teacher-ai-fe-learning:latest
```

#### **3. Run Container (Production):**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

### **Option 3: Các Lệnh Docker Compose**

#### **Build và Start:**
```bash
# Development
docker-compose up -d --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build
```

#### **Stop:**
```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

#### **Rebuild (No Cache):**
```bash
docker-compose build --no-cache
docker-compose up -d
```

#### **View Logs:**
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker logs teacher-ai-fe-learning
```

#### **Restart:**
```bash
docker-compose restart
```

---

## 🔍 **Quản Lý Container**

### **Kiểm tra trạng thái:**
```bash
# List containers
docker ps

# Container details
docker inspect teacher-ai-fe-learning

# Resource usage
docker stats teacher-ai-fe-learning
```

### **View logs:**
```bash
# Follow logs
docker logs -f teacher-ai-fe-learning

# Last 100 lines
docker logs --tail=100 teacher-ai-fe-learning

# With timestamps
docker logs -t teacher-ai-fe-learning
```

### **Execute commands trong container:**
```bash
# Shell access
docker exec -it teacher-ai-fe-learning sh

# Test nginx config
docker exec teacher-ai-fe-learning nginx -t

# Reload nginx
docker exec teacher-ai-fe-learning nginx -s reload
```

---

## 🌐 **Truy Cập Ứng Dụng**

### **Development:**
```
http://localhost:80
http://<server-ip>:80
```

### **Production:**
```
http://localhost:8080
http://<server-ip>:8080
```

---

## 🔧 **Cấu Hình Environment**

### **Tạo file .env (Optional):**
```bash
# .env
NODE_ENV=production
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Teacher AI
```

### **Sử dụng trong docker-compose:**
```yaml
services:
  teacher-ai-fe:
    env_file:
      - .env
```

---

## 🔐 **SSL/HTTPS với Nginx Reverse Proxy**

### **Option 1: Nginx Reverse Proxy + Let's Encrypt**

```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Tạo nginx config cho domain
sudo nano /etc/nginx/sites-available/teacher-ai

# Config:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/teacher-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### **Option 2: Traefik (Docker-based)**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"

  teacher-ai-fe:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.teacher-ai.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.teacher-ai.entrypoints=websecure"
      - "traefik.http.routers.teacher-ai.tls.certresolver=myresolver"
```

---

## 🧹 **Maintenance Commands**

### **Cleanup:**
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Full cleanup
docker system prune -a -f --volumes
```

### **Update application:**
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### **Backup:**
```bash
# Export container
docker export teacher-ai-fe-learning > teacher-ai-backup.tar

# Save image
docker save teacher-ai-fe-learning:latest > teacher-ai-image.tar

# Load image
docker load < teacher-ai-image.tar
```

---

## 📊 **Monitoring**

### **Health Check:**
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' teacher-ai-fe-learning

# Health logs
docker inspect --format='{{json .State.Health}}' teacher-ai-fe-learning | jq
```

### **Resource Monitoring:**
```bash
# Real-time stats
docker stats teacher-ai-fe-learning

# cAdvisor (Web UI)
docker run -d \
  --name=cadvisor \
  -p 8081:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest
```

---

## 🐛 **Troubleshooting**

### **Container không start:**
```bash
# Check logs
docker logs teacher-ai-fe-learning

# Check events
docker events --since 1h

# Inspect container
docker inspect teacher-ai-fe-learning
```

### **Port đã được sử dụng:**
```bash
# Check what's using port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Kill process
sudo kill -9 <PID>
```

### **Build fails:**
```bash
# Clear build cache
docker builder prune -a -f

# Rebuild without cache
docker-compose build --no-cache
```

### **Permission issues:**
```bash
# Fix docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
```

---

## 📝 **Best Practices**

1. ✅ **Always use .dockerignore** để giảm build context
2. ✅ **Multi-stage builds** để giảm image size
3. ✅ **Use alpine images** khi có thể
4. ✅ **Set resource limits** trong production
5. ✅ **Enable logging** với rotation
6. ✅ **Use health checks** cho monitoring
7. ✅ **Regular backups** của data và configs
8. ✅ **Update images** định kỳ cho security patches

---

## 🎯 **Quick Reference**

```bash
# Deploy Development
./deploy.sh dev

# Deploy Production
./deploy.sh prod

# View Logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update
git pull && docker-compose up -d --build

# Cleanup
docker system prune -a -f
```

---

## 📞 **Support**

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker logs teacher-ai-fe-learning`
2. Nginx logs: `docker exec teacher-ai-fe-learning cat /var/log/nginx/error.log`
3. Container status: `docker ps -a`
4. System resources: `docker stats`

---

**Chúc bạn deploy thành công! 🚀**

