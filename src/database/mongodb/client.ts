import { MongoClient, Db, Collection } from 'mongodb';
import config from '../../../config.json';

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

  await mongoClient.connect();
  mongoDb = mongoClient.db();

  console.log('✅ MongoDB connected successfully');
  
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
    console.log('🔌 MongoDB disconnected');
  }
}

export function isMongoConnected(): boolean {
  return mongoClient !== null && mongoDb !== null;
}
