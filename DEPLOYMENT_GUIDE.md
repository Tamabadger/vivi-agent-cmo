# 🚀 ViVi CMO Agent - Deployment Guide for Sprints 33-36

## 📋 **Overview**

This guide provides step-by-step instructions for deploying the new ViVi CMO Agent features implemented in Sprints 33-36. These features transform ViVi into an intelligent, autonomous marketing strategist with voice commands, AI media generation, sentiment intelligence, and adaptive learning capabilities.

## 🎯 **New Features Overview**

### **Sprint 33: Voice-First Interaction Layer**
- Voice command processing and natural language understanding
- Automatic campaign generation from voice input
- Platform-specific content optimization

### **Sprint 34: AI Media Engine**
- AI-powered content remixing and recommendations
- Automatic video clipping and optimization
- Faceless video generation using licensed templates

### **Sprint 35: Social Listening + Sentiment Intelligence**
- Real-time sentiment analysis and emotion detection
- Crisis detection and automatic escalation
- Trend monitoring and competitive intelligence

### **Sprint 36: Adaptive Learning Loop**
- AI-driven performance optimization
- Competitor benchmarking and analysis
- Automatic strategy adjustments

## 🛠️ **Prerequisites**

### **System Requirements**
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher with `pgvector` extension
- **Redis**: v6.0 or higher
- **MinIO/S3**: For media storage
- **Memory**: Minimum 4GB RAM, 8GB recommended
- **Storage**: 20GB+ available disk space

### **API Keys Required**
- **OpenAI API Key**: For AI-powered features
- **Auth0 Configuration**: For authentication (optional, can use development mode)

## 🚀 **Deployment Steps**

### **Step 1: Environment Setup**

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/MoonManEnt/vivi-cmo-agent.git
cd vivi-cmo-agent
npx pnpm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vivi_cmo_agent"
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=vivi_cmo_agent

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Storage (MinIO or S3)
STORAGE_PROVIDER=minio
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=vivi-media

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=production
```

### **Step 2: Database Setup**

1. **Start PostgreSQL with pgvector**
```bash
# Using Docker
docker run -d \
  --name vivi-postgres \
  -e POSTGRES_USER=your_db_user \
  -e POSTGRES_PASSWORD=your_db_password \
  -e POSTGRES_DB=vivi_cmo_agent \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

2. **Run Database Migrations**
```bash
cd apps/api
npx pnpm run db:migrate
```

3. **Seed Initial Data (Optional)**
```bash
npx pnpm run db:seed
```

### **Step 3: Infrastructure Services**

1. **Start Redis**
```bash
docker run -d \
  --name vivi-redis \
  -p 6379:6379 \
  redis:7-alpine
```

2. **Start MinIO (Media Storage)**
```bash
docker run -d \
  --name vivi-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

3. **Create Storage Bucket**
```bash
# Access MinIO console at http://localhost:9001
# Login with minioadmin/minioadmin
# Create bucket: vivi-media
```

### **Step 4: Build and Deploy**

1. **Build All Packages**
```bash
npx pnpm --recursive run build
```

2. **Start the API Server**
```bash
cd apps/api
npx pnpm start
```

3. **Verify Deployment**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🧪 **Testing New Features**

### **Test 1: Voice Commands (Sprint 33)**

```bash
# Test voice command processing
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "audio": "base64_encoded_audio_data",
    "language": "en",
    "context": "social media management"
  }'
```

**Expected**: Campaign data with platform optimization

### **Test 2: AI Media Engine (Sprint 34)**

```bash
# Test content remix recommendations
curl -X POST http://localhost:3000/api/vision/remix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentId": "your_content_id",
    "targetPlatforms": ["instagram", "tiktok"],
    "remixType": "auto_clip"
  }'
```

**Expected**: Remix recommendations with effort/impact analysis

### **Test 3: Sentiment Intelligence (Sprint 35)**

```bash
# Test sentiment analysis
curl -X POST http://localhost:3000/api/sentry/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Sample brand mention text",
    "source": "twitter",
    "authorType": "customer"
  }'
```

**Expected**: Sentiment analysis with emotion scores and urgency assessment

### **Test 4: Learning Loop (Sprint 36)**

```bash
# Test learning loop initialization
curl -X POST http://localhost:3000/api/roi/learning-loop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orgId": "your_org_id",
    "objective": "increase_engagement",
    "metrics": ["likes", "comments", "shares"]
  }'
