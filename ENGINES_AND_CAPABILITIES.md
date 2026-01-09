# 🚀 ViVi CMO Agent - Engines & Capabilities

## 🎯 **Core AI Engines**

### **1. LLM Router Engine** (`@vivi/router`)
**Purpose**: Intelligent AI model selection and cost optimization

**Capabilities**:
- **Model Selection**: Automatically routes requests to the most cost-effective AI model
- **Cost Tracking**: Real-time token usage and cost monitoring per organization
- **Quality Tiers**: 
  - `gpt-4o` (High): Reasoning, creativity, analysis, multimodal
  - `gpt-4o-mini` (Medium): Reasoning, creativity, analysis  
  - `gpt-3.5-turbo` (Low): Basic reasoning, creativity
- **Embedding Generation**: `text-embedding-3-small` for vector operations
- **Cost Optimization**: Routes to cheapest model that meets quality requirements
- **Observability**: Langfuse integration for LLM operation tracking

**Smart Routing Logic**:
```typescript
// Routes based on constraints
const constraints: RoutingConstraints = {
  maxCost: 0.10,           // $0.10 max cost
  maxLatency: 5000,        // 5 seconds max
  requiredQuality: 'medium', // Quality tier requirement
  requiredCapabilities: ['reasoning', 'creativity'], // Required features
  task: 'chat',            // Task type
  locale: 'en'             // Language
};
```

### **2. Media Processing Engine** (`@vivi/media`)
**Purpose**: Professional-grade media processing and optimization

**Capabilities**:
- **Multi-format Support**: Images, videos, audio files
- **FFmpeg Integration**: Professional video/audio processing
- **Sharp Processing**: High-performance image manipulation
- **Derivative Generation**: Multiple aspect ratios for social platforms:
  - `1:1` (Square - Instagram posts)
  - `4:5` (Portrait - Instagram posts)
  - `9:16` (Stories - Instagram/TikTok)
  - `16:9` (Landscape - YouTube/desktop)
- **Content Analysis**: AI-powered media analysis and tagging
- **Storage Management**: S3-compatible storage with MinIO

