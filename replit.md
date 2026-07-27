# Panindigan Discord Bot

An all-in-one Discord bot for Filipino communities. Built with TypeScript, Discord.js v14, Prisma (PostgreSQL), MongoDB, Redis, and Lavalink for music.

## How to run

The workflow **Start application** runs `pnpm dev` which starts the bot in development mode via `tsx src/bot/index.ts`.

After making code changes, restart the **Start application** workflow.

## Health endpoints

The bot exposes a small HTTP server on port 3000:

- `GET /health` — returns `200` with status when the bot is ready
- `GET /startup` — full startup state including completed steps and errors

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

## Setup notes

- Run `pnpm prisma generate` after any schema changes in `prisma/schema.prisma`
- Run `pnpm prisma migrate dev` to apply schema migrations to the database
- Lavalink must be running separately for music features to work

## Project structure

```
src/
├── bot/           # Entry points (index.ts = single, shard.ts = sharded)
├── commands/      # Slash and prefix commands by category (~700+ commands)
├── database/      # PostgreSQL (Prisma), MongoDB, and Redis clients
├── events/        # Discord.js event handlers
├── features/      # Feature modules (economy, leveling, etc.)
├── handlers/      # Command and event loaders
├── locales/       # i18n strings (en, fil)
├── services/      # Shared services (AI, music)
├── structures/    # Base classes (PanindiganClient, BaseCommand)
└── utils/         # Logger, Banner, helpers
```

## User preferences

- Keep the existing project structure — do not restructure or migrate unless explicitly asked.
