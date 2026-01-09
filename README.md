# 🚀 ViVi CMO Agent

**AI-Powered Social Media Management Platform** - A comprehensive backend service for autonomous social media operations, content optimization, and brand management.

## ✨ **What We've Built**

### **🎯 Core AI Infrastructure** ✅
- **LLM Router**: Intelligent model selection with cost optimization
- **Vector Database**: pgvector integration for semantic search and similarity
- **Embedding Generation**: OpenAI-powered content embeddings
- **Cost Tracking**: Real-time token usage and cost monitoring

### **🖼️ Media Processing Pipeline** ✅
- **FFmpeg Integration**: Video/image/audio processing
- **S3/MinIO Support**: Scalable object storage
- **Derivative Generation**: Multiple aspect ratios (1:1, 4:5, 9:16, 16:9)
- **Sharp Processing**: High-performance image manipulation

### **⚡ Queue System** ✅
- **BullMQ Integration**: Robust job processing with Redis
- **15 Job Types**: Media ingest, publishing, analytics, AI operations
- **Retry Logic**: Exponential backoff with dead letter queues
- **Real-time Monitoring**: Job status and performance tracking

### **🔐 Authentication & Security** ✅
- **Auth0 Integration**: JWT-based authentication
- **Role-Based Access**: Granular permissions system
- **Rate Limiting**: Per-user request throttling
- **Organization Scoping**: Multi-tenant security

### **📊 Vector Search & AI** ✅
- **Semantic Search**: Find similar content, personas, policies
- **Competitor Intelligence**: AI-powered market analysis
- **Trend Detection**: Automated trend identification
- **Content Recommendations**: ML-driven content suggestions

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express API   │    │   LLM Router    │    │  Vector Store   │
│                 │◄──►│                 │◄──►│                 │
│  • REST/SSE    │    │  • Model Select │    │  • Embeddings   │
│  • WebSocket   │    │  • Cost Track   │    │  • Similarity   │
│  • Auth/ACL    │    │  • Langfuse     │    │  • pgvector     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Queue Manager  │    │ Media Processor │    │  Storage Layer  │
│                 │    │                 │    │                 │
│  • BullMQ      │    │  • FFmpeg       │    │  • S3/MinIO     │
│  • Redis       │    │  • Sharp        │    │  • Derivatives  │
│  • Workers     │    │  • Analysis     │    │  • CDN Ready    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+ (with pgvector extension)

### **Quick Start**
```bash
# Clone and setup
git clone <repository-url>
cd vivi-cmo-agent

# Run the automated setup
./quick-start.sh

# Start development server
pnpm dev
```

### **Manual Setup**
```bash
# Install dependencies
pnpm install

# Start infrastructure
docker-compose up -d

# Configure environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your API keys

# Setup database
pnpm db:migrate
pnpm db:seed

# Build and start
pnpm build
pnpm dev
```

## 🔧 **Environment Configuration**

Create `apps/api/.env` with:

```env
# Core
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vivi_cmo_agent

# Redis
REDIS_URL=redis://localhost:6379

# Storage
STORAGE_PROVIDER=minio
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin

# OpenAI
OPENAI_API_KEY=your-key-here

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.vivi.ai
```

## 📚 **API Endpoints**

### **🔐 Authentication Required**
All endpoints require valid JWT token in `Authorization: Bearer <token>` header.

### **🏥 Health & Status**
- `GET /health` - Service health check
- `GET /health/db` - Database connectivity

### **🤖 AI & LLM**
- `POST /api/llm/chat` - Chat completion with intelligent routing
- `POST /api/vector/search` - Semantic similarity search

### **📱 Media Management**
- `POST /api/media/upload` - File upload and processing
- `GET /api/media/:id` - Retrieve media asset
- `GET /api/media/:id/derivatives` - Get processed derivatives

### **👥 Onboarding & Persona**
- `POST /api/onboarding/submit` - Complete onboarding
- `GET /api/onboarding/status` - Check completion status
- `GET /api/persona` - Retrieve persona profile
- `GET /api/persona/contextbundle` - Get complete context

### **📅 Content Planning**
- `POST /api/plan/variants` - Generate caption variants
- `POST /api/plan/schedule` - Schedule content
- `POST /api/plan/boost` - Boost content (Pro+)
- `POST /api/plan/ab-tests` - A/B testing (Pro+)

### **📈 Growth & Analytics**
- `GET /api/grow/trendtap/feed` - Trend analysis
- `POST /api/grow/reviews/reply` - Review management
- `GET /api/grow/roi/forecast` - ROI predictions (Pro+)

### **👂 Social Listening**
- `POST /api/listen/webhooks/:provider` - Webhook ingestion
- `GET /api/listen/digest` - Daily digest (Lite)
- `GET /api/listen/inbox` - Inbox view (Plus+)

### **🎯 Voice Commands**
- `POST /api/voice/command` - Process voice commands
- `GET /api/voice/stream` - SSE stream (Prime)

### **🚀 Sentry (Prime)**
- `POST /api/sentry/toggle` - Enable/disable autonomy
- `GET /api/sentry/missions` - List missions
- `GET /api/sentry/missions/:id/log` - Mission logs (SSE)

## 🎯 **Plan Tiers & Features**

