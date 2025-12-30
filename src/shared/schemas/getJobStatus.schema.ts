import { z } from 'zod';

export const getJobStatusSchema = z.object({
  params: z.object({
    id: z.cuid('Invalid job ID format'),
  }),
});

export type GetJobStatusParams = z.infer<typeof getJobStatusSchema>['params'];
