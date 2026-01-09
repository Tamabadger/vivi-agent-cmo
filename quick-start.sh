#!/bin/bash

set -e

echo "🚀 ViVi CMO Agent - Quick Start Setup"
echo "======================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm 8+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ All prerequisites are installed"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Some services failed to start. Check docker-compose logs for details."
    exit 1
fi

echo "✅ All services are running"

# Create environment file
echo ""
echo "⚙️ Creating environment configuration..."
cat > apps/api/.env << EOF
# Server Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Authentication
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.vivi.ai
AUTH0_PUBLIC_KEY=your-public-key
AUTH_BYPASS=true

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vivi_cmo_agent

# Redis
REDIS_URL=redis://localhost:6379

# Storage (MinIO/S3)
STORAGE_PROVIDER=minio
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=vivi-media
STORAGE_REGION=us-east-1
STORAGE_USE_SSL=false
STORAGE_FORCE_PATH_STYLE=true

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Langfuse
LANGFUSE_SECRET_KEY=your-langfuse-secret-key
LANGFUSE_PUBLIC_KEY=your-langfuse-public-key
LANGFUSE_HOST=https://cloud.langfuse.com

# Sentry
SENTRY_DSN=your-sentry-dsn

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=vivi-cmo-agent
EOF

echo "✅ Environment file created at apps/api/.env"

# Run database migrations
echo ""
echo "🗄️ Running database migrations..."
cd apps/api
pnpm db:migrate

# Seed the database
echo ""
echo "🌱 Seeding database..."
pnpm db:seed

# Build all packages
echo ""
echo "🔨 Building packages..."
cd ../..
pnpm run build

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update apps/api/.env with your actual API keys"
echo "2. Start the development server: pnpm dev"
echo "3. Access the API at http://localhost:3000"
echo "4. Check health at http://localhost:3000/health"
echo ""
echo "🔧 Available commands:"
echo "  pnpm dev          - Start development server"
echo "  pnpm build        - Build all packages"
echo "  pnpm test         - Run tests"
echo "  pnpm db:migrate   - Run database migrations"
echo "  pnpm db:seed      - Seed database"
echo ""
echo "🐳 Docker services:"
echo "  docker-compose up -d    - Start services"
echo "  docker-compose down     - Stop services"
echo "  docker-compose logs     - View logs"
echo ""
echo "Happy coding! 🚀"
