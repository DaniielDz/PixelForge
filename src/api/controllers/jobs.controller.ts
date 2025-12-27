import type { Request, Response } from 'express';
import { CreateJobInput } from '../../shared/schemas/index.js';
import { JobService } from '../services/jobs.service.js';

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
