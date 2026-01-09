import OpenAI from 'openai';
import { 
  AudioTranscription, 
  VoiceCommand, 
  VoiceCommandResponse, 
  AudioAnalysis,
  VoiceProcessingOptions,
  SentimentAnalysis,
  TranscriptionSegment
} from './types';

export class VoiceProcessor {
  private openai: OpenAI;
  private defaultOptions: VoiceProcessingOptions;

  constructor(openaiApiKey: string, options: VoiceProcessingOptions = {}) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.defaultOptions = {
      language: 'en',
      model: 'whisper-1',
      temperature: 0.3,
      maxTokens: 1000,
      includeConfidence: true,
      includeSegments: true,
      includeSentiment: true,
      includeKeywords: true,
      ...options
    };
  }

  async transcribeAudio(
    audioBuffer: Buffer, 
    options: VoiceProcessingOptions = {}
  ): Promise<AudioTranscription> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Transcribe audio using OpenAI Whisper
      const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
      const transcription = await this.openai.audio.transcriptions.create({
        file,
        model: opts.model || 'whisper-1',
        language: opts.language,
        response_format: 'verbose_json',
        temperature: opts.temperature
      });

      // Parse the response
      const response = transcription as any;
      
      // Create segments from the verbose response
      const segments: TranscriptionSegment[] = response.segments?.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text,
        confidence: seg.avg_logprob || 0.9,
        speaker: seg.speaker
      })) || [];

      // Calculate word count
      const wordCount = response.text.split(/\s+/).length;

      // Analyze sentiment and extract keywords if requested
      let sentiment: SentimentAnalysis | undefined;
      let keywords: string[] = [];

      if (opts.includeSentiment || opts.includeKeywords) {
        const analysis = await this.analyzeTranscription(response.text, opts);
        sentiment = analysis.sentiment;
        keywords = analysis.keywords;
      }

      return {
        text: response.text,
        language: response.language || opts.language || 'en',
        confidence: response.avg_logprob ? Math.exp(response.avg_logprob) : 0.9,
        segments,
        duration: response.duration || 0,
        wordCount,
        sentiment,
        keywords,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw new Error(`Audio transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processVoiceCommand(
    command: VoiceCommand,
    context?: string
  ): Promise<VoiceCommandResponse> {
    try {
      // First, transcribe the audio
      const transcription = await this.transcribeAudio(command.audio, {
        language: command.language,
        includeSentiment: true,
        includeKeywords: true
      });

      // Analyze the transcribed command for intent and entities
      const analysis = await this.analyzeCommand(transcription.text, context);

      // Generate a response using GPT
      const response = await this.generateVoiceResponse(transcription.text, analysis, context);

      return {
        command: transcription.text,
        intent: analysis.intent,
        confidence: transcription.confidence * analysis.confidence,
        entities: analysis.entities,
        response: response.text,
        audioUrl: response.audioUrl
      };

    } catch (error) {
      console.error('Voice command processing failed:', error);
      throw new Error(`Voice command processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSpeech(
    text: string,
    voice: string = 'alloy',
    format: 'mp3' | 'wav' | 'flac' | 'aac' = 'mp3'
  ): Promise<Buffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice as any,
        input: text,
        response_format: format
      });

      // Convert the response to a buffer
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);

    } catch (error) {
      console.error('Speech generation failed:', error);
      throw new Error(`Speech generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeAudio(
    audioBuffer: Buffer,
    options: VoiceProcessingOptions = {}
  ): Promise<AudioAnalysis> {
    try {
      // Get basic audio metadata (this would need a proper audio library in production)
      const metadata = await this.extractAudioMetadata(audioBuffer);
      
      // Transcribe if requested
      let transcription: AudioTranscription | undefined;
      if (options.includeConfidence !== false) {
        transcription = await this.transcribeAudio(audioBuffer, options);
      }

      return {
        duration: metadata.duration,
        format: metadata.format,
        sampleRate: metadata.sampleRate,
        channels: metadata.channels,
        bitrate: metadata.bitrate,
        quality: metadata.quality,
        transcription
      };

    } catch (error) {
      console.error('Audio analysis failed:', error);
      throw new Error(`Audio analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async analyzeTranscription(
    text: string, 
    options: VoiceProcessingOptions
  ): Promise<{ sentiment: SentimentAnalysis; keywords: string[] }> {
    try {
      const prompt = `Analyze the following text and provide:
1. Overall sentiment (positive/negative/neutral) with confidence score
2. Top 3 emotions with scores
3. Top 5 topics with scores
4. Top 10 keywords

Text: "${text}"

Respond in JSON format:
{
  "sentiment": {
    "overall": "positive|negative|neutral",
    "confidence": 0.95,
    "emotions": [{"emotion": "joy", "score": 0.8}],
    "topics": [{"topic": "business", "score": 0.9}]
  },
  "keywords": ["keyword1", "keyword2"]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing text sentiment, emotions, topics, and extracting keywords. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for sentiment analysis');
      }

      const analysis = JSON.parse(content);
      
      return {
        sentiment: analysis.sentiment,
        keywords: analysis.keywords || []
      };

    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      // Return default values on failure
      return {
        sentiment: {
          overall: 'neutral',
          confidence: 0.5,
          emotions: [],
          topics: []
        },
        keywords: []
      };
    }
  }

  private async analyzeCommand(
    text: string, 
    context?: string
  ): Promise<{ intent: string; confidence: number; entities: any[] }> {
    try {
      const prompt = `Analyze this voice command and determine:
1. The intent (what the user wants to do)
2. Confidence level (0-1)
3. Any entities mentioned (people, places, dates, etc.)

Command: "${text}"
Context: ${context || 'General social media management'}

Common intents: schedule_post, analyze_content, check_analytics, create_campaign, manage_reviews, etc.

Respond in JSON:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": [{"type": "person", "value": "John", "confidence": 0.9}]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at understanding voice commands for social media management. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT for command analysis');
      }

      const analysis = JSON.parse(content);
      
      return {
        intent: analysis.intent || 'unknown',
        confidence: analysis.confidence || 0.5,
        entities: analysis.entities || []
      };

    } catch (error) {
      console.error('Command analysis failed:', error);
      return {
        intent: 'unknown',
        confidence: 0.5,
        entities: []
      };
    }
  }

  private async generateVoiceResponse(
    command: string,
    analysis: { intent: string; confidence: number; entities: any[] },
    context?: string
  ): Promise<{ text: string; audioUrl?: string }> {
    try {
      const prompt = `Generate a helpful, conversational response to this voice command:

Command: "${command}"
Intent: ${analysis.intent}
Context: ${context || 'Social media management platform'}

The response should be:
- Helpful and actionable
- Conversational and friendly
- Under 50 words
- Include next steps or confirmation

Examples:
- "I'll schedule that post for tomorrow at 2 PM. Would you like me to create a caption too?"
- "I found 3 mentions of your brand today. The sentiment is mostly positive."
- "Your Instagram post is performing well with 15% engagement. Should I boost it?"`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for social media management. Provide friendly, actionable responses to voice commands.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      const text = completion.choices[0].message.content || 'I understand your request. Let me help you with that.';

      return { text };

    } catch (error) {
      console.error('Response generation failed:', error);
      return { 
        text: 'I understand your request. Let me help you with that.' 
      };
    }
  }

  private async extractAudioMetadata(audioBuffer: Buffer): Promise<{
    duration: number;
    format: string;
    sampleRate: number;
    channels: number;
    bitrate: number;
    quality: 'low' | 'medium' | 'high';
  }> {
    // This is a simplified metadata extraction
    // In production, you'd use a proper audio library like ffprobe
    
    // Estimate duration based on buffer size (rough approximation)
    const estimatedDuration = audioBuffer.length / 16000; // Assuming 16kHz, 16-bit audio
    
    return {
      duration: estimatedDuration,
      format: 'unknown',
      sampleRate: 16000,
      channels: 1,
      bitrate: 256000,
      quality: 'medium'
    };
  }
}
