export interface BannerOptions {
    version: string;
    environment: string;
    nodeVersion: string;
    mode?: 'bot' | 'shard';
    shardCount?: number | 'auto';
}
export declare function printBanner(opts: BannerOptions): void;
//# sourceMappingURL=Banner.d.ts.map