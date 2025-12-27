import dotenv from 'dotenv';
import { envSchema } from './env.schema.js';

// 1. Cargar el archivo .env en process.env
dotenv.config();

// 2. Validar process.env contra el schema
// Si falla, lanza error y detiene la app inmediatamente
const env = envSchema.parse(process.env);

// 3. Exportar la config estructurada
export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  postgres: {
    url: env.DATABASE_URL,
  },
  minio: {
    endPoint: env.S3_ENDPOINT,
    port: env.S3_PORT,
    useSSL: env.S3_USE_SSL,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    bucket: env.S3_BUCKET_NAME,
    region: env.S3_REGION,
  },
};

export { env };
