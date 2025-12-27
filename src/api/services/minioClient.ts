import { Client } from 'minio';
import { Readable } from 'stream';
import { env } from '../../config/index.js';

/**
 * MinIO Client Singleton
 * Configured to interact with S3-compatible storage
 */
export const minioClient = new Client({
  endPoint: env.S3_ENDPOINT,
  port: env.S3_PORT,
  useSSL: env.S3_USE_SSL,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
  region: env.S3_REGION,
});

/**
 * Upload a file to MinIO
 * @param bucketName - Name of the bucket
 * @param objectName - Name/path of the object in the bucket
 * @param stream - Readable stream or Buffer
 * @param size - Size of the file in bytes
 * @param metadata - Optional metadata
 */
export async function uploadFile(
  bucketName: string,
  objectName: string,
  stream: Buffer | Readable,
  size: number,
  metadata?: Record<string, string>,
): Promise<void> {
  await minioClient.putObject(bucketName, objectName, stream, size, metadata);
}

/**
 * Generate a file URL for MinIO object
 * Note: This generates the internal URL format
 * @param bucketName - Name of the bucket
 * @param objectName - Name/path of the object
 */
export async function getFileUrl(bucketName: string, objectName: string): Promise<string> {
  // Para desarrollo local
  if (env.NODE_ENV === 'development') {
    const protocol = env.S3_USE_SSL ? 'https' : 'http';
    return `${protocol}://${env.S3_ENDPOINT}:${env.S3_PORT}/${bucketName}/${objectName}`;
  }

  return await minioClient.presignedGetObject(bucketName, objectName, 24 * 60 * 60);
}
