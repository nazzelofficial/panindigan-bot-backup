// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { loggers } from '../../utils/Logger.js';
import config from '../../../config.json' with { type: 'json' };
let prisma = null;
/**
 * Initialize the Prisma client and await the database connection.
 * Must be called (and awaited) once during bot startup before any queries.
 * Throws on connection failure so the startup sequence fails fast and deterministically.
 */
export async function initializePrisma() {
    if (prisma)
        return; // Already initialized
    // In Prisma 7, a driver adapter is required for direct database connections.
    const postgresUrl = process.env[config.databases.postgresql.urlEnv];
    if (!postgresUrl) {
        throw new Error(`PostgreSQL URL not found in environment variable: ${config.databases.postgresql.urlEnv}`);
    }
    // Strip any sslmode params from the URL that might conflict with our ssl config,
    // then create the pool with explicit SSL settings that bypass cert verification.
    let cleanUrl = postgresUrl;
    try {
        const u = new URL(postgresUrl);
        u.searchParams.delete('sslmode');
        u.searchParams.delete('ssl');
        u.searchParams.delete('sslcert');
        u.searchParams.delete('sslkey');
        u.searchParams.delete('sslrootcert');
        cleanUrl = u.toString();
    }
    catch { /* URL parse failed — use original */ }
    const pool = new pg.Pool({
        connectionString: cleanUrl,
        ssl: {
            rejectUnauthorized: false,
            // Bypass hostname/cert chain verification for self-signed certs
            checkServerIdentity: () => undefined,
        },
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    try {
        await prisma.$connect();
        loggers.postgresql.info('PostgreSQL connected successfully');
    }
    catch (error) {
        prisma = null; // Reset so initialization can be retried
        loggers.postgresql.error('PostgreSQL connection failed', {
            errorMessage: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    }
}
/**
 * Returns the initialized PrismaClient.
 * Throws if initializePrisma() has not been called yet.
 */
export function getPrismaClient() {
    if (!prisma) {
        throw new Error('PrismaClient is not initialized. Call initializePrisma() during startup before using the database.');
    }
    return prisma;
}
export async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
        loggers.postgresql.info('PostgreSQL disconnected');
    }
}
export function isPrismaConnected() {
    return prisma !== null;
}
