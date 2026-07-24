import { PrismaClient } from '@prisma/client';
import config from '../../../config.json';

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const postgresUrl = process.env[config.databases.postgresql.urlEnv];
    
    if (!postgresUrl) {
      throw new Error(`PostgreSQL URL not found in environment variable: ${config.databases.postgresql.urlEnv}`);
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    prisma.$connect()
      .then(() => console.log('✅ PostgreSQL connected successfully'))
      .catch((error) => {
        console.error('❌ PostgreSQL connection failed:', error);
        throw error;
      });
  }

  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    console.log('🔌 PostgreSQL disconnected');
  }
}

export function isPrismaConnected(): boolean {
  return prisma !== null;
}
