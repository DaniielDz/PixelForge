import type { Request, Response } from 'express';
import { CreateJobInput } from '../../shared/schemas/index.js';
import { JobService } from '../services/jobs.service.js';
import { JobRepository } from '../../shared/repositories/job.repository.js';

/**
 * Controller for POST /api/v1/jobs
 * Handles image upload, validation, storage, and job enqueuing
 */
export async function createJobController(req: Request, res: Response): Promise<void> {
  try {
    const { width, height, format } = req.validatedData!.body as CreateJobInput;
    const file = req.file!;

    const job = await JobService.createAndEnqueue(file, {
      width,
      height,
      format,
    });

    res.status(201).json({
      jobId: job.id,
      status: job.status,
      message: 'Job created successfully',
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create job',
    });
  }
}

/**
 * Controller for GET /api/v1/jobs/:id
 * Returns job status and processed file URL if completed
 */
export async function getJobStatusController(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.validatedData!.params as { id: string };

    const jobStatus = await JobService.getJobStatus(id);

    if (!jobStatus) {
      res.status(404).json({
        error: 'Not found',
        message: 'Job not found',
      });
      return;
    }

    res.status(200).json(jobStatus);
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch job status',
    });
  }
}
