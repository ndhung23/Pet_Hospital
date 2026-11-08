const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`[Database] PostgreSQL connection established successfully.`);
  } catch (err) {
    console.error(`[Database] Failed to connect to PostgreSQL:`, err.message);
  }
  console.log(`[Server] PHMS Backend is running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing HTTP server...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    await prisma.$disconnect();
    console.log('[Database] Prisma disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
