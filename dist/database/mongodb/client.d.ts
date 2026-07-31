import { Db, Collection } from 'mongodb';
export declare function connectMongoDB(): Promise<Db>;
export declare function getMongoDb(): Db;
export declare function getCollection<T>(name: string): Collection<T>;
export declare function disconnectMongoDB(): Promise<void>;
export declare function isMongoConnected(): boolean;
//# sourceMappingURL=client.d.ts.map