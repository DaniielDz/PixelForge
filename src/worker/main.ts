import dotenv from 'dotenv';
dotenv.config();

const startWorker = async () => {
  console.log('👷 Worker Service starting...');

  // Aquí iría la conexión a Redis/BullMQ

  // Simulación de proceso vivo
  const heartbeat = setInterval(() => {
    console.log('👷 Worker is alive and waiting for jobs...');
  }, 5000);

  // Manejo de señales para matar el worker limpiamente
  process.on('SIGTERM', async () => {
    console.log('🛑 Worker shutting down...');
    clearInterval(heartbeat);
    // await worker.close(); // Cuando tengas BullMQ
    process.exit(0);
  });
};

startWorker().catch((err) => {
  console.error('🔥 Fatal error in worker:', err);
  process.exit(1);
});
