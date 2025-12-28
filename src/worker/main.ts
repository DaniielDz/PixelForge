import dotenv from 'dotenv';
import { setupWorker } from './worker.setup.js';
dotenv.config();

const main = async () => {
  console.log('🚀 Worker Service starting...');

  const worker = setupWorker();

  console.log(`✅ Worker is listening on queue: ${worker.name}`);

  const shutdown = async () => {
    console.log('🛑 Shutting down worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

main().catch((err) => {
  console.error('🔥 Fatal error in worker:', err);
  process.exit(1);
});
