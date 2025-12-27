import { z } from 'zod';

export const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // Base de Datos
  DATABASE_URL: z.url(),

  // Minio / S3
  S3_ENDPOINT: z.string().default('localhost'),
  S3_PORT: z.coerce.number().default(9000),
  S3_USE_SSL: z
    .string()
    .transform((val) => val === 'true')
    .default(false),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET_NAME: z.string().default('pixelforge-bucket'),
  S3_REGION: z.string().default('us-east-1'),
});

export type EnvConfig = z.infer<typeof envSchema>;
