import express from 'express';
import { apiRouter } from './routes/index.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.use('/api/v1', apiRouter);

export { app };
