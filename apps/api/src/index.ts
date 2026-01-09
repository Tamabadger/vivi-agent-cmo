import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { requestId } from './middleware/requestId';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { upload, processUpload, checkUploadProgress } from './middleware/upload';
import { LLMRouter } from '@vivi/router';
import { MediaProcessor, StorageManager } from '@vivi/media';
import { VisionAnalyzer } from '@vivi/vision';
import { VoiceProcessor } from '@vivi/voice';
import { QueueManager } from './jobs/queue-manager';
import { VectorStore } from './db/vector-store';
import { sql } from 'drizzle-orm';

// Load environment variables
config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Initialize services
let llmRouter: LLMRouter;
let storageManager: StorageManager;
let mediaProcessor: MediaProcessor;
let visionAnalyzer: VisionAnalyzer;
let voiceProcessor: VoiceProcessor;
let queueManager: QueueManager;
let vectorStore: VectorStore;

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing ViVi CMO Agent services...');

    // Initialize LLM Router
    llmRouter = new LLMRouter(
      process.env.OPENAI_API_KEY || ''
    );

    // Initialize Storage Manager
    storageManager = new StorageManager({
      provider: (process.env.STORAGE_PROVIDER as 's3' | 'minio') || 'minio',
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      accessKey: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
      bucket: process.env.STORAGE_BUCKET || 'vivi-media',
      region: process.env.STORAGE_REGION || 'us-east-1',
      useSSL: process.env.STORAGE_USE_SSL === 'true',
      forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true'
    });

    // Create storage bucket if it doesn't exist
    await storageManager.createBucketIfNotExists();

    // Initialize Media Processor
    mediaProcessor = new MediaProcessor(storageManager, {
      quality: 'medium',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'],
      generateThumbnails: true,
      extractAudio: true,
      analyzeContent: true
    });

    // Initialize Vision Analyzer
    visionAnalyzer = new VisionAnalyzer(
      process.env.OPENAI_API_KEY || '',
      0.7
    );

    // Initialize Voice Processor
    voiceProcessor = new VoiceProcessor(
      process.env.OPENAI_API_KEY || '',
      {
        language: 'en',
        model: 'whisper-1',
        includeSentiment: true,
        includeKeywords: true
      }
    );

    // Initialize Queue Manager
    queueManager = new QueueManager(
      process.env.REDIS_URL || 'redis://localhost:6379',
      llmRouter,
      mediaProcessor
    );

    // Initialize Vector Store
    vectorStore = new VectorStore(llmRouter);

    // Setup queues
    await queueManager.setupQueues();

    // Initialize vector store
    await vectorStore.initialize();

    console.log('✅ All services initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RateLimitExceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestId);

// Health check route (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    // Simple database connectivity test
    const result = await import('./db').then(m => m.db.execute(sql`SELECT 1`));
    res.json({
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// API routes with authentication
app.use('/api', auth);

// Import and register route modules
import healthRouter from './routes/health';
import onboardingRouter from './routes/onboarding';
import personaRouter from './routes/persona';
import planRouter from './routes/plan';
import growRouter from './routes/grow';
import listenRouter from './routes/listen';
import trackRouter from './routes/track';
import voiceRouter from './routes/voice';
import sentryRouter from './routes/sentry';

// Register routes
app.use('/api/health', healthRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/persona', personaRouter);
app.use('/api/plan', planRouter);
app.use('/api/grow', growRouter);
app.use('/api/listen', listenRouter);
app.use('/api/track', trackRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/sentry', sentryRouter);

// Initialize services
initializeServices().then(() => {
  // Media upload route with proper file handling (after services are initialized)
  app.post('/api/media/upload', 
    auth, 
    upload.single('file'), 
    processUpload(queueManager)
  );

  // Check upload progress
  app.get('/api/media/upload/:jobId/progress', 
    auth, 
    checkUploadProgress(queueManager)
  );

  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 ViVi CMO Agent API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 API docs: http://localhost:${PORT}/api`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Vision analysis endpoint
app.post('/api/vision/analyze', auth, async (req, res) => {
  try {
    const { image, analysisTypes, maxResults, confidenceThreshold } = req.body;
    
    if (!image || !analysisTypes || !Array.isArray(analysisTypes)) {
      return res.status(400).json({
        error: 'Image data and analysis types are required',
        code: 'ValidationError'
      });
    }

    // Convert base64 to buffer if needed
    let imageBuffer: Buffer;
    if (typeof image === 'string') {
      imageBuffer = Buffer.from(image, 'base64');
    } else {
      imageBuffer = image;
    }

    const response = await visionAnalyzer.analyzeImage({
      image: imageBuffer,
      analysisTypes,
      maxResults: maxResults || 10,
      confidenceThreshold: confidenceThreshold || 0.7
    });

    res.json(response);
  } catch (error) {
    console.error('Vision analysis error:', error);
    res.status(500).json({
      error: 'Vision analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Voice command endpoint
app.post('/api/voice/command', auth, async (req, res) => {
  try {
    const { audio, language, context } = req.body;
    
    if (!audio) {
      return res.status(400).json({
        error: 'Audio data is required',
        code: 'ValidationError'
      });
    }

    // Convert base64 to buffer if needed
    let audioBuffer: Buffer;
    if (typeof audio === 'string') {
      audioBuffer = Buffer.from(audio, 'base64');
    } else {
      audioBuffer = audio;
    }

    const response = await voiceProcessor.processVoiceCommand({
      audio: audioBuffer,
      language: language || 'en',
      context: context || 'social media management'
    });

    res.json(response);
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({
      error: 'Voice command processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Text-to-speech endpoint
app.post('/api/voice/speech', auth, async (req, res) => {
  try {
    const { text, voice, format } = req.body;
    
    if (!text) {
      return res.status(400).json({
        error: 'Text is required',
        code: 'ValidationError'
      });
    }

    const audioBuffer = await voiceProcessor.generateSpeech(
      text,
      voice || 'alloy',
      format || 'mp3'
    );

    res.set({
      'Content-Type': `audio/${format || 'mp3'}`,
      'Content-Length': audioBuffer.length.toString()
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({
      error: 'Text-to-speech generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// LLM chat endpoint
app.post('/api/llm/chat', auth, async (req, res) => {
  try {
    const { messages, model, maxTokens, temperature, topP } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required',
        code: 'ValidationError'
      });
    }

    const response = await llmRouter.chatCompletion({
      messages,
      model,
      maxTokens,
      temperature,
      topP
    }, req.orgId || 'default');

    res.json(response);
  } catch (error) {
    console.error('LLM chat error:', error);
    res.status(500).json({
      error: 'Chat completion failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Vector search endpoint
app.post('/api/vector/search', auth, async (req, res) => {
  try {
    const { query, type, threshold, limit } = req.body;
    
    if (!query || !type) {
      return res.status(400).json({
        error: 'Query and type are required',
        code: 'ValidationError'
      });
    }

    const results = await vectorStore.similaritySearch(
      query,
      req.orgId,
      type,
      threshold || 0.7,
      limit || 10
    );

    res.json({
      results,
      query,
      type,
      threshold: threshold || 0.7,
      limit: limit || 10
    });
  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({
      error: 'Vector search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  
  try {
    if (queueManager) {
      await queueManager.close();
    }
    if (llmRouter) {
      await llmRouter.close();
    }
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  
  try {
    if (queueManager) {
      await queueManager.close();
    }
    if (llmRouter) {
      await llmRouter.close();
    }
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default app;
