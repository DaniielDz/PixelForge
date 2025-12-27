import { JobRepository } from '../repositories/job.repository.js';
import { uploadFile, getFileUrl, minioClient } from './minioClient.js';
import { addImageProcessingJob } from './queueService.js';
import { env } from '../../config/index.js';
import { CreateJobInput, JobPayload } from '../../shared/schemas/job.js';
import { CreateJobRepositoryDTO, JobEntity } from '../types/job.types.js';

export interface JobCreateData extends CreateJobInput {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  originalFileName: string;
  mimeType: string;
  rawFileUrl: string;
}

const mapJobToPayload = (job: JobEntity): JobPayload => ({
  jobId: job.id,
  rawFileUrl: job.rawFileUrl,
  targetWidth: job.targetWidth,
  targetHeight: job.targetHeight,
  outputFormat: job.outputFormat,
  originalFileName: job.originalFileName,
  mimeType: job.mimeType,
});

export const JobService = {
  async createAndEnqueue(file: Express.Multer.File, input: CreateJobInput) {
    let job: JobEntity | null = null;
    let objectName: string | null = null;

    try {
      // 1. Crear job en DB
      const repoData: CreateJobRepositoryDTO = {
        status: 'PENDING',
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        rawFileUrl: '',
        targetWidth: input.width,
        targetHeight: input.height,
        outputFormat: input.format,
      };
      job = await JobRepository.create(repoData);
      // 2. Subir a MinIO
      objectName = `raw/${job.id}-${file.originalname}`;
      await uploadFile(env.S3_BUCKET_NAME, objectName, file.buffer, file.size);
      const rawFileUrl = await getFileUrl(env.S3_BUCKET_NAME, objectName);
      // 3. Actualizar URL
      const updatedJob = await JobRepository.updateUrl(job.id, rawFileUrl);
      // 4. Encolar job
      await addImageProcessingJob(mapJobToPayload(updatedJob));
      return updatedJob;
    } catch (error) {
      // Rollback: eliminar archivo de MinIO si fue subido
      if (objectName) {
        try {
          await minioClient.removeObject(env.S3_BUCKET_NAME, objectName);
        } catch (cleanupError) {
          console.error('Failed to cleanup MinIO object:', cleanupError);
        }
      }

      // Rollback: marcar job como FAILED si fue creado
      if (job) {
        try {
          await JobRepository.updateStatus(job.id, 'FAILED');
        } catch (cleanupError) {
          console.error('Failed to update job status:', cleanupError);
        }
      }

      throw error;
    }
  },
};
