// @ts-nocheck
import { MongoClient, Db, Collection } from 'mongodb';
import { loggers } from '../../utils/Logger.js';
import config from '../../../config.json' with { type: 'json' };

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (mongoClient && mongoDb) {
    return mongoDb;
  }

  const mongoUri = process.env[config.databases.mongodb.uriEnv];

  if (!mongoUri) {
    throw new Error(`MongoDB URI not found in environment variable: ${config.databases.mongodb.uriEnv}`);
  }

  mongoClient = new MongoClient(mongoUri, {
    maxPoolSize: config.databases.mongodb.poolSize,
    connectTimeoutMS: config.databases.mongodb.connectTimeoutMs,
  });

  mongoClient.on('error', (err) => {
    loggers.mongodb.error('MongoDB client error', { errorMessage: err.message, stack: err.stack });
  });

  mongoClient.on('serverClosed', () => {
    loggers.mongodb.warn('MongoDB server connection closed');
  });

  await mongoClient.connect();
  mongoDb = mongoClient.db();

  loggers.mongodb.info('MongoDB connected successfully');

  return mongoDb;
}

export function getMongoDb(): Db {
  if (!mongoDb) {
    throw new Error('MongoDB not initialized. Call connectMongoDB() first.');
  }
  return mongoDb;
}

export function getCollection<T>(name: string): Collection<T> {
  const db = getMongoDb();
  return db.collection<T>(name);
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    loggers.mongodb.info('MongoDB disconnected');
  }
}

export function isMongoConnected(): boolean {
  return mongoClient !== null && mongoDb !== null;
}
