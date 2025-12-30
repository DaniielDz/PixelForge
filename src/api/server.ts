import dotenv from 'dotenv';
dotenv.config();

import { app } from './main.js';
import { prisma } from '../shared/prismaClient.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});

const shutdown = async () => {
  console.log('🛑 SIGTERM signal received: starting graceful shutdown');

  server.close(async () => {
    console.log('✅ HTTP server closed');

    try {
      await prisma.$disconnect();
      console.log('✅ Database connections closed');

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