**Processing Pipeline**:
```typescript
// Image processing with Sharp
const squareBuffer = await sharp(file)
  .resize(1080, 1080, { fit: 'cover', position: 'center' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

### **3. Vision Analysis Engine** (`@vivi/vision`)
**Purpose**: AI-powered image and video content analysis

**Capabilities**:
- **Object Detection**: Identify objects, people, scenes
- **Text Extraction (OCR)**: Extract text from images using Tesseract.js
- **Brand Detection**: Identify brand logos and visual elements
- **Color Analysis**: Dominant color extraction and analysis
- **Face Detection**: Facial recognition and emotion analysis
- **Content Moderation**: Safety filtering for inappropriate content
- **Metadata Extraction**: Image properties and technical details

**Analysis Types**:
```typescript
export enum AnalysisType {
  OBJECTS = 'objects',           // Object detection
  TEXT = 'text',                 // OCR text extraction
  BRANDS = 'brands',             // Brand detection
  COLORS = 'colors',             // Color analysis
  FACES = 'faces',               // Face detection
  EMOTIONS = 'emotions',         // Emotion analysis
  MODERATION = 'moderation'      // Content safety
}
```

### **4. Voice Processing Engine** (`@vivi/voice`)
**Purpose**: Audio transcription and voice command processing

**Capabilities**:
- **Audio Transcription**: OpenAI Whisper integration
- **Voice Commands**: Process natural language voice instructions
- **Sentiment Analysis**: Emotional tone detection in audio
- **Keyword Extraction**: Important term identification
- **Multi-language Support**: Language detection and processing
- **Confidence Scoring**: Transcription accuracy metrics
- **Segment Analysis**: Time-stamped audio segments

**Processing Options**:
```typescript
interface VoiceProcessingOptions {
  language: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';
  model: 'whisper-1';
  temperature: number;
  includeConfidence: boolean;
  includeSegments: boolean;
  includeSentiment: boolean;
  includeKeywords: boolean;
}
```

### **5. Vector Search Engine** (`@vivi/vector-store`)
**Purpose**: Semantic search and similarity matching

**Capabilities**:
- **pgvector Integration**: PostgreSQL vector extension
- **1536-dimensional Embeddings**: OpenAI-compatible vector space
- **IVFFlat Indexing**: Fast similarity search with 100 lists
- **Organization Scoping**: Secure multi-tenant vector storage
- **Semantic Search**: Find similar content, personas, policies
- **Cosine Similarity**: Vector distance calculations
- **Type-based Filtering**: Content, persona, policy, trend, competitor vectors

**Search Function**:
```sql
CREATE OR REPLACE FUNCTION similarity_search(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  org_id_filter UUID,
  type_filter VARCHAR(50)
)
```

## ⚡ **Job Queue Engine** (`@vivi/queue-manager`)

**Purpose**: Asynchronous job processing and task management

**15 Specialized Queues**:
1. **`media.ingest`** - File processing and analysis
2. **`schedule.publish`** - Content publishing automation
3. **`trend.scan`** - Trend detection and analysis
4. **`analytics.rollup`** - Metrics aggregation
5. **`listen.webhook`** - Social media event processing
6. **`nudge.dispatch`** - User notifications
7. **`ab.runner`** - A/B test execution
8. **`roi.backtest`** - ROI model testing
9. **`sentry.mission`** - Autonomous operations
10. **`sentry.step`** - Mission step execution
11. **`policy.approval`** - Automated content approvals
12. **`competitor.scan`** - Market analysis
13. **`experiment.tick`** - Experiment advancement
14. **`risk.evaluate`** - Risk assessment

**Queue Features**:
- **BullMQ Integration**: Redis-based job processing
- **Retry Logic**: Exponential backoff with 3 attempts
- **Dead Letter Queues**: Failed job handling
- **Real-time Monitoring**: Job status and performance tracking
- **Scheduled Jobs**: Delayed execution capabilities

## 🔐 **Entitlements Engine** (`@vivi/entitlements`)

**Purpose**: Feature gating and plan tier management

**4 Plan Tiers with 50+ Features**:

### **LITE Tier** (Essential)
- Basic media processing
- 2 caption variants
- 25 scheduled posts/month
- Basic analytics
- Social listening digest
- 15 review replies/month

### **PLUS Tier** (Growth)
- 3 caption variants
- Unlimited scheduling
- LinkedIn/Shorts support
- CRM integration
- Advanced listening
- 50 review replies/month

### **PRO Tier** (Professional)
- Campaign composer
- Boost engine (1x/2x/3x)
- A/B testing
- ROI forecasting
- Full listening suite
- 200 review replies/month

### **PRIME Tier** (Autonomous)
- Sentry missions (full autonomy)
- Competitor intelligence
- Experimentation engine
- Risk management
- Concierge service
- Advanced budget controls

## 🎯 **Specialized Capabilities**

### **Social Media Management**
- **Multi-platform Support**: Instagram, Facebook, TikTok, LinkedIn, YouTube
- **Content Scheduling**: Automated posting with timezone support
- **Caption Generation**: AI-powered content creation
- **Hashtag Optimization**: Trend-based hashtag suggestions

### **Social Listening & Intelligence**
- **Webhook Processing**: Real-time social media event ingestion
- **Trend Detection**: AI-powered trend identification
- **Competitor Analysis**: Market intelligence and competitive insights
- **Review Management**: Automated response suggestions

### **Content Optimization**
- **A/B Testing**: Statistical content performance testing
- **Boost Management**: Paid promotion optimization
- **ROI Forecasting**: Predictive analytics for content performance
- **Campaign Composer**: Multi-channel campaign orchestration

### **Autonomous Operations (Prime)**
- **Sentry Missions**: Fully autonomous social media operations
- **Policy Engine**: Automated content approval workflows
- **Risk Assessment**: AI-powered content risk evaluation
- **Experimentation**: Automated strategy testing and optimization

## 🔧 **Technical Capabilities**

### **Infrastructure**
- **Docker Services**: PostgreSQL, Redis, MinIO, Langfuse, Jaeger
- **Scalability**: Horizontal scaling with load balancers
- **Security**: JWT authentication, RBAC, rate limiting
- **Monitoring**: OpenTelemetry, Sentry, custom metrics

### **Performance**
- **Vector Search**: Sub-second similarity queries
- **Media Processing**: Parallel processing with queue workers
- **Caching**: Redis-based caching and session management
- **CDN Ready**: Optimized media delivery

### **Integration**
- **API-First**: RESTful endpoints with OpenAPI specification
- **WebSocket Support**: Real-time communication
- **Webhook System**: External service integration
- **SDK Ready**: TypeScript packages for easy integration

## 🚀 **Use Cases & Applications**

### **Content Creators**
- Automated content generation and optimization
- Multi-platform content distribution
- Performance analytics and insights
- Trend-based content planning

### **Marketing Teams**
- Centralized social media management
- Campaign orchestration and automation
- ROI tracking and optimization
- Competitive intelligence

### **Brands & Agencies**
- Brand monitoring and reputation management
- Automated content moderation
- Multi-client management
- Advanced analytics and reporting

### **CMOs & Executives**
- Strategic social media insights
- Automated brand management
- Risk assessment and compliance
- Performance optimization

## 🔮 **Future Roadmap**

### **Phase 1: Core Platform** ✅
- Basic AI infrastructure
- Media processing pipeline
- Queue management system
- Authentication and security

### **Phase 2: Intelligence Layer** 🚧
- Advanced AI capabilities
- Predictive analytics
- Automated optimization
- Enhanced monitoring

### **Phase 3: Autonomy Engine** 📋
- Full autonomous operations
- Advanced risk management
- Experimentation framework
- Competitive intelligence

### **Phase 4: Enterprise Features** 📋
- Multi-tenant architecture
- Advanced compliance
- Enterprise integrations
- Global scaling

---

This engine architecture makes ViVi a **comprehensive AI-powered social media management platform** that can scale from basic content scheduling to fully autonomous brand management, with intelligent cost optimization and enterprise-grade reliability.
