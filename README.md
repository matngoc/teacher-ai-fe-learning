# Teacher AI Frontend - Hana

Giao diện người dùng cho hệ thống giáo viên AI Hana.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
yarn install

# Start dev server
yarn dev
```

### Production Deployment (Docker)

```bash
# 1. Create .env file
cat > .env << 'EOF'
VITE_API_URL=https://api.yourdomain.com
VITE_AI_BE_URL=https://ai-api.yourdomain.com
EOF

# 2. Edit .env with your actual API URLs
nano .env

# 3. Deploy
chmod +x *.sh
./deploy.sh prod
```

**Important:** Replace `https://api.yourdomain.com` with your actual backend API URL.

## 📚 Documentation

- **[Quick Start Docker](QUICK_START_DOCKER.md)** - Hướng dẫn deploy nhanh
- **[Docker Guide](DOCKER_GUIDE.md)** - Hướng dẫn chi tiết về Docker
- **[Fix 502 Error](FIX_502_QUICK.md)** - Khắc phục lỗi 502 (QUAN TRỌNG!)
- **[Troubleshooting](TROUBLESHOOTING_502.md)** - Debug chi tiết

## ⚠️ Common Issues

### Lỗi 502 Bad Gateway

**Nguyên nhân:** API URL chưa được cấu hình đúng lúc build.

**Giải pháp nhanh:**
```bash
# Tạo .env với API URL đúng
echo "VITE_API_URL=https://your-api.com" > .env

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

👉 Xem chi tiết: [FIX_502_QUICK.md](FIX_502_QUICK.md)

### Kiểm tra cấu hình

```bash
./check-config.sh
```

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite
- Redux Toolkit
- Ant Design
- Docker + Nginx

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (accessible from browser) | Yes |
| `VITE_AI_BE_URL` | AI Backend URL (accessible from browser) | Optional |

**Note:** These variables are embedded at build time, not runtime.

## 🔧 Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `./deploy.sh prod` - Deploy to production
- `./check-config.sh` - Check configuration
- `./start.sh` - Start Docker containers
- `./stop.sh` - Stop Docker containers

## 📦 Project Structure

```
src/
├── api/          # API services
├── components/   # Reusable components
├── core/         # Core utilities, configs, layouts
├── pages/        # Page components
├── router/       # Routing configuration
└── stores/       # Redux stores
```

## 🚢 Deployment

### Requirements

- Docker & Docker Compose
- Ubuntu Server 20.04+ (recommended)
- Port 5173 available
- Backend API accessible from internet

### Deploy Steps

1. Clone repository
2. Create `.env` file with API URLs
3. Run `./deploy.sh prod`
4. Access at `http://your-server:5173`

See [QUICK_START_DOCKER.md](QUICK_START_DOCKER.md) for detailed instructions.

## 📄 License

MIT


