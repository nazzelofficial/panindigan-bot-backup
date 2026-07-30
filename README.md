# Panindigan

An all-in-one Discord bot built for Filipino communities. Written in TypeScript with Discord.js v14, Prisma (PostgreSQL), MongoDB, Redis, and Lavalink for audio.

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.4-orange)](CHANGELOG.md)

---

## Features

| Category | Slash Command | Sub-command Groups / Sub-commands | Notes |
|---|---|---|---|
| Help | `/help` | `command`, `category`, `list`, `search` | Interactive menus with back-navigation |
| Moderation | `/moderation` | `user` · `channel` · `role` · `message` · `info` · `advanced` | Warnings, bans, mutes, automod |
| Admin / Setup | `/admin`, `/setup` | — | Server configuration |
| Music | `/music` | `player` · `queue` · `filter` · `voice` · `playlist` · `search` | Lavalink; YouTube, Spotify, SoundCloud, Apple Music, Deezer, Tidal |
| Economy | `/economy` | `currency` · `income` · `shop` · `gambling` · `business` | ₱ Piso currency, shops, trading, bank |
| Games | `/games` | `2player` · `single` · `casino` · `trivia` · `rpg` | Server activities and minigames |
| Fun | `/fun` | `humor` · `animals` · `fortune` · `social` · `utility` | Jokes, memes, magic 8-ball, animals |
| AI | `/ai` | `chat` · `generate` · `analyze` · `utility` · `code` · `vision` · `security` | OpenAI, Anthropic, Gemini, Groq |
| Info | `/info` | `user` · `server` · `role` · `channel` · `avatar` · `banner` | User & server info with link buttons |
| Utility | `/utility` | — | General tools |
| Social | `/social` | — | Social interaction commands |
| Leveling | `/leveling` | — | XP, roles, voice XP |
| Giveaway | `/giveaway` | — | Giveaway management |
| Image | `/image` | — | Image generation and manipulation |
| Starboard | `/starboard` | — | Starboard tracking |
| Applications | `/applications` | — | Application management |
| Premium | `/premium` | — | Tier-gated commands |
| Owner | `/owner` | — | Bot owner utilities (owner only) |

**Languages supported:** English (`en`), Filipino (`fil`)

**Premium tiers (lifetime, one-time):** Free → Bronze (₱49) → Silver (₱99) → Gold (₱199) → Diamond (₱399)

---

## Requirements

- Node.js v24.x+
- pnpm v11.15.1+
- PostgreSQL v16.x+
- MongoDB v7.x+
- Redis v7.x+
- Lavalink v4.x (required for music)
- A Discord application with a bot token

---

## Setup

### 1. Clone and install

```sh
git clone https://github.com/nazzelofficial/panindigan-bot.git
cd panindigan-bot
pnpm install
```

### 2. Configure environment

Set the required and optional secrets listed below, either via a local `.env` file (copy `.env.example` to `.env` and fill it in) or via your hosting provider's environment/secrets manager.

## How to run

If you're using a hosting workflow, the **Start application** workflow runs `pnpm dev`, which starts the bot in development mode via `tsx src/bot/index.ts`.

After making code changes, restart the **Start application** workflow (or your dev process).

**Manual dev/production commands:**

```sh
pnpm dev             # development (tsx, no build step)
pnpm build           # compile for production
pnpm start           # production, single instance
pnpm shard           # production, with Discord sharding (recommended for large bots)
```

**With PM2:**

```sh
pnpm pm2:start
pnpm pm2:logs
```

### Database setup

```sh
pnpm prisma:generate   # after any schema changes in prisma/schema.prisma
pnpm prisma:migrate    # apply schema migrations
```

### Lavalink

Lavalink must be running separately for music features to work (`LAVALINK_HOST` required). Music works without Lavalink, but all music commands will be unavailable.

---

## Required secrets

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

---

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

### Health / monitoring env vars

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

---

## Logging

The bot uses Winston with daily log rotation. Logs are written to `./logs/`:

