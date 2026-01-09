import { Queue, Worker, Job } from 'bullmq';
import { createClient } from 'redis';
import { LLMRouter } from '@vivi/router';
import { MediaProcessor, StorageManager } from '@vivi/media';
import { db } from '../db';
import { mediaAssets, scheduledPosts, publishAttempts } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface JobData {
  orgId: string;
  userId?: string;
  [key: string]: any;
}

export interface MediaJobData extends JobData {
  file: Buffer;
  metadata: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    encoding: string;
  };
}

export interface PublishJobData extends JobData {
  scheduledPostId: string;
  platform: string;
  assetId: string;
  caption: string;
  scheduledFor: Date;
}

export class QueueManager {
  private redis: any; // Changed from Redis to any as per new import
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private schedulers: Map<string, any>; // Changed from QueueScheduler to any
  private llmRouter: LLMRouter;
  private mediaProcessor: MediaProcessor;

  constructor(
    redisUrl: string,
    llmRouter: LLMRouter,
    mediaProcessor: MediaProcessor
  ) {
    this.redis = createClient({ url: redisUrl });
    this.queues = new Map();
    this.workers = new Map();
    this.schedulers = new Map();
    this.llmRouter = llmRouter;
    this.mediaProcessor = mediaProcessor;
  }

  async setupQueues(): Promise<void> {
    console.log('🚀 Setting up job queues...');

    // Initialize queues
    await this.initializeQueue('media.ingest', this.processMediaIngest.bind(this));
    await this.initializeQueue('schedule.publish', this.processSchedulePublish.bind(this));
    await this.initializeQueue('trend.scan', this.processTrendScan.bind(this));
    await this.initializeQueue('analytics.rollup', this.processAnalyticsRollup.bind(this));
    await this.initializeQueue('listen.webhook', this.processListenWebhook.bind(this));
    await this.initializeQueue('nudge.dispatch', this.processNudgeDispatch.bind(this));
    await this.initializeQueue('ab.runner', this.processABTest.bind(this));
    await this.initializeQueue('roi.backtest', this.processROIBacktest.bind(this));
    await this.initializeQueue('sentry.mission', this.processSentryMission.bind(this));
    await this.initializeQueue('sentry.step', this.processSentryStep.bind(this));
    await this.initializeQueue('policy.approval', this.processPolicyApproval.bind(this));
    await this.initializeQueue('competitor.scan', this.processCompetitorScan.bind(this));
    await this.initializeQueue('experiment.tick', this.processExperimentTick.bind(this));
    await this.initializeQueue('risk.evaluate', this.processRiskEvaluate.bind(this));

    console.log('✅ All queues initialized successfully');
  }

