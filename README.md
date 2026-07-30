# Panindigan

An all-in-one Discord bot built for Filipino communities. Written in TypeScript with Discord.js v14, Prisma (PostgreSQL), MongoDB, Redis, and Lavalink for audio.

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.1-orange)](CHANGELOG.md)

---

## Features

| Category | Commands | Notes |
|---|---|---|
| Help | ~15 | Command lookup, docs |
| Moderation | ~50 | Warnings, bans, mutes, automod |
| Admin / Setup | ~45 | Server configuration |
| Music | ~60 | Lavalink-backed; supports YouTube, Spotify, SoundCloud, Apple Music, Deezer, Tidal |
| Economy | ~80 | Currency (₱ Piso), shops, trading, bank |
| Games | ~65 | Server activities and minigames |
| Fun | ~68 | Memes, entertainment |
| AI | ~65 | Multi-provider: OpenAI, Anthropic, Gemini, Groq |
| Info | ~48 | Server and user info |
| Utility | ~65 | General tools |
| Social | ~80 | Social interaction commands |
| Leveling | ~25 | XP, roles, voice XP |
| Giveaway | ~22 | Giveaway management |
| Image | ~30 | Image generation and manipulation |
| Starboard | ~12 | Starboard tracking |
| Applications | ~18 | Application management |
| Premium | ~30 | Tier-gated commands |
| Owner | ~122 | Bot owner utilities |

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

```sh
cp .env.example .env
```

Edit `.env`. The required variables are:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
POSTGRES_URL=postgresql://user:pass@host:5432/panindigan
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/panindigan
REDIS_URL=redis://user:pass@host:6379
```

Optional (but needed for specific features):

```env
# AI commands
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=

# Music
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# Error forwarding to a Discord channel
LOG_WEBHOOK_URL=

# Bot listing
TOPGG_TOKEN=
```

### 3. Set up the database

```sh
pnpm prisma:generate
pnpm prisma:migrate
```

### 4. Configure Lavalink

Edit `lavalink/application.yml` with your Lavalink server settings, then start Lavalink separately before the bot.

### 5. Run

**Development (tsx, no build step):**

```sh
pnpm dev
```

**Production (compile first):**

```sh
pnpm build
pnpm start          # single instance
# or
pnpm shard          # with Discord sharding (recommended for large bots)
```

**With PM2:**

```sh
pnpm pm2:start
pnpm pm2:logs
```

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

## Logging

The bot uses Winston with daily log rotation. Logs are written to `./logs/`:

- `combined-YYYY-MM-DD.log` — all levels
- `error-YYYY-MM-DD.log` — errors only
- `info-YYYY-MM-DD.log` — info and above
- `shards/shard-N-YYYY-MM-DD.log` — per-shard logs

Set `LOG_WEBHOOK_URL` in `.env` to forward error/warn logs to a Discord webhook (batched every 5 seconds to avoid rate limits).

Set `LOG_LEVEL=debug` to enable verbose output.

---

## Health Check

When running, the bot exposes a small HTTP server (default port `3000`, configurable via `PORT`):

- `GET /health` — returns `200` when ready, `503` during startup
- `GET /startup` — returns full startup state including completed steps and any errors

---

## Project Structure

```
src/
├── bot/           # Entry points (index.ts = single, shard.ts = sharded)
├── commands/      # All slash and prefix commands, organized by category
├── database/      # PostgreSQL (Prisma), MongoDB, and Redis client setup
├── events/        # Discord.js event handlers
├── features/      # Feature-specific modules (economy, leveling, etc.)
├── handlers/      # Command and event loaders
├── locales/       # i18n strings (en, fil)
├── services/      # Shared services (AI, music, etc.)
├── structures/    # Base classes (PanindiganClient, BaseCommand, etc.)
└── utils/         # Logger, Banner, helpers
```

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
