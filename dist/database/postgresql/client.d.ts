import { PrismaClient } from '@prisma/client';
/**
 * Initialize the Prisma client and await the database connection.
 * Must be called (and awaited) once during bot startup before any queries.
 * Throws on connection failure so the startup sequence fails fast and deterministically.
 */
export declare function initializePrisma(): Promise<void>;
/**
 * Returns the initialized PrismaClient.
 * Throws if initializePrisma() has not been called yet.
 */
export declare function getPrismaClient(): PrismaClient;
export declare function disconnectPrisma(): Promise<void>;
export declare function isPrismaConnected(): boolean;
//# sourceMappingURL=client.d.ts.map