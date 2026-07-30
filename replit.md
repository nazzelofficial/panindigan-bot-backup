# Panindigan Discord Bot

An all-in-one Discord bot for Filipino communities. Built with TypeScript, Discord.js v14, Prisma (PostgreSQL), MongoDB, Redis, and Lavalink for music.

## How to run

The workflow **Start application** runs `pnpm dev` which starts the bot in development mode via `tsx src/bot/index.ts`.

After making code changes, restart the **Start application** workflow.

## Health & monitoring endpoints

The bot exposes a full enterprise health server (default port `3000`, configurable via `PORT`):

| Endpoint | Description | Auth Required |
|---|---|---|
| `GET /` | HTML index with all endpoint docs | No |
| `GET /health` | Overall status — `200` healthy, `503` degraded/down | No |
| `GET /health/live` | Liveness probe — process alive + event loop responsive | No |
| `GET /health/ready` | Readiness probe — all critical deps ready | No |
| `GET /metrics` | Prometheus-compatible metrics text | Optional |
| `GET /version` | Version, git commit, git branch, build timestamp | No |
| `GET /status` | Full dependency status (Discord, DB, Redis, Lavalink) | Optional |
| `GET /info` | Full runtime info (memory, CPU, gauges, counters) | Optional |
| `GET /startup` | Boot state and provider detection | No |

**Monitoring compatibility:** UptimeRobot, Better Stack, Cronitor, Pingdom, StatusCake, Freshping, Uptime Kuma, Healthchecks.io, Grafana, Prometheus, Datadog, New Relic, Zabbix, Nagios, and any HTTP monitoring tool.

**Security:** Set `HEALTH_AUTH_TOKEN` to require `Authorization: Bearer <token>` or `X-Health-Key: <token>` on sensitive endpoints. Set `HEALTH_ALLOWED_IPS` (comma-separated) to restrict by IP.

## Required secrets (set via Replit Secrets)

| Secret | Description |
|---|---|
| `DISCORD_TOKEN` | Discord bot token |
| `DISCORD_CLIENT_ID` | Discord application client ID |
| `POSTGRES_URL` | PostgreSQL connection string |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `SESSION_SECRET` | Session secret |

## Optional secrets

| Secret | Description |
|---|---|
| `OPENAI_API_KEY` | For AI commands (ChatGPT, DALL-E) |
| `ANTHROPIC_API_KEY` | For Claude AI commands |
| `GEMINI_API_KEY` | For Gemini AI commands |
| `GROQ_API_KEY` | For Groq AI commands |
| `LAVALINK_HOST` / `LAVALINK_PORT` / `LAVALINK_PASSWORD` | For music commands |
| `LOG_WEBHOOK_URL` | Discord webhook for error forwarding |
| `TOPGG_TOKEN` | Bot listing on top.gg |
| `HEALTH_AUTH_TOKEN` | Token to protect `/metrics`, `/status`, `/info` endpoints |
| `HEALTH_ALLOWED_IPS` | Comma-separated IPs allowed without auth token |

## Health / monitoring env vars

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP health server port |
| `HOST` | `0.0.0.0` | HTTP health server bind address |
| `HEALTH_CHECK_INTERVAL_MS` | `30000` | How often dependency checks run |
| `HEALTH_CACHE_MS` | `15000` | Health check result cache duration |
| `HEALTH_AUTH_TOKEN` | — | Optional auth token for sensitive endpoints |
| `HEALTH_ALLOWED_IPS` | — | Optional IP allowlist |
| `LOG_LEVEL` | `info` | Log level (trace/debug/info/warn/error/fatal) |
| `LOG_FORMAT` | — | Set to `json` to output structured JSON logs |
| `LOG_WEBHOOK_URL` | — | Discord webhook for error/warn forwarding |
| `LOG_WEBHOOK_LEVEL` | `error` | Minimum level forwarded to webhook |
| `SHUTDOWN_TIMEOUT_MS` | `15000` | Max time for graceful shutdown before forced exit |
| `MUSIC_INACTIVITY_TIMEOUT_MS` | `300000` | Music player inactivity timeout |

## Setup notes

- Run `pnpm prisma:generate` after any schema changes in `prisma/schema.prisma`
- Run `pnpm prisma:migrate` to apply schema migrations to the database
- Lavalink must be running separately for music features to work (`LAVALINK_HOST` required)
- Music works without Lavalink but all music commands will be unavailable

## Project structure

```
src/
├── bot/           # Entry points (index.ts = single, shard.ts = sharded)
├── commands/      # Slash and prefix commands by category (~700+ commands)
├── constants/     # Design system, colors
├── database/      # PostgreSQL (Prisma), MongoDB, and Redis clients
├── events/        # Discord.js event handlers
├── features/      # Feature modules (economy, leveling, etc.)
├── handlers/      # Command and event loaders
├── health/        # Enterprise health monitoring system
│   ├── HealthServer.ts      # HTTP server with all endpoints
│   ├── HealthChecker.ts     # Dependency health checks
│   ├── MetricsCollector.ts  # Prometheus-compatible metrics
│   ├── HostingDetector.ts   # Auto-detect runtime environment
│   └── GracefulShutdown.ts  # SIGINT/SIGTERM/SIGHUP handlers
├── locales/       # i18n strings (en, fil)
├── services/      # Shared services (AI, music, lyrics)
├── structures/    # Base classes (PanindiganClient, BaseCommand, etc.)
└── utils/         # Logger, Banner, helpers
```

## Hosting / deployment

The app auto-detects its hosting environment (Replit, Railway, Render, Koyeb, Fly.io, Docker, Kubernetes, AWS, Azure, GCP, and generic Linux/Windows VPS) and reports it at `/info`. No code changes needed across environments.

## User preferences

- Keep the existing project structure — do not restructure or migrate unless explicitly asked.
