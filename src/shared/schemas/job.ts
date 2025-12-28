import { z } from 'zod';

export const ALLOWED_DIMENSIONS = [
  { width: 256, height: 256 },
  { width: 512, height: 512 },
  { width: 1024, height: 1024 },
  { width: 1920, height: 1080 },
] as const;

export const ALLOWED_FORMATS = ['webp', 'jpeg', 'png', 'avif'] as const;

export const createJobSchema = z.object({
  body: z
    .object({
      width: z.coerce.number().int().positive(),
      height: z.coerce.number().int().positive(),
      format: z.enum(ALLOWED_FORMATS).default('webp'),
    })
    .refine(
      (data) =>
        ALLOWED_DIMENSIONS.some((dim) => dim.width === data.width && dim.height === data.height),
      {
        message: `Invalid dimensions. Allowed: ${ALLOWED_DIMENSIONS.map((d) => `${d.width}x${d.height}`).join(', ')}`,
      },
    ),
});

export const jobPayloadSchema = z.object({
  jobId: z.cuid(),
  rawFileUrl: z.url(),
  objectName: z.string(),
  targetWidth: z.number().int().positive(),
  targetHeight: z.number().int().positive(),
  outputFormat: z.enum(ALLOWED_FORMATS),
  originalFileName: z.string(),
  mimeType: z.string(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type JobPayload = z.infer<typeof jobPayloadSchema>;
