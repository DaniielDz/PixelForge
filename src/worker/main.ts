import dotenv from 'dotenv';
import { setupWorker } from './worker.setup.js';
import { prisma } from '../shared/prismaClient.js';
dotenv.config();

const main = async () => {
  console.log('🚀 Worker Service starting...');

  const worker = setupWorker();

  console.log(`✅ Worker is listening on queue: ${worker.name}`);

  const shutdown = async () => {
    console.log('🛑 SIGTERM signal received: starting graceful shutdown');

    try {
      console.log('⏳ Waiting for active jobs to complete...');
      await worker.close();
      console.log('✅ Worker closed, all jobs completed');

      await prisma.$disconnect();
      console.log('✅ Database connections closed');

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

main().catch((err) => {
  console.error('🔥 Fatal error in worker:', err);
  process.exit(1);
});
