# 🚀 Quick Start - Docker Deployment

Hướng dẫn nhanh để deploy Teacher AI Frontend bằng Docker trên Ubuntu Server.

## ⚡ TL;DR - Deploy ngay lập tức

```bash
# 1. Clone repository
git clone <repository-url>
cd teacher-ai-fe-learning

# 2. Cấp quyền cho scripts
chmod +x *.sh

# 3. Deploy
./deploy.sh prod
```

Truy cập: **http://your-server-ip:8080**

---

## 📋 Prerequisites Checklist

- [ ] Ubuntu Server 20.04+ đã cài đặt
- [ ] Có quyền sudo
- [ ] Port 80/8080 chưa bị sử dụng
- [ ] Internet connection để pull images

---

## 🔧 Cài đặt Docker (lần đầu)

### Option 1: Script tự động (Recommended)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Option 2: Cài đặt thủ công

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker-compose --version
```

---

## 📦 Deployment Options

### Option A: Sử dụng Scripts (Easiest) ⭐

```bash
# Development (port 80)
./deploy.sh dev

# Production (port 8080)
./deploy.sh prod
```

### Option B: Docker Compose

```bash
# Development
docker-compose up -d --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build
```

### Option C: Docker CLI

```bash
# Build image
docker build -t teacher-ai-fe:latest .

# Run container
docker run -d \
  --name teacher-ai-fe \
  -p 80:80 \
  --restart unless-stopped \
  teacher-ai-fe:latest
```

---

## 🎮 Quản lý Container

### Start/Stop/Restart

```bash
# Start
./start.sh prod

# Stop
./stop.sh prod

# Restart
./stop.sh prod && ./start.sh prod

# Hoặc dùng docker-compose
docker-compose restart
```

### Xem Logs

```bash
# Real-time logs
docker logs -f teacher-ai-fe-learning-prod

# Last 100 lines
docker logs --tail 100 teacher-ai-fe-learning-prod

# Logs từ thời điểm cụ thể
docker logs --since 10m teacher-ai-fe-learning-prod
```

### Kiểm tra trạng thái

```bash
# List containers
docker ps

# Check health
curl http://localhost:8080

# Container stats
docker stats teacher-ai-fe-learning-prod
```

---

## 🔄 Update & Maintenance

### Update ứng dụng

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./deploy.sh prod
```

### Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Full cleanup
docker system prune -a -f --volumes
```

---

## 🐛 Troubleshooting

### Container không start?

```bash
# Check logs
docker logs teacher-ai-fe-learning-prod

# Check if port is in use
sudo lsof -i :8080

# Inspect container
docker inspect teacher-ai-fe-learning-prod
```

### Build failed?

```bash
# Clear cache and rebuild
docker builder prune -a -f
./deploy.sh prod
```

### Permission denied?

```bash
# Fix docker permission
sudo chmod 666 /var/run/docker.sock

# Or re-add to group
sudo usermod -aG docker $USER
newgrp docker
```

### Port already in use?

```bash
# Find process using port
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.prod.yml
ports:
  - "9090:80"  # Change 8080 to 9090
```

---

## 🔐 Security Tips

```bash
# 1. Enable firewall
sudo ufw enable
sudo ufw allow 8080/tcp

# 2. Run health checks
docker inspect --format='{{.State.Health.Status}}' teacher-ai-fe-learning-prod

# 3. Monitor logs
docker logs -f teacher-ai-fe-learning-prod | grep -i error

# 4. Auto-restart on failure
# Already configured in docker-compose.prod.yml:
restart: always
```

---

## 📊 Environment-specific Ports

| Environment | Port | URL |
|-------------|------|-----|
| Development | 80 | http://localhost |
| Production | 8080 | http://localhost:8080 |

Change ports in `docker-compose.yml` or `docker-compose.prod.yml`

---

## 🌐 Nginx Configuration

Default nginx config serves from `/usr/share/nginx/html`

To customize, edit `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

Then rebuild:
```bash
./deploy.sh prod
```

---

## 📈 Monitoring

### Resource usage

```bash
# Real-time monitoring
docker stats

# Check disk usage
docker system df

# Check container size
docker ps -s
```

### Automated monitoring

```bash
# Setup cron for health checks
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * docker inspect teacher-ai-fe-learning-prod | grep -q '"Status": "running"' || /path/to/start.sh prod
```

---

## 🔗 Useful Commands

```bash
# Enter container shell
docker exec -it teacher-ai-fe-learning-prod sh

# Copy files from container
docker cp teacher-ai-fe-learning-prod:/usr/share/nginx/html ./backup

# View container processes
docker top teacher-ai-fe-learning-prod

# Export container
docker export teacher-ai-fe-learning-prod > container-backup.tar

# Network info
docker network inspect teacher-ai-network
```

---

## 📚 Tài liệu đầy đủ

- **DOCKER_README.md** - Hướng dẫn chi tiết về Docker
- **DOCKER_GUIDE.md** - Hướng dẫn setup từ đầu
- **DOCKER_YARN_GUIDE.md** - Cấu hình Yarn với Docker

---

## ✅ Checklist sau khi deploy

- [ ] Container đang chạy: `docker ps`
- [ ] Health check OK: `curl http://localhost:8080`
- [ ] Logs không có errors: `docker logs teacher-ai-fe-learning-prod`
- [ ] Auto-restart enabled: `docker inspect teacher-ai-fe-learning-prod | grep -i restart`
- [ ] Firewall configured: `sudo ufw status`

---

## 🆘 Support

Gặp vấn đề? Thử các bước sau:

1. Check logs: `docker logs teacher-ai-fe-learning-prod`
2. Restart container: `./stop.sh prod && ./start.sh prod`
3. Rebuild: `./deploy.sh prod`
4. Clear cache: `docker system prune -a -f && ./deploy.sh prod`
5. Check documentation: `DOCKER_README.md` và `DOCKER_GUIDE.md`

---

**Happy Deploying! 🎉**

