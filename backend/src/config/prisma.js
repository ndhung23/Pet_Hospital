const { PrismaClient } = require('@prisma/client');
const env = require('./env');
const prismaFallback = require('./prismaFallback');

let prismaInstance;

if (!env.DATABASE_URL) {
  console.log('[Database] No DATABASE_URL specified. Running with in-memory development mock database.');
  prismaInstance = prismaFallback;
} else {
  try {
    prismaInstance = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  } catch (err) {
    console.warn('[Database] Prisma initialization error, falling back to mock database:', err.message);
    prismaInstance = prismaFallback;
  }
}

module.exports = prismaInstance;