- `combined-YYYY-MM-DD.log` — all levels
- `error-YYYY-MM-DD.log` — errors only
- `info-YYYY-MM-DD.log` — info and above
- `shards/shard-N-YYYY-MM-DD.log` — per-shard logs

Set `LOG_WEBHOOK_URL` to forward error/warn logs to a Discord webhook (batched every 5 seconds to avoid rate limits). Set `LOG_LEVEL=debug` for verbose output. Set `LOG_FORMAT=json` for structured JSON logs.

---

## Configuration

Most bot behavior is controlled through `config.json` at the root. The main sections:

- **`features`** — toggle music, AI, economy, leveling, moderation on/off
- **`sharding`** — set shard count (`"auto"` lets Discord decide)
- **`presence`** — customize bot status and activity rotation
- **`economy`** — currency name, rewards, cooldowns, tax/interest rates
- **`leveling`** — XP per message, cooldown, voice XP
- **`music`** — default volume, queue limits per tier, source toggles
- **`ai`** — primary provider, fallback chain, model, token limits per tier
- **`moderation`** — automod sensitivity, anti-nuke thresholds, max purge amount
- **`premium`** — tier definitions, trial settings
- **`logging`** — log level, rotation settings

---

## Project structure

```
src/
├── bot/           # Entry points (index.ts = single, shard.ts = sharded)
├── commands/      # Slash and prefix commands by category
├── constants/     # Design system, colors
├── database/      # PostgreSQL (Prisma), MongoDB, and Redis clients
├── events/        # Discord.js event handlers
├── features/      # Feature modules (economy, leveling, etc.)
├── handlers/      # Command and event loaders, error/success handlers
├── health/        # Enterprise health monitoring system
│   ├── HealthServer.ts      # HTTP server with all endpoints
│   ├── HealthChecker.ts     # Dependency health checks
│   ├── MetricsCollector.ts  # Prometheus-compatible metrics
│   ├── HostingDetector.ts   # Auto-detect runtime environment
│   └── GracefulShutdown.ts  # SIGINT/SIGTERM/SIGHUP handlers
├── locales/       # i18n strings (en, fil)
├── services/      # Shared services (AI, music, lyrics)
├── structures/    # Base classes (PanindiganClient, BaseCommand, EmbedManager, ComponentBuilder)
└── utils/         # Logger, Banner, EmojiManager, helpers
```

---

## Design system

All user-facing responses use a shared design language:

- **`EmbedManager`** (`src/structures/EmbedManager.ts`) — 30+ named embed builders (`success`, `error`, `music`, `economy`, `info`, `fun`, `nowPlaying`, etc.). Never create raw `new EmbedBuilder()` in command files; always use `EmbedManager`.
- **`EmojiManager`** (`src/utils/EmojiManager.ts`) — animated emoji registry with automatic Unicode fallback.
- **`ComponentBuilder`** (`src/structures/ComponentBuilder.ts`) — button rows, pagination, music controls, select menus, and the `errorActionRow()` support link included on every error.
- **`ErrorHandler`** (`src/handlers/ErrorHandler.ts`) — structured error messages with What Happened / Why / How to Fix fields, plus a Support Server button on every reply.
- **`DesignSystem`** (`src/constants/DesignSystem.ts`) — colors, tokens, progress bar helpers.

---

## Hosting / deployment

The app auto-detects its hosting environment (Replit, Railway, Render, Koyeb, Fly.io, Docker, Kubernetes, AWS, Azure, GCP, and generic Linux/Windows VPS) and reports it at `/info`. No code changes needed across environments.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write code in TypeScript, match existing patterns
4. Run the linter before committing: `pnpm lint`
5. Open a pull request

If you find a bug, open an issue with reproduction steps and the relevant log output.

---

## Links

- **Discord:** [Support Server](https://discord.gg/panindigan)
- **Issues:** [GitHub Issues](https://github.com/nazzelofficial/panindigan-bot/issues)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## License

MIT — see [LICENSE](LICENSE).

Made by [Nazzel](https://github.com/nazzelofficial).

---

## User preferences

- Keep the existing project structure — do not restructure or migrate unless explicitly asked.
