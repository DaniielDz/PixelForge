import { Job, Worker } from 'bullmq';
import { env } from '../config/index.js';
import { imageProcessor } from './processors/image.processor.js';
import { getFileUrl } from '../shared/services/storage.services.js';
import { JobRepository } from '../shared/repositories/job.repository.js';

export const setupWorker = () => {
  const worker = new Worker('image-processing', imageProcessor, {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
    concurrency: 5,
  });

  worker.on('progress', (job, progress) => {
    console.log(`🔄 Job ${job.id} progress: ${progress}%`);
  });

  worker.on('completed', async (job: Job) => {
    console.log(`🎉 Job ${job.id} completed!`);

    const result = job.returnvalue;

    try {
      const processedUrl = await getFileUrl(env.S3_BUCKET_NAME, result.processedObjectName);
      await JobRepository.markAsCompleted(job.data.jobId, processedUrl);
    } catch (error) {
      console.error('Error updating DB on complete:', error);
    }
  });

  worker.on('failed', async (job, err) => {
    console.error(`🔥 Job ${job?.id} failed:`, err);

    if (job) {
      try {
        await JobRepository.markAsFailed(job.data.jobId, err.message);
      } catch (dbError) {
        console.error('Error updating DB on fail:', dbError);
      }
    }
  });

  return worker;
};
