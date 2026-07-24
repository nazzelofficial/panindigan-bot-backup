# Panindigan — All-in-One Discord Bot

A feature-rich Discord bot built with TypeScript, Discord.js v14, Lavalink music, multi-provider AI (OpenAI, Anthropic, Gemini, Groq), full economy, leveling, giveaways, and 900+ prefix commands.

## Tech Stack
- **Runtime**: Node.js v20 LTS + TypeScript
- **Discord**: Discord.js v14, @discordjs/voice
- **Music**: Lavalink v4 + Shoukaku + Kazagumo
- **AI**: OpenAI, Anthropic Claude, Google Gemini, Groq
- **Databases**: PostgreSQL (Prisma ORM), MongoDB, Redis
- **Image**: Canvas + Sharp
- **Process**: PM2 / Docker

## Required Environment Variables
Copy `.env.example` → `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token (required) |
| `DISCORD_CLIENT_ID` | Your bot's application/client ID (required) |
| `OWNER_IDS` | Comma-separated Discord user IDs of bot owners |
| `POSTGRES_URL` | PostgreSQL connection string |
| `MONGODB_URI` | MongoDB connection URI |
| `REDIS_URL` | Redis connection URI |
| `OPENAI_API_KEY` | OpenAI API key (for AI commands + image generation) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key (optional) |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |
| `GROQ_API_KEY` | Groq API key (optional) |
| `LAVALINK_HOST` | Lavalink server host (default: localhost) |
| `LAVALINK_PORT` | Lavalink server port (default: 2333) |
| `LAVALINK_PASSWORD` | Lavalink password (default: youshallnotpass) |
| `SESSION_SECRET` | Session secret (already in Replit Secrets) |

Optional: `GIPHY_API_KEY` for GIF support in social commands.

## How to Run

### Development
```bash
npm run dev          # Start with tsx (hot reload)
```

### Production
```bash
npm run build        # Compile TypeScript
npm run start        # Run compiled JS
npm run pm2:start    # Run with PM2 process manager
```

### Database Setup
```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Database GUI
```

## Project Structure
```
src/
├── bot/            # Entry point & shard manager
├── commands/       # 900+ commands organized by category
│   ├── admin/      # Server admin & setup commands
│   ├── ai/         # AI commands (OpenAI, Claude, Gemini, Groq)
│   ├── economy/    # Economy system (80 commands)
│   ├── fun/        # Fun commands (68 commands)
│   ├── games/      # Games (65 commands)
│   ├── giveaway/   # Giveaway system (22 commands)
│   ├── image/      # Image generation & manipulation
│   ├── leveling/   # XP & leveling system
│   ├── moderation/ # Moderation commands
│   ├── music/      # Lavalink music (60 commands)
│   ├── owner/      # Bot owner commands
│   ├── premium/    # Premium system commands
│   ├── social/     # Social interaction commands
│   ├── starboard/  # Starboard system
│   └── utility/    # Utility commands
├── database/       # DB clients (PostgreSQL, MongoDB, Redis)
├── events/         # Discord event handlers
├── features/       # Feature modules (couple system, etc.)
├── handlers/       # AI, cooldown, premium, giveaway handlers
├── locales/        # i18n translations (en, fil)
├── services/       # External API services
├── structures/     # Core structures (Client, BaseCommand, etc.)
└── utils/          # Utilities and constants
```

## Premium Tiers
- 🆓 **Free** — Essential commands (always available)
- 🥉 **Bronze** — ₱49 one-time — Speed, basic AI, music perks
- ⭐ **Silver** — ₱99 one-time — Enhanced AI, playlists, server tools
- 💎 **Gold** — ₱199 one-time — Automation, analytics, advanced AI
- 👑 **Diamond** — ₱399 one-time — Zero limits, VIP, custom AI persona

## User Preferences
- Use TypeScript strict mode
- All commands must extend `BaseCommand` from `src/structures/BaseCommand.ts`
- Use `getPrismaClient()` from `src/database/postgresql/client.ts` for DB access
- Use `client.aiHandler.generateTaskResponse()` for one-shot AI calls (no memory saved)
- Use `client.aiHandler.generateResponse()` for conversational AI (saves memory to MongoDB)
- Prefix: `p!` (configurable per guild)
- Language: Filipino (fil) + English (en) via i18next
