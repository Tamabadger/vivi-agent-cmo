# 🚀 ViVi CMO Agent - Quick Reference Card

## 📍 **New API Endpoints (Sprints 33-36)**

### **🎤 Sprint 33: Voice Commands**
```bash
# Process voice command
POST /api/voice/command
{
  "audio": "base64_audio_data",
  "language": "en",
  "context": "social media management"
}

# Text-to-speech
POST /api/voice/speech
{
  "text": "Your text here",
  "voice": "alloy",
  "format": "mp3"
}
```

### **🎨 Sprint 34: AI Media Engine**
```bash
# Get content remix recommendations
POST /api/vision/remix
{
  "contentId": "uuid",
  "targetPlatforms": ["instagram", "tiktok"],
  "remixType": "auto_clip"
}

# Generate AI content
POST /api/vision/generate
{
  "prompt": "Create a professional LinkedIn post",
  "platform": "linkedin",
  "style": "corporate"
}
```

### **🔍 Sprint 35: Sentiment Intelligence**
```bash
# Analyze sentiment
POST /api/sentry/analyze
{
  "text": "Brand mention text",
  "source": "twitter",
  "authorType": "customer"
}

# Get trend insights
GET /api/sentry/trends?orgId=uuid&timeframe=24h
```

### **🧠 Sprint 36: Learning Loops**
```bash
# Initialize learning loop
POST /api/roi/learning-loop
{
  "orgId": "uuid",
  "objective": "increase_engagement",
  "metrics": ["likes", "comments", "shares"]
}

# Get competitor insights
GET /api/roi/competitors?orgId=uuid
```

## 🔧 **Feature Flags by Plan Tier**

| Feature | LITE | PLUS | PRO | PRIME |
|---------|------|------|-----|-------|
| Voice Commands | ❌ | ✅ | ✅ | ✅ |
| AI Media Engine | ❌ | ❌ | ✅ | ✅ |
| Sentiment Intelligence | ❌ | ❌ | ✅ | ✅ |
| Learning Loops | ❌ | ❌ | ❌ | ✅ |

## 📊 **Testing Commands**

### **Health Check**
```bash
curl http://localhost:3000/health
```

### **Database Health**
```bash
curl http://localhost:3000/health/db
```

### **Build Status**
```bash
npx pnpm --recursive run build
```

## 🚀 **Quick Start Commands**

```bash
# Install dependencies
npx pnpm install

# Build all packages
npx pnpm --recursive run build

# Start API server
cd apps/api && npx pnpm start

# Run database migrations
cd apps/api && npx pnpm run db:migrate
```

## 📝 **Environment Variables**

```env
# Required
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/vivi

# Optional
STORAGE_PROVIDER=minio
REDIS_URL=redis://localhost:6379
PORT=3000
```

---

**Need Help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions! 🎯
