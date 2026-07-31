# Panindigan Discord Bot

An all-in-one Discord bot built for Filipino communities. TypeScript + Discord.js v14, Prisma (PostgreSQL), MongoDB, Redis, and Lavalink for audio.

## How to run

```
pnpm dev
```

The workflow **Start application** runs `pnpm dev` automatically.

## Required secrets (set in Replit Secrets)

| Secret | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal → Bot → Reset Token |
| `DISCORD_CLIENT_ID` | Application ID from Discord Developer Portal → General Information |
| `POSTGRES_URL` | PostgreSQL connection string (`postgres://...`) |
| `MONGODB_URI` | MongoDB connection URI (`mongodb+srv://...`) |
| `REDIS_URL` | Redis connection URL (`redis://...` or `rediss://...`) |

## Optional secrets

| Secret | Description |
|---|---|
| `OPENAI_API_KEY` | For `/ai` commands (ChatGPT, DALL-E) |
| `ANTHROPIC_API_KEY` | Claude fallback AI |
| `GEMINI_API_KEY` | Google Gemini fallback |
| `GROQ_API_KEY` | Groq fast inference fallback |
| `LAVALINK_HOST` | Lavalink server host (required for `/music` commands) |
| `LAVALINK_PORT` | Lavalink port (default: 2333) |
| `LAVALINK_PASSWORD` | Lavalink password (default: youshallnotpass) |

## First-time setup

```bash
pnpm install
pnpm prisma:generate   # Generate Prisma client
pnpm prisma db push    # Sync schema to database (if DB already has data)
# OR: pnpm prisma migrate deploy  # If starting fresh
```

## Project structure

- `src/bot/` — Entry point and shard manager
- `src/commands/` — All slash/prefix commands (one file per category)
- `src/events/` — Discord event handlers
- `src/handlers/` — Command loader, event loader, error handler, premium, cooldown
- `src/structures/` — Base classes: PanindiganClient, BaseCommand, EmbedManager
- `src/database/` — PostgreSQL (Prisma), MongoDB, Redis clients
- `src/health/` — Health server (port 3000), metrics, graceful shutdown
- `config.json` — Feature flags, cooldowns, economy settings, premium tiers

## Slash command registration

Commands are registered globally on every bot startup via `registerSlashCommands()` in `src/handlers/CommandHandler.ts`. Discord propagation may take up to 1 hour for global commands to appear in all servers.

## Music

Music commands require a running Lavalink v4 server. Set `LAVALINK_HOST`, `LAVALINK_PORT`, and `LAVALINK_PASSWORD` secrets to enable. Without Lavalink, the bot starts normally but `/music` commands won't work.

## User preferences

- Keep the existing project structure — do not restructure or migrate unless explicitly asked.
