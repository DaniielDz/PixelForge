import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { createJobController, getJobStatusController } from '../controllers/jobs.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createJobSchema, getJobStatusSchema } from '../../shared/schemas/index.js';
import { fileRequired } from '../middleware/fileRequired.middleware.js';

export const jobsRouter = Router();

jobsRouter.post(
  '/',
  upload.single('file'),
  fileRequired,
  validate(createJobSchema),
  createJobController,
);

jobsRouter.get('/:id', validate(getJobStatusSchema), getJobStatusController);