### **LITE** - Essential Features
- ✅ Basic media processing
- ✅ 2 caption variants
- ✅ 25 scheduled posts
- ✅ Basic analytics
- ✅ Social listening digest

### **PLUS** - Growth Features
- ✅ 3 caption variants
- ✅ Unlimited scheduling
- ✅ LinkedIn/Shorts support
- ✅ CRM integration
- ✅ Advanced listening

### **PRO** - Professional Features
- ✅ Campaign composer
- ✅ Boost (1x/2x/3x)
- ✅ A/B testing
- ✅ ROI forecasting
- ✅ Full listening suite

### **PRIME** - Autonomous Features
- ✅ Sentry missions
- ✅ Competitor intelligence
- ✅ Experimentation engine
- ✅ Risk management
- ✅ Concierge service

## 🔄 **Job Queue System**

### **Available Queues**
1. **media.ingest** - File processing and analysis
2. **schedule.publish** - Content publishing
3. **trend.scan** - Trend detection
4. **analytics.rollup** - Metrics aggregation
5. **listen.webhook** - Social media events
6. **nudge.dispatch** - User notifications
7. **ab.runner** - A/B test execution
8. **roi.backtest** - ROI model testing
9. **sentry.mission** - Autonomous operations
10. **sentry.step** - Mission step execution
11. **policy.approval** - Automated approvals
12. **competitor.scan** - Market analysis
13. **experiment.tick** - Experiment advancement
14. **risk.evaluate** - Risk assessment

### **Queue Management**
```bash
# Monitor queues
docker exec -it vivi-cmo-agent-redis-1 redis-cli

# View job status
# (via BullMQ dashboard or Redis CLI)
```

## 🗄️ **Database Schema**

### **Core Tables**
- `orgs` - Organization management
- `users` - User accounts and roles
- `entitlements` - Feature access control
- `mediaAssets` - Media storage and metadata
- `scheduledPosts` - Content scheduling
- `missions` - Autonomous operations
- `embeddings` - Vector storage for AI

### **Vector Database**
- **pgvector extension** for similarity search
- **1536-dimensional embeddings** (OpenAI compatible)
- **IVFFlat indexing** for fast similarity queries
- **Organization-scoped** embeddings for security

## 🚀 **Development Workflow**

### **Package Structure**
```
vivi-cmo-agent/
├── apps/
│   └── api/                 # Express API server
├── packages/
│   ├── common/             # Shared types & utilities
│   ├── entitlements/       # Feature gating system
│   ├── router/             # LLM routing & cost tracking
│   └── media/              # Media processing pipeline
```

### **Development Commands**
```bash
# Development
pnpm dev                    # Start API server
pnpm build                  # Build all packages
pnpm test                   # Run all tests

# Database
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database
pnpm db:generate           # Generate migrations

# Package management
pnpm --filter api dev      # Start only API
pnpm --filter router build # Build only router
```

### **Testing Strategy**
- **Unit Tests**: Individual package testing
- **Integration Tests**: API endpoint testing
- **Contract Tests**: Service interface validation
- **Performance Tests**: Load and stress testing

## 🔒 **Security Features**

### **Authentication**
- JWT-based authentication with Auth0
- Role-based access control (RBAC)
- Organization-scoped data access
- Rate limiting per user/IP

### **Data Protection**
- PII redaction in logs
- Encrypted provider tokens (JWE)
- Audit logging for external actions
- Input validation with Zod schemas

### **Infrastructure Security**
- Helmet.js security headers
- CORS configuration
- Rate limiting
- Request ID tracking

## 📊 **Observability & Monitoring**

### **Tracing & Metrics**
- **Langfuse**: LLM operation tracking
- **OpenTelemetry**: Distributed tracing
- **Sentry**: Error monitoring and alerting
- **Custom metrics**: Cost tracking, performance

### **Health Checks**
- Service health monitoring
- Database connectivity
- Redis availability
- Storage service status

### **Logging**
- Structured logging throughout
- Request ID correlation
- Error tracking and reporting
- Performance metrics

## 🐳 **Docker Services**

### **Local Development Stack**
- **PostgreSQL 15** with pgvector extension
- **Redis 7** for caching and queues
- **MinIO** for S3-compatible storage
- **LiteLLM Proxy** for model routing
- **Langfuse** for AI observability
- **Jaeger** for distributed tracing

### **Service Management**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 🚀 **Deployment**

### **Production Considerations**
- **Environment Variables**: Secure configuration management
- **Database**: Managed PostgreSQL with pgvector
- **Redis**: Managed Redis cluster
- **Storage**: S3 or compatible service
- **Monitoring**: Production observability stack
- **Scaling**: Horizontal scaling with load balancers

### **Container Deployment**
```bash
# Build production image
docker build -t vivi-cmo-agent .

# Run with environment
docker run -d \
  --name vivi-api \
  -p 3000:3000 \
  --env-file .env \
  vivi-cmo-agent
```

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

### **Code Standards**
- TypeScript strict mode
- ESLint + Prettier
- Comprehensive testing
- API documentation updates

## 📄 **License**

This project is proprietary software. All rights reserved.

## 🆘 **Support**

- **Documentation**: [API Docs](./apps/api/src/openapi/openapi.yaml)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ by the ViVi Team**

*Transforming social media management through AI-powered automation*
