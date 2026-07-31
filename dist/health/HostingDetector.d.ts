/**
 * ══════════════════════════════════════════════════
 *  Panindigan Hosting Detector
 *  Auto-detects runtime environment from env signals
 * ══════════════════════════════════════════════════
 */
export type HostingProvider = 'replit' | 'railway' | 'render' | 'koyeb' | 'fly.io' | 'northflank' | 'digitalocean' | 'coolify' | 'dokploy' | 'kubernetes' | 'docker' | 'github-actions' | 'aws' | 'azure' | 'gcp' | 'heroku' | 'vps-linux' | 'windows-server' | 'unknown';
export interface HostingInfo {
    provider: HostingProvider;
    environment: string;
    region?: string;
    instanceId?: string;
    datacenter?: string;
    isContainer: boolean;
    isKubernetes: boolean;
    isServerless: boolean;
    platform: NodeJS.Platform;
    arch: string;
    nodeVersion: string;
    hostname: string;
}
export declare function detectHosting(): HostingInfo;
//# sourceMappingURL=HostingDetector.d.ts.map