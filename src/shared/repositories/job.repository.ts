import { prisma } from '../prismaClient.js';
import { JobEntity, CreateJobRepositoryDTO } from '../../api/types/job.types.js';

export const JobRepository = {
  async create(data: CreateJobRepositoryDTO): Promise<JobEntity> {
    const job = await prisma.job.create({ data });

    return job as JobEntity;
  },

  async updateUrl(id: string, url: string): Promise<JobEntity> {
    const job = await prisma.job.update({
      where: { id },
      data: { rawFileUrl: url },
    });
    return job as JobEntity;
  },

  async updateStatus(id: string, status: JobEntity['status']): Promise<JobEntity> {
    const job = await prisma.job.update({
      where: { id },
      data: { status },
    });
    return job as JobEntity;
  },

  async markAsCompleted(id: string, url: string): Promise<JobEntity> {
    const job = await prisma.job.update({
      where: { id },
      data: { processedFileUrl: url, status: 'COMPLETED' },
    });
    return job as JobEntity;
  },

  async markAsFailed(id: string, errorMessage: string): Promise<JobEntity> {
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'FAILED', errorMessage },
    });
    return job as JobEntity;
  },
};
