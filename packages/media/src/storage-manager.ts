import * as Minio from 'minio';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { StorageConfig, UploadResult, MediaMetadata } from './types';

export class StorageManager {
  private config: StorageConfig;
  private minioClient?: Minio.Client;
  private s3Client?: S3;

  constructor(config: StorageConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient(): void {
    if (this.config.provider === 'minio') {
      const endpointUrl = new URL(this.config.endpoint);
      this.minioClient = new Minio.Client({
        endPoint: endpointUrl.hostname,
        port: parseInt(endpointUrl.port) || (this.config.useSSL ? 443 : 9000),
        useSSL: this.config.useSSL ?? false,
        accessKey: this.config.accessKey,
        secretKey: this.config.secretKey
      });
    } else {
      this.s3Client = new S3({
        endpoint: this.config.endpoint,
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
        region: this.config.region || 'us-east-1',
        s3ForcePathStyle: this.config.forcePathStyle ?? true
      });
    }
  }

  async createBucketIfNotExists(): Promise<void> {
    try {
      if (this.minioClient) {
        const exists = await this.minioClient.bucketExists(this.config.bucket);
        if (!exists) {
          await this.minioClient.makeBucket(this.config.bucket, this.config.region || 'us-east-1');
          console.log(`Bucket ${this.config.bucket} created successfully`);
        }
      } else if (this.s3Client) {
        try {
          await this.s3Client.headBucket({ Bucket: this.config.bucket }).promise();
        } catch (err: any) {
          if (err.code === 'NotFound' || err.code === 'NoSuchBucket') {
            await this.s3Client.createBucket({
              Bucket: this.config.bucket,
              CreateBucketConfiguration: {
                LocationConstraint: this.config.region || 'us-east-1'
              }
            }).promise();
            console.log(`Bucket ${this.config.bucket} created successfully`);
          }
        }
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
      // Don't throw - bucket might already exist
    }
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    orgId: string
  ): Promise<UploadResult> {
    const id = uuidv4();
    const extension = filename.split('.').pop() || 'bin';
    const objectName = `${orgId}/${id}.${extension}`;

    try {
      if (this.minioClient) {
        await this.minioClient.putObject(
          this.config.bucket,
          objectName,
          buffer,
          buffer.length,
          { 'Content-Type': mimeType }
        );
      } else if (this.s3Client) {
        await this.s3Client.putObject({
          Bucket: this.config.bucket,
          Key: objectName,
          Body: buffer,
          ContentType: mimeType
        }).promise();
      }

      const uri = `${this.config.provider}://${this.config.bucket}/${objectName}`;
      const publicUrl = this.getPublicUrl(objectName);

      const metadata: MediaMetadata = {
        filename,
        mimeType,
        size: buffer.length,
        format: extension,
        createdAt: new Date()
      };

      return {
        id,
        uri,
        publicUrl,
        metadata
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async download(objectName: string): Promise<Buffer> {
    try {
      if (this.minioClient) {
        const stream = await this.minioClient.getObject(this.config.bucket, objectName);
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
      } else if (this.s3Client) {
        const result = await this.s3Client.getObject({
          Bucket: this.config.bucket,
          Key: objectName
        }).promise();

        return result.Body as Buffer;
      }

      throw new Error('No storage client initialized');
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(objectName: string): Promise<void> {
    try {
      if (this.minioClient) {
        await this.minioClient.removeObject(this.config.bucket, objectName);
      } else if (this.s3Client) {
        await this.s3Client.deleteObject({
          Bucket: this.config.bucket,
          Key: objectName
        }).promise();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(objectName: string): Promise<boolean> {
    try {
      if (this.minioClient) {
        await this.minioClient.statObject(this.config.bucket, objectName);
        return true;
      } else if (this.s3Client) {
        await this.s3Client.headObject({
          Bucket: this.config.bucket,
          Key: objectName
        }).promise();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getSignedUrl(objectName: string, expirySeconds: number = 3600): Promise<string> {
    try {
      if (this.minioClient) {
        return await this.minioClient.presignedGetObject(
          this.config.bucket,
          objectName,
          expirySeconds
        );
      } else if (this.s3Client) {
        return this.s3Client.getSignedUrl('getObject', {
          Bucket: this.config.bucket,
          Key: objectName,
          Expires: expirySeconds
        });
      }

      throw new Error('No storage client initialized');
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPublicUrl(objectName: string): string {
    return `${this.config.endpoint}/${this.config.bucket}/${objectName}`;
  }

  parseUri(uri: string): { bucket: string; key: string } {
    // Parse URI format: s3://bucket/key or minio://bucket/key
    const match = uri.match(/^(?:s3|minio):\/\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid storage URI: ${uri}`);
    }
    return { bucket: match[1], key: match[2] };
  }
}