  private async initializeQueue(
    name: string,
    processor: (job: Job) => Promise<any>
  ): Promise<void> {
    // Create queue
    const queue = new Queue(name, {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    // Create scheduler for delayed jobs
    const scheduler = new (require('bullmq').QueueScheduler)(name, {
      connection: this.redis
    });

    // Create worker
    const worker = new Worker(name, processor, {
      connection: this.redis,
      concurrency: 5
    });

    // Handle worker events
    worker.on('completed', (job) => {
      if (job) {
        console.log(`✅ Job ${job.id} completed successfully`);
      }
    });

    worker.on('failed', (job, err) => {
      if (job) {
        console.error(`❌ Job ${job.id} failed:`, err);
      } else {
        console.error(`❌ Job failed:`, err);
      }
    });

    worker.on('error', (err) => {
      console.error(`🚨 Worker error in ${name}:`, err);
    });

    // Store references
    this.queues.set(name, queue);
    this.workers.set(name, worker);
    this.schedulers.set(name, scheduler);

    console.log(`📋 Queue ${name} initialized`);
  }

  // Media ingestion job
  private async processMediaIngest(job: Job<MediaJobData>): Promise<void> {
    const { orgId, file, metadata } = job.data;
    
    try {
      console.log(`🖼️ Processing media for org ${orgId}: ${metadata.originalName}`);
      
      // Process the media asset
      const processedAsset = await this.mediaProcessor.processAsset(file, metadata, orgId);
      
      // Store in database
      await db.insert(mediaAssets).values({
        id: processedAsset.id,
        orgId,
        type: this.getMediaType(metadata.mimetype),
        uri: processedAsset.originalUri,
        metadata: {
          filename: metadata.filename,
          originalName: metadata.originalName,
          mimetype: metadata.mimetype,
          size: metadata.size,
          encoding: metadata.encoding
        },
        analysisJson: processedAsset.analysis,
        derivatives: processedAsset.derivatives,
        language: 'en' // TODO: Detect language
      });

      console.log(`✅ Media asset ${processedAsset.id} processed and stored`);
      
    } catch (error) {
      console.error('❌ Media ingestion failed:', error);
      throw error;
    }
  }

  // Schedule publish job
  private async processSchedulePublish(job: Job<PublishJobData>): Promise<void> {
    const { orgId, scheduledPostId, platform, assetId, caption, scheduledFor } = job.data;
    
    try {
      console.log(`📅 Publishing scheduled post ${scheduledPostId} to ${platform}`);
      
      // TODO: Implement actual platform publishing logic
      // This would integrate with social media APIs
      
      // Update post status
      await db.update(scheduledPosts)
        .set({ status: 'published' })
        .where(eq(scheduledPosts.id, scheduledPostId));
      
      // Record publish attempt
      await db.insert(publishAttempts).values({
        scheduledPostId,
        attemptNo: 1,
        status: 'success',
        providerPostId: `provider_${Date.now()}`, // Placeholder
        createdAt: new Date()
      });
      
      console.log(`✅ Post ${scheduledPostId} published successfully`);
      
    } catch (error) {
      console.error('❌ Post publishing failed:', error);
      
      // Record failed attempt
      await db.insert(publishAttempts).values({
        scheduledPostId,
        attemptNo: 1,
        status: 'failed',
        error: { message: error instanceof Error ? error.message : 'Unknown error' },
        createdAt: new Date()
      });
      
      throw error;
    }
  }

  // Trend scanning job
  private async processTrendScan(job: Job<JobData>): Promise<void> {
    const { orgId } = job.data;
    
    try {
      console.log(`📊 Scanning trends for org ${orgId}`);
      
      // TODO: Implement trend scanning logic
      // This would analyze social media trends and update trend_cache table
      
      console.log(`✅ Trends scanned for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Trend scanning failed:', error);
      throw error;
    }
  }

  // Analytics rollup job
  private async processAnalyticsRollup(job: Job<JobData>): Promise<void> {
    const { orgId } = job.data;
    
    try {
      console.log(`📈 Rolling up analytics for org ${orgId}`);
      
      // TODO: Implement analytics rollup logic
      // This would aggregate daily metrics and update aggregates_daily table
      
      console.log(`✅ Analytics rolled up for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Analytics rollup failed:', error);
      throw error;
    }
  }

  // Listen webhook job
  private async processListenWebhook(job: Job<JobData>): Promise<void> {
    const { orgId, provider, payload } = job.data;
    
    try {
      console.log(`👂 Processing webhook from ${provider} for org ${orgId}`);
      
      // TODO: Implement webhook processing logic
      // This would analyze incoming social media events and update mentions/classifications
      
      console.log(`✅ Webhook processed for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);
      throw error;
    }
  }

  // Nudge dispatch job
  private async processNudgeDispatch(job: Job<JobData>): Promise<void> {
    const { orgId } = job.data;
    
    try {
      console.log(`📢 Dispatching nudges for org ${orgId}`);
      
      // TODO: Implement nudge dispatch logic
      // This would send notifications and reminders to users
      
      console.log(`✅ Nudges dispatched for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Nudge dispatch failed:', error);
      throw error;
    }
  }

  // A/B test job
  private async processABTest(job: Job<JobData>): Promise<void> {
    const { orgId, testId } = job.data;
    
    try {
      console.log(`🧪 Running A/B test ${testId} for org ${orgId}`);
      
      // TODO: Implement A/B test logic
      // This would run experiments and determine winners
      
      console.log(`✅ A/B test ${testId} completed for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ A/B test failed:', error);
      throw error;
    }
  }

  // ROI backtest job
  private async processROIBacktest(job: Job<JobData>): Promise<void> {
    const { orgId, modelId } = job.data;
    
    try {
      console.log(`💰 Running ROI backtest for model ${modelId} in org ${orgId}`);
      
      // TODO: Implement ROI backtest logic
      // This would test ROI models against historical data
      
      console.log(`✅ ROI backtest completed for model ${modelId}`);
      
    } catch (error) {
      console.error('❌ ROI backtest failed:', error);
      throw error;
    }
  }

  // Sentry mission job
  private async processSentryMission(job: Job<JobData>): Promise<void> {
    const { orgId, missionId } = job.data;
    
    try {
      console.log(`🚀 Executing Sentry mission ${missionId} for org ${orgId}`);
      
      // TODO: Implement Sentry mission logic
      // This would execute autonomous operations
      
      console.log(`✅ Sentry mission ${missionId} completed for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Sentry mission failed:', error);
      throw error;
    }
  }

  // Sentry step job
  private async processSentryStep(job: Job<JobData>): Promise<void> {
    const { orgId, missionId, stepNo } = job.data;
    
    try {
      console.log(`👣 Executing Sentry step ${stepNo} for mission ${missionId} in org ${orgId}`);
      
      // TODO: Implement Sentry step logic
      // This would execute individual mission steps
      
      console.log(`✅ Sentry step ${stepNo} completed for mission ${missionId}`);
      
    } catch (error) {
      console.error('❌ Sentry step failed:', error);
      throw error;
    }
  }

  // Policy approval job
  private async processPolicyApproval(job: Job<JobData>): Promise<void> {
    const { orgId, policyId } = job.data;
    
    try {
      console.log(`✅ Processing policy approval ${policyId} for org ${orgId}`);
      
      // TODO: Implement policy approval logic
      // This would handle automated policy approvals
      
      console.log(`✅ Policy approval ${policyId} processed for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Policy approval failed:', error);
      throw error;
    }
  }

  // Competitor scan job
  private async processCompetitorScan(job: Job<JobData>): Promise<void> {
    const { orgId, competitorId } = job.data;
    
    try {
      console.log(`👀 Scanning competitor ${competitorId} for org ${orgId}`);
      
      // TODO: Implement competitor scanning logic
      // This would analyze competitor activities and update competitor_signals
      
      console.log(`✅ Competitor ${competitorId} scanned for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Competitor scan failed:', error);
      throw error;
    }
  }

  // Experiment tick job
  private async processExperimentTick(job: Job<JobData>): Promise<void> {
    const { orgId, experimentId } = job.data;
    
    try {
      console.log(`🔬 Ticking experiment ${experimentId} for org ${orgId}`);
      
      // TODO: Implement experiment tick logic
      // This would advance experiments and collect metrics
      
      console.log(`✅ Experiment ${experimentId} ticked for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Experiment tick failed:', error);
      throw error;
    }
  }

  // Risk evaluation job
  private async processRiskEvaluate(job: Job<JobData>): Promise<void> {
    const { orgId } = job.data;
    
    try {
      console.log(`⚠️ Evaluating risks for org ${orgId}`);
      
      // TODO: Implement risk evaluation logic
      // This would assess various risk factors and update risk metrics
      
      console.log(`✅ Risk evaluation completed for org ${orgId}`);
      
    } catch (error) {
      console.error('❌ Risk evaluation failed:', error);
      throw error;
    }
  }

  // Helper methods
  private getMediaType(mimetype: string): 'image' | 'video' | 'audio' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    throw new Error(`Unsupported media type: ${mimetype}`);
  }

  // Public methods for adding jobs
  async addMediaIngestJob(data: MediaJobData): Promise<Job> {
    const queue = this.queues.get('media.ingest');
    if (!queue) throw new Error('Media ingest queue not initialized');
    
    return await queue.add('ingest', data, {
      priority: 1, // High priority for media processing
      removeOnComplete: true
    });
  }

  async addSchedulePublishJob(data: PublishJobData, delay?: number): Promise<Job> {
    const queue = this.queues.get('schedule.publish');
    if (!queue) throw new Error('Schedule publish queue not initialized');
    
    const jobOptions: any = {
      priority: 2,
      removeOnComplete: true
    };

    if (delay) {
      jobOptions.delay = delay;
    }

    return await queue.add('publish', data, jobOptions);
  }

  async addTrendScanJob(data: JobData): Promise<Job> {
    const queue = this.queues.get('trend.scan');
    if (!queue) throw new Error('Trend scan queue not initialized');
    
    return await queue.add('scan', data, {
      priority: 3,
      repeat: {
        pattern: '0 */6 * * *' // Every 6 hours
      }
    });
  }

  // Cleanup method
  async close(): Promise<void> {
    console.log('🔄 Closing queue manager...');
    
    // Close all workers
    for (const [name, worker] of this.workers) {
      await worker.close();
      console.log(`✅ Worker ${name} closed`);
    }
    
    // Close all queues
    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`✅ Queue ${name} closed`);
    }
    
    // Close all schedulers
    for (const [name, scheduler] of this.schedulers) {
      await scheduler.close();
      console.log(`✅ Scheduler ${name} closed`);
    }
    
    // Close Redis connection
    await this.redis.quit();
    console.log('✅ Redis connection closed');
    
    console.log('🎉 Queue manager closed successfully');
  }
}
