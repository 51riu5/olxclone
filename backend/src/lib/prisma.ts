import { PrismaClient } from '@prisma/client';

// Ensure Prisma has a connection URL even if .env is missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: (process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : []) as any
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}


