# Panindigan Discord Bot

An all-in-one Discord bot for Filipino communities. Built with TypeScript, Discord.js v14, Prisma (PostgreSQL), MongoDB, Redis, and Lavalink for audio.

## How to run

The workflow **Start application** runs `pnpm dev` which launches the bot via `tsx src/bot/index.ts`.

The bot also starts a small HTTP health-check server on port 3000:
- `GET /health` — returns `200` when ready, `503` during startup
- `GET /startup` — full startup state including completed steps and errors

## Required secrets (set in Replit Secrets)

| Secret | Purpose |
|---|---|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Application client ID |
| `POSTGRES_URL` | PostgreSQL connection string |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `SESSION_SECRET` | Session signing secret |

## Optional secrets

| Secret | Purpose |
|---|---|
| `OPENAI_API_KEY` | AI commands (ChatGPT, DALL-E) |
| `ANTHROPIC_API_KEY` | AI commands (Claude) |
| `GEMINI_API_KEY` | AI commands (Gemini) |
| `GROQ_API_KEY` | AI commands (Groq) |
| `LAVALINK_HOST` / `LAVALINK_PORT` / `LAVALINK_PASSWORD` | Music commands |
| `SENTRY_DSN` | Error tracking |
| `TOPGG_TOKEN` | Top.gg listing |
| `LOG_WEBHOOK_URL` | Discord webhook for logs |

## Database setup

Prisma client is pre-generated. To re-generate after schema changes:
```sh
pnpm prisma generate
pnpm prisma db push   # or: pnpm prisma migrate dev
```

## Project structure

```
src/
├── bot/        # Entry point (index.ts)
├── commands/   # Slash & prefix commands by category
├── database/   # Prisma, MongoDB, Redis clients
├── events/     # Discord.js event handlers
├── features/   # Economy, leveling, etc.
├── handlers/   # Command & event loaders
├── locales/    # i18n strings (en, fil)
├── services/   # AI, music services
├── structures/ # PanindiganClient, BaseCommand
└── utils/      # Logger, Banner, helpers
```

## User preferences

- Keep the project as ESM (no CJS conversion).
