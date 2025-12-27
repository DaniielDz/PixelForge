import { Queue } from 'bullmq';
import { env } from '../../config/index.js';
import type { JobPayload } from '../../shared/schemas/index.js';

/**
 * BullMQ Queue for Image Processing
 */
export const imageProcessingQueue = new Queue<JobPayload>('image-processing', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

/**
 * Add an image processing job to the queue
 * @param payload - Job payload with processing details
 * @returns Job ID from BullMQ
 */
export async function addImageProcessingJob(payload: JobPayload): Promise<string> {
  const job = await imageProcessingQueue.add('process-image', payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  return job.id ?? '';
}