```

**Expected**: Learning loop configuration with optimization recommendations

## 🔧 **Configuration Options**

### **Feature Flags**

Enable/disable features per organization:
```typescript
// In packages/entitlements/src/enhanced-features.ts
export const ENHANCED_PLAN_FEATURES = {
  LITE: {
    voiceCommands: false,
    aiMediaEngine: false,
    sentimentIntelligence: false,
    learningLoops: false
  },
  PLUS: {
    voiceCommands: true,
    aiMediaEngine: false,
    sentimentIntelligence: false,
    learningLoops: false
  },
  PRO: {
    voiceCommands: true,
    aiMediaEngine: true,
    sentimentIntelligence: true,
    learningLoops: false
  },
  PRIME: {
    voiceCommands: true,
    aiMediaEngine: true,
    sentimentIntelligence: true,
    learningLoops: true
  }
};
```

### **AI Model Configuration**

Customize AI behavior:
```typescript
// In packages/router/src/llm-router.ts
const models = new Map<string, ModelConfig>();
models.set('gpt-4o', {
  provider: 'openai',
  model: 'gpt-4o',
  maxTokens: 128000,
  costPer1kInput: 0.005,
  costPer1kOutput: 0.015,
  latencyMs: 2000,
  quality: 'high',
  capabilities: ['reasoning', 'creativity', 'analysis', 'multimodal']
});
```

## 📊 **Monitoring & Analytics**

### **Health Checks**

Monitor system health:
```bash
# API Health
curl http://localhost:3000/health

# Database Health
curl http://localhost:3000/health/db

# Queue Health
curl http://localhost:3000/health/queues
```

### **Performance Metrics**

Track key performance indicators:
- **Voice Command Accuracy**: Success rate of voice-to-campaign conversion
- **AI Generation Speed**: Average time for content remix recommendations
- **Sentiment Detection Accuracy**: Precision of emotion and urgency assessment
- **Learning Loop Effectiveness**: Performance improvement from AI optimizations

### **Cost Monitoring**

Track OpenAI API usage:
```bash
# Check cost summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/analytics/costs
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Ensure `pgvector` extension is installed

2. **Redis Connection Issues**
   - Verify Redis is running on port 6379
   - Check `REDIS_URL` configuration
   - Restart Redis if needed

3. **OpenAI API Errors**
   - Verify `OPENAI_API_KEY` is valid
   - Check API quota and billing
   - Ensure network connectivity

4. **Storage Issues**
   - Verify MinIO/S3 is accessible
   - Check bucket permissions
   - Verify access keys

### **Logs and Debugging**

Enable debug logging:
```env
DEBUG=vivi:*
LOG_LEVEL=debug
```

View application logs:
```bash
# API logs
tail -f apps/api/logs/app.log

# Queue logs
tail -f apps/api/logs/queue.log
```

## 🔒 **Security Considerations**

### **Authentication**
- Use strong JWT secrets
- Implement rate limiting
- Enable CORS properly for production

### **Data Privacy**
- Encrypt sensitive data at rest
- Implement proper access controls
- Regular security audits

### **API Security**
- Validate all inputs
- Sanitize user content
- Monitor for suspicious activity

## 📈 **Scaling Considerations**

### **Horizontal Scaling**
- Use load balancers for multiple API instances
- Implement Redis clustering for high availability
- Use managed PostgreSQL services for production

### **Performance Optimization**
- Implement caching layers
- Use CDN for media assets
- Optimize database queries

### **Resource Management**
- Monitor memory usage
- Implement connection pooling
- Use queue workers for heavy tasks

## 🎯 **Next Steps**

1. **Production Deployment**: Deploy to your production environment
2. **User Training**: Train your team on the new features
3. **Performance Monitoring**: Set up monitoring and alerting
4. **Feature Rollout**: Gradually enable features for users
5. **Feedback Collection**: Gather user feedback and iterate

## 📞 **Support**

For deployment issues or questions:
- Check the troubleshooting section above
- Review application logs
- Consult the implementation documentation
- Contact the development team

---

**Happy Deploying! 🚀**

The ViVi CMO Agent is now ready to transform your social media marketing with AI-powered intelligence!
