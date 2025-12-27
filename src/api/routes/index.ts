import { Router } from 'express';
import { jobsRouter } from './jobs.routes.js';

export const apiRouter = Router();

apiRouter.use('/jobs', jobsRouter);
