import { existsSync } from 'fs';
export function detectHosting() {
    const env = process.env;
    const platform = process.platform;
    const hostname = process.env.HOSTNAME ?? 'unknown';
    // ── Replit ────────────────────────────────────────────────────────────────
    if (env.REPL_ID || env.REPLIT_DB_URL || env.REPL_OWNER) {
        return build('replit', {
            region: env.REPLIT_CLUSTER,
            instanceId: env.REPL_ID,
            isContainer: true,
        });
    }
    // ── Railway ───────────────────────────────────────────────────────────────
    if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_SERVICE_ID) {
        return build('railway', {
            region: env.RAILWAY_REGION,
            instanceId: env.RAILWAY_SERVICE_ID,
            isContainer: true,
        });
    }
    // ── Render ────────────────────────────────────────────────────────────────
    if (env.RENDER || env.RENDER_SERVICE_ID) {
        return build('render', {
            region: env.RENDER_REGION,
            instanceId: env.RENDER_INSTANCE_ID,
            isContainer: true,
        });
    }
    // ── Koyeb ────────────────────────────────────────────────────────────────
    if (env.KOYEB_INSTANCE_ID || env.KOYEB_SERVICE_NAME) {
        return build('koyeb', {
            region: env.KOYEB_REGION,
            instanceId: env.KOYEB_INSTANCE_ID,
            isContainer: true,
        });
    }
    // ── Fly.io ────────────────────────────────────────────────────────────────
    if (env.FLY_APP_NAME || env.FLY_REGION) {
        return build('fly.io', {
            region: env.FLY_REGION,
            instanceId: env.FLY_ALLOC_ID,
            datacenter: env.FLY_REGION,
            isContainer: true,
        });
    }
    // ── Northflank ────────────────────────────────────────────────────────────
    if (env.NORTHFLANK_APP_ID || env.NF_WORKER_ID) {
        return build('northflank', { isContainer: true });
    }
    // ── DigitalOcean App Platform ─────────────────────────────────────────────
    if (env.DIGITALOCEAN_APP_ID || env.APP_DOMAIN) {
        return build('digitalocean', {
            instanceId: env.DIGITALOCEAN_APP_ID,
            isContainer: true,
        });
    }
    // ── Heroku ────────────────────────────────────────────────────────────────
    if (env.DYNO || env.HEROKU_APP_NAME) {
        return build('heroku', {
            instanceId: env.DYNO,
            isContainer: true,
        });
    }
    // ── GitHub Actions ────────────────────────────────────────────────────────
    if (env.GITHUB_ACTIONS === 'true') {
        return build('github-actions', { isContainer: true, isServerless: true });
    }
    // ── Kubernetes ────────────────────────────────────────────────────────────
    if (env.KUBERNETES_SERVICE_HOST || env.KUBERNETES_PORT) {
        return build('kubernetes', { isContainer: true, isKubernetes: true });
    }
    // ── AWS ───────────────────────────────────────────────────────────────────
    if (env.AWS_EXECUTION_ENV || env.AWS_REGION || env.ECS_CONTAINER_METADATA_URI) {
        return build('aws', {
            region: env.AWS_REGION ?? env.AWS_DEFAULT_REGION,
            instanceId: env.HOSTNAME,
            isContainer: !!(env.ECS_CONTAINER_METADATA_URI),
            isServerless: env.AWS_EXECUTION_ENV?.startsWith('AWS_Lambda') ?? false,
        });
    }
    // ── Azure ─────────────────────────────────────────────────────────────────
    if (env.WEBSITE_SITE_NAME || env.APPSETTING_WEBSITE_SITE_NAME) {
        return build('azure', {
            instanceId: env.WEBSITE_INSTANCE_ID,
            region: env.REGION_NAME,
            isContainer: true,
        });
    }
    // ── GCP ───────────────────────────────────────────────────────────────────
    if (env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || env.K_SERVICE) {
        return build('gcp', {
            region: env.GOOGLE_CLOUD_REGION ?? env.FUNCTION_REGION,
            instanceId: env.GOOGLE_CLOUD_PROJECT,
            isServerless: !!env.K_SERVICE, // Cloud Run
        });
    }
    // ── Docker (fallback — running in container without cloud vendor) ──────────
    if (existsSync('/.dockerenv') || env.container === 'docker') {
        return build('docker', { isContainer: true });
    }
    // ── Windows Server ────────────────────────────────────────────────────────
    if (platform === 'win32') {
        return build('windows-server', {});
    }
    // ── Linux VPS ────────────────────────────────────────────────────────────
    if (platform === 'linux') {
        return build('vps-linux', {});
    }
    return build('unknown', {});
    // ─── Builder ────────────────────────────────────────────────────────────
    function build(provider, opts) {
        return {
            provider,
            environment: env.NODE_ENV ?? 'production',
            platform,
            arch: process.arch,
            nodeVersion: process.version,
            hostname,
            isContainer: false,
            isKubernetes: false,
            isServerless: false,
            ...opts,
        };
    }
}
//# sourceMappingURL=HostingDetector.js.map