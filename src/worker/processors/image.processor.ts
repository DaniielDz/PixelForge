import { Job } from 'bullmq';
import { JobPayload } from '../../shared/schemas/job.js';
import { getFile, uploadFile } from '../../shared/services/storage.services.js';
import { env } from '../../config/index.js';
import sharp from 'sharp';

export const imageProcessor = async (job: Job) => {
  const { jobId, objectName, targetWidth, targetHeight, outputFormat } = job.data as JobPayload;

  let currentStep = 'INITIALIZING';

  try {
    currentStep = 'DOWNLOADING';
    const inputStream = await getFile(env.S3_BUCKET_NAME, objectName);

    currentStep = 'PROCESSING';
    const transformStream = sharp()
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat(outputFormat, {
        quality: 80,
      });

    const pipeline = inputStream.pipe(transformStream);

    const processedBuffer = await pipeline.toBuffer();

    currentStep = 'UPLOADING';
    const processedObjectName = `processed/${jobId}.${outputFormat}`;

    await uploadFile(
      env.S3_BUCKET_NAME,
      processedObjectName,
      processedBuffer,
      processedBuffer.length,
      { 'Content-Type': `image/${outputFormat}` },
    );

    return { processedObjectName, format: outputFormat, size: processedBuffer.length };
  } catch (unknownError) {
    const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));

    const enhancedMessage = `[${currentStep}] ${error.message}`;

    console.error(`❌ Job ${jobId} failed at ${currentStep}:`, error);

    throw new Error(enhancedMessage);
  }
};
