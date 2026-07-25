# 🤖 Panindigan — All-in-One Discord Bot


[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2)](https://discord.js.org/)
[![Lavalink](https://img.shields.io/badge/Lavalink-4.x-red)](https://github.com/lavalink-devs/Lavalink)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.1-orange)](CHANGELOG.md)

> **"Isang bot para sa lahat — moderno, malakas, at laging handa."**
> The last Discord bot you'll ever need. 🇵🇭

Panindigan ay isang enterprise-grade, all-in-one Discord bot na dinisenyo para sa mga modernong server. Mula sa advanced moderation hanggang multi-provider AI, high-fidelity Lavalink music hanggang full-featured economy, leveling system, giveaways, image manipulation, at marami pa — lahat ng kailangan ng iyong server ay nandito na.

**Fully sharded, premium-ready, at dinisenyo para lumago kasabay ng iyong komunidad.**

---

## 🚀 Tech Stack

| Technology | Version | Paggamit |
|---|---|---|
| Node.js | v24 LTS | Runtime environment |
| TypeScript | v5.8+ | Primary language — strict mode |
| pnpm | v11.15.1 | Package manager |
| Discord.js | v14 (latest) | Discord API library |
| @discordjs/voice | latest | Voice connection management |
| Lavalink | v4.x | High-performance audio server |
| Shoukaku | v4.x | Lavalink Node.js client |
| Kazagumo | v4.x | Queue manager sa ibabaw ng Shoukaku |
| OpenAI SDK | v4.x | AI provider (ChatGPT, DALL·E) |
| @anthropic-ai/sdk | latest | Anthropic Claude provider |
| @google/generative-ai | latest | Google Gemini provider |
| Groq SDK | latest | Groq ultra-fast inference |
| Prisma | v5.x | Type-safe ORM (PostgreSQL) |
| PostgreSQL | v16+ | Pangunahing relational database |
| MongoDB | v7+ | Document store (logs, AI memory, tags) |
| Redis | v7+ | Caching, cooldowns, rate-limiting |
| i18next | latest | Multi-language (Filipino + English) |
| Zod | v3.x | Runtime schema validation |
| Winston | v3.x | Structured professional logging |
| PM2 | latest | Process manager at monitoring |
| Docker | latest | Containerized deployment |
| Sharp | latest | Image processing |
| Canvas | latest | Dynamic image generation |

---

## ✨ Features

### 📋 Command Categories (900+ Commands)

| Category | Commands | Description |
|---|---|---|
| ❓ Help | 15 | Interactive help system na may buttons at pagination |
| 🛡️ Moderation | 50 | Advanced moderation — ban, kick, warn, automod, anti-nuke |
| 👑 Admin/Setup | 45 | Server configuration, welcome, logging, reaction roles |
| 🎵 Music | 60 | Lavalink audio — playlists, EQ, effects, voice recording |
| 💰 Economy | 80 | Virtual currency, jobs, investing, real estate, marketplace |
| 🎮 Games | 65 | TicTacToe, Blackjack, Chess, Poker, Dungeon Raids |
| 🎉 Fun | 68 | Memes, animals, horoscope, virtual pets, text effects |
| 🤖 AI | 65 | Multi-provider AI — ChatGPT, Claude, Gemini, Groq |
| ℹ️ Info | 48 | Server, user, bot info, analytics, weather, crypto |
| 🔧 Utility | 65 | Reminders, polls, tickets, tags, cron scheduling |
| 🌐 Social | 80 | GIF reactions, Couple System, reputation, profiles |
| 📈 Leveling | 25 | XP, rank cards, level roles, voice XP |
| 🎁 Giveaway | 22 | Full giveaway system — all FREE, no premium lock |
| 🖼️ Image | 30 | AI image generation, canvas manipulation, filters |
| ⭐ Starboard | 12 | Highlight the best messages sa server |
| 📝 Applications | 18 | Application forms, review system, auto-role |
| 💎 Premium | 30 | Premium management, key activation, benefits |
| 🔑 Owner | 122 | Bot owner system-level control |

---

## 🗄️ Database Architecture

Gumagamit si Panindigan ng tatlong database para sa pinakamataas na performance at flexibility:

### 🐘 PostgreSQL v16+ — Relational Data
Ginagamit para sa structured, relational na data na kailangan ng ACID compliance:
- Guild configurations at settings
- User accounts at economy data
- Premium subscriptions at keys
- Moderation cases at warnings
- Leveling at XP records
- Music playlists at saved queues
- Giveaways at application forms
- Couple records at reminders

### 🍃 MongoDB v7+ — Document Store
Ginagamit para sa flexible, schema-less na data:
- AI conversation memory at histories
- Custom tags at auto-responses
- Server-specific logging documents
- Bot analytics at usage statistics
- Giveaway entries at records
- Starboard posts
- Application responses
- Image generation histories

### 🔴 Redis v7+ — Caching Layer
- Command cooldowns (per-user, per-guild)
- Rate limiting counters
- Session data
- Frequently accessed config cache
- Music queue state
- Temporary data (AFK, snipe, editsnipe)
- Premium tier cache

---

## 🤖 AI Integration — Multi-Provider Engine

| Provider | Models | Best For |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o Mini, GPT-4.1, o3, o4-mini, DALL·E 3 | General chat, image generation |
| Anthropic Claude | Claude 4 Opus, Claude 4 Sonnet, Claude 3.5 Haiku | Long documents, analysis |
| Google Gemini | Gemini 2.5 Pro, Gemini 2.5 Flash | Multimodal, reasoning |
| Groq | Llama 3.3 70B, Mixtral, Gemma 2 | Ultra-fast inference |
| DeepSeek | DeepSeek V3, DeepSeek R1 | Coding, math, reasoning |
| xAI Grok | Grok 3, Grok 3 Mini | Real-time web knowledge |
| Mistral AI | Mistral Large, Mistral Small | Multilingual tasks |

**Features:** Automatic provider failover, per-server AI configuration, streaming responses, persistent conversation memory (MongoDB), multi-modal image understanding, function calling, rate limit handling at retry system.

---

## 💎 Premium System — One-Time Permanent Purchase

> ⚠️ **HINDI MONTHLY SUBSCRIPTION** — Isang beses lang bayaran, permanent na access. Walang recurring charges. Walang expiry date.

```
╔════════════════════════════════════════════════════════════════════╗
║                  💎 PANINDIGAN PREMIUM                             ║
║            ONE-TIME PAYMENT • PERMANENT ACCESS                     ║
╠════════════════════════════════════════════════════════════════════╣
║  🎯 FREE TRIAL    7 Days Diamond  •  Libre, walang credit card     ║
║  🥉 BRONZE        ₱49   one-time  •  Essential premium features    ║
║  ⭐ SILVER        ₱99   one-time  •  Enhanced AI, music & utility  ║
║  💎 GOLD          ₱199  one-time  •  Advanced tools & automation   ║
║  👑 DIAMOND       ₱399  one-time  •  All features + VIP benefits   ║
╚════════════════════════════════════════════════════════════════════╝
```

| Tier | Price | Key Features |
|---|---|---|
| 🆓 Free | Free | Essential commands, always available |
| 🥉 Bronze | ₱49 | Faster cooldowns, basic AI, music perks |
| ⭐ Silver | ₱99 | Enhanced AI, playlists, ticket system |
| 💎 Gold | ₱199 | Automation, analytics, advanced economy |
| 👑 Diamond | ₱399 | Zero limits, VIP, custom AI, priority support |

---

## 📋 Command System — Slash vs. Prefix

### 🔷 Slash Commands (Top 100 — Discord Limit)
```
/help  /ping  /play  /queue  /skip  /stop  /nowplaying  /ban
/kick  /mute  /warn  /purge  /userinfo  /serverinfo  /avatar
/balance  /daily  /work  /shop  /inventory  /ask  /translate
/weather  /poll  /remind  /8ball  /coinflip  /ship  /tictactoe
/blackjack  /slots  /level  /rank  /leaderboard  /giveaway
/ticket  /report  /suggest  /setup  /profile  /badge  /tag
/embed  /crypto  /stock  /color  /qr  /afk  /trivia  /wordle
/marry  /rep  /hug  /pat  ... (at 50 pang iba)
```

### 🔶 Prefix Commands (Walang Limit — 900 Commands)
```
p!help  p!play  p!ban  p!kick  p!mute  p!warn  p!balance
p!daily  p!work  p!shop  p!ask  p!imagine  p!level  p!rank
p!giveaway  p!ticket  p!profile  p!badge  p!tag  p!starboard
... at marami pang commands hanggang 900+ total
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v24.x or higher
- pnpm v11.15.1 or higher
- PostgreSQL v16.x or higher
- MongoDB v7.x or higher
- Redis v7.x or higher
- Lavalink v4.x (for music features)
- Discord Bot Token

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nazzelofficial/panindigan-bot.git
cd panindigan-bot
```

2. **Install dependencies**
```bash

pnpm install
npm install
pnpm install
bun install

```

3. **Configure environment variables**

Set these directly on your hosting platform (Railway, Render, VPS, etc.) — **never** commit a `.env` file with real credentials to git:

```env
# ========== DISCORD ==========
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id


# ========== DATABASES ==========
DATABASE_URL=postgresql://user:pass@host:5432/panindigan
POSTGRES_URL=postgresql://user:pass@host:5432/panindigan
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/panindigan
REDIS_URL=redis://user:pass@host:6379

=======
# Database
# ========== DISCORD ==========
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id

# ========== DATABASES ==========
POSTGRES_URL=postgresql://user:pass@host:5432/panindigan
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/panindigan
REDIS_URL=redis://user:pass@host:6379

>>>>>>> 03df72d2397de7ce4b97f92510cc2d4a05d383e0
# ========== AI PROVIDERS (optional — only needed for AI commands) ==========
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...

# ========== LAVALINK (optional — only needed for music) ==========
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# ========== BOT OWNERS ==========
OWNER_IDS=123456789012345678,987654321098765432
<<<<<<< HEAD

# ========== OPTIONAL ==========
LOG_LEVEL=info              # debug | info | warn | error
LOG_WEBHOOK_URL=https://discord.com/api/webhooks/...
SESSION_SECRET=change_this_to_a_long_random_string
NODE_ENV=production
=======

# ========== OPTIONAL ==========
LOG_LEVEL=info              # debug | info | warn | error
LOG_WEBHOOK_URL=https://discord.com/api/webhooks/...
SESSION_SECRET=change_this_to_a_long_random_string
NODE_ENV=production

>>>>>>> 03df72d2397de7ce4b97f92510cc2d4a05d383e0
```

4. **Generate Prisma client**
```bash
pnpm prisma:generate
```

5. **Run database migrations**
```bash
pnpm prisma:migrate
```

6. **Start the bot**

Development (single shard, tsx hot-reload):
```bash
pnpm dev
```

Production (compiled):
```bash
pnpm build
pnpm start
```

Production with PM2:
```bash
pnpm pm2:start
```

---

## ⚙️ Configuration (config.json)

Lahat ng non-sensitive, manually editable na settings ng bot. Ang sensitive credentials ay nasa environment variables ng iyong hosting platform.

Key sections:

| Section | Description |
|---|---|
| `features` | Enable/disable major features (music, AI, economy, leveling) |
| `bot` | Name, prefix (`p!`), default language (`fil`) |
| `loader` | Command loading settings, slash command registration |
| `sharding` | Shard count (auto), respawn, max guilds per shard |
| `presence` | Bot status, activity rotation (per-shard, every 30s) |
| `databases` | Pool sizes, timeouts, collection names |
| `premium` | Tier definitions, prices, free trial settings |
| `moderation` | Warn thresholds, automod sensitivity, anti-nuke config |
| `economy` | Currency symbol (₱ Piso), rewards, cooldowns |
| `leveling` | XP per message, cooldown, voice XP rate |
| `music` | Default volume, queue limits per tier, inactivity timeout |
| `ai` | Provider priority, fallback chain, memory limits per tier |
| `cooldowns` | Default cooldowns, per-category, premium multipliers |
| `logging` | Log level, rotation, MongoDB event logging |
| `rateLimits` | Commands per minute per tier |

---

## 📊 Professional Logging System

Winston-powered structured logging na may shard awareness, daily rotation, at remote monitoring.

### Log Levels (via `LOG_LEVEL` env var)

| Level | Symbol | When |
|---|---|---|
| ERROR | 🔴 | Critical errors, crashes, unhandled exceptions |
| WARN | 🟠 | Non-critical issues, high latency, deprecated usage |
| INFO | 🟡 | General events, command executions, guild events |
| DEBUG | 🟢 | Detailed trace logs para sa development |

### Log Files (14-day retention, 20MB rotation)

```
logs/
├── combined-YYYY-MM-DD.log    ← All logs (JSON)
├── error-YYYY-MM-DD.log       ← Error-only logs
├── info-YYYY-MM-DD.log        ← Info and above
└── shards/
    ├── shard-0-YYYY-MM-DD.log
    └── shard-N-YYYY-MM-DD.log
```

### Child Loggers (per module)
Every subsystem has its own child logger for easy filtering:
`bot`, `commands`, `events`, `music`, `database`, `mongodb`, `postgresql`, `redis`, `economy`, `moderation`, `tickets`, `giveaways`, `ai`, `leveling`, `starboard`, `premium`, `automod`, `antinuke`, `shard`

### Discord Webhook Alerts
Set `LOG_WEBHOOK_URL` to forward `error`/`fatal` logs to a private staff channel in real time (rate-limited/batched to avoid spam).

### Tailing Logs in Production

```bash
# PM2
pm2 logs panindigan

# Docker
docker logs panindigan --follow

# Manual tail
tail -f logs/combined-$(date +%Y-%m-%d).log
tail -f logs/error-$(date +%Y-%m-%d).log

# Filter by module (jq required)
tail -f logs/combined-$(date +%Y-%m-%d).log | jq 'select(.module == "ai")'
```

---

## 🔷 Sharding System

Panindigan ay fully sharded — handa para sa libo-libong server.

- Discord ay nag-re-require ng sharding kapag ang bot ay nasa 2,500+ servers
- Bawat shard ay isang hiwalay na proseso na nagmamanage ng subset ng mga server
- `ShardingManager` ang nagko-coordinate sa lahat ng shards
- Per-shard dedicated log files at presence rotation (every 30 seconds)
- Auto-respawn kapag namatay ang shard

**Bot Presence (per shard, auto-rotating):**
```
🎵 Playing  /help | Shard 0 | 1,234 servers
🛡️ Watching over 45,231 members | Shard 1
🇵🇭 Para sa mga Pilipino | Shard 2
```

---

## 📁 Project Structure

### Slash Commands
```
/help
/ping
/play query: song_name
/ban user: @user
```

### Examples

**Moderation:**
```bash
p!ban @user Breaking rules
p!mute @user 1h
p!clear 50
```

**Music:**
```bash
p!play Despacito
p!queue
p!skip
p!volume 75
```

**Economy:**
```bash
p!balance
p!daily
p!shop
p!buy item_id
```

**AI:**
```bash
p!ask What is the meaning of life?
p!image A beautiful sunset
p!chat Hello, how are you?
```

## 🛠️ Development

```

---

## 🔷 Sharding System

Panindigan ay fully sharded — handa para sa libo-libong server.

- Discord ay nag-re-require ng sharding kapag ang bot ay nasa 2,500+ servers
- Bawat shard ay isang hiwalay na proseso na nagmamanage ng subset ng mga server
- `ShardingManager` ang nagko-coordinate sa lahat ng shards
- Per-shard dedicated log files at presence rotation (every 30 seconds)
- Auto-respawn kapag namatay ang shard

**Bot Presence (per shard, auto-rotating):**
```
🎵 Playing  /help | Shard 0 | 1,234 servers
🛡️ Watching over 45,231 members | Shard 1
🇵🇭 Para sa mga Pilipino | Shard 2

```


### Project Structure

```
panindigan-bot/
├── src/
│   ├── bot/
│   │   ├── index.ts              # Single shard (dev entry)
│   │   └── shard.ts              # ShardingManager (production entry)
│   ├── commands/                 # 900+ commands (18 categories)
│   │   ├── admin/                # 45 commands
│   │   ├── ai/                   # 65 commands
│   │   ├── applications/         # 18 commands
│   │   ├── economy/              # 80 commands
│   │   ├── fun/                  # 68 commands
│   │   ├── games/                # 65 commands
│   │   ├── giveaway/             # 22 commands (all FREE)
│   │   ├── help/                 # 15 commands
│   │   ├── image/                # 30 commands
│   │   ├── info/                 # 48 commands
│   │   ├── leveling/             # 25 commands
│   │   ├── moderation/           # 50 commands
│   │   ├── music/                # 60 commands
│   │   ├── owner/                # 122 commands
│   │   ├── premium/              # 30 commands
│   │   ├── social/               # 80 commands
│   │   ├── starboard/            # 12 commands
│   │   └── utility/              # 65 commands
│   ├── database/
│   │   ├── mongodb/
│   │   │   ├── client.ts
│   │   │   └── collections/      # AiMemory, Tags, EventLogs, Analytics, Starboard
│   │   ├── postgresql/
│   │   │   ├── client.ts
│   │   │   └── models/           # Guild, User, Economy, Moderation, Premium, Music, Leveling, Giveaway, Applications
│   │   └── redis/
│   │       └── client.ts
│   ├── events/                   # Discord event handlers (20+ events)
│   ├── features/
│   │   └── couple/               # Couple system shared services
│   ├── handlers/                 # CommandHandler, EventHandler, AIHandler, CooldownHandler, etc.
│   ├── locales/
│   │   ├── en.json               # English translations
│   │   └── fil.json              # Filipino translations
│   ├── services/                 # AI, Image, Weather, News, Stock, Spotify
│   ├── structures/               # BaseCommand, PanindiganClient, AIEngine, MusicPlayer, Paginator
│   └── utils/                    # Logger, Formatter, Permissions, Constants, ShardUtils
├── prisma/
│   └── schema.prisma             # Full PostgreSQL schema (543 lines)
├── lavalink/
│   └── application.yml           # Lavalink server config
├── config.json                   # Non-sensitive bot configuration
├── ecosystem.config.js           # PM2 configuration
├── docker-compose.yml            # Includes PostgreSQL, MongoDB, Redis, Lavalink
├── Dockerfile
├── package.json
└── tsconfig.json


```

---

## 🐳 Docker Deployment

```bash
# Start everything (bot + all databases + lavalink)
docker-compose up -d

# View logs
docker-compose logs -f panindigan

# Rebuild after code changes
docker-compose up -d --build
```

The `docker-compose.yml` includes:
- **Panindigan Bot** (auto-restart)
- **PostgreSQL** (persistent volume)
- **MongoDB** (persistent volume)
- **Redis** (persistent volume)
- **Lavalink** (music server)

---

## 🔐 Security

- ✅ Lahat ng sensitive credentials ay nasa hosting platform environment variables — hindi sa code o config files
- ✅ Walang `.env` file na i-uupload sa git — lahat ng secrets ay sa hosting
- ✅ Permission validation sa bawat command (user at bot permissions)
- ✅ Redis-backed rate limiting para maiwasan ang abuse
- ✅ Input validation at sanitization gamit ang Zod
- ✅ Bot owner commands validated sa hardcoded `OWNER_IDS` environment variable
- ✅ Premium commands server-side validated — hindi maaaring i-bypass
- ✅ All PostgreSQL queries parameterized (Prisma ORM) — walang SQL injection
- ✅ MongoDB queries sanitized — walang NoSQL injection
- ✅ Log redaction — tokens, passwords, API keys ay automatic na hindi nilo-log
- ✅ Log sanitization — user input ay ina-sanitize bago i-log para maiwasan ang log injection
- ✅ HTTPS-only sa lahat ng external API calls
- ✅ Lahat ng owner command executions ay naka-audit log sa MongoDB
- ✅ Anti-nuke protection sa destructive admin commands (Diamond only)
- ✅ AI content filtering para sa inappropriate requests
- ✅ Docker container isolation sa production deployment

---

## 🌍 Multi-Language Support

- 🇬🇧 English (`en`)
- 🇵🇭 Filipino (`fil`)

I-set ang language per-server gamit ang `/language` o `p!language`.

---

## 🛠️ Development

### Available Scripts

```bash
pnpm dev              # Start with tsx (hot-reload)
pnpm build            # Compile TypeScript
pnpm start            # Run compiled output
pnpm shard            # Run ShardingManager (production)
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm lint             # ESLint check
pnpm format           # Prettier format
```

### Adding a New Command

1. Create a file in the correct category folder: `src/commands/<category>/<name>.ts`
2. Extend `BaseCommand`:

```typescript
import { BaseCommand } from '../../structures/BaseCommand';
import { SlashCommandBuilder } from 'discord.js';

export default class MyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'mycommand',
      description: 'Does something cool',
      category: 'utility',
      aliases: ['mc'],
      premiumTier: 'free',          // 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
      slashCommand: true,
      prefixCommand: true,
    });
  }

  buildSlashCommand() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  async executeSlash(interaction) {
    await interaction.reply('Hello!');
  }

  async executePrefix(message, args) {
    await message.reply('Hello!');
  }
}
```

3. The `CommandHandler` will automatically load it on next startup.


---

## 📊 Professional Logging System

Winston-powered structured logging na may shard awareness, daily rotation, at remote monitoring.

### Log Levels (via `LOG_LEVEL` env var)

| Level | Symbol | When |
|---|---|---|
| ERROR | 🔴 | Critical errors, crashes, unhandled exceptions |
| WARN | 🟠 | Non-critical issues, high latency, deprecated usage |
| INFO | 🟡 | General events, command executions, guild events |
| DEBUG | 🟢 | Detailed trace logs para sa development |

### Log Files (14-day retention, 20MB rotation)

```
logs/
├── combined-YYYY-MM-DD.log    ← All logs (JSON)
├── error-YYYY-MM-DD.log       ← Error-only logs
├── info-YYYY-MM-DD.log        ← Info and above
└── shards/
    ├── shard-0-YYYY-MM-DD.log
    └── shard-N-YYYY-MM-DD.log
```

### Child Loggers (per module)
Every subsystem has its own child logger for easy filtering:
`bot`, `commands`, `events`, `music`, `database`, `mongodb`, `postgresql`, `redis`, `economy`, `moderation`, `tickets`, `giveaways`, `ai`, `leveling`, `starboard`, `premium`, `automod`, `antinuke`, `shard`

### Discord Webhook Alerts
Set `LOG_WEBHOOK_URL` to forward `error`/`fatal` logs to a private staff channel in real time (rate-limited/batched to avoid spam).

### Tailing Logs in Production
## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code — strict mode enabled
- Follow existing code patterns and module structure
- Replace all `console.log`/`console.error` with the appropriate child logger from `src/utils/Logger.ts`
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) — Amazing Discord API library
- [Lavalink](https://github.com/lavalink-devs/Lavalink) — Audio streaming
- [Prisma](https://www.prisma.io/) — Next-generation ORM
- [Kazagumo](https://github.com/kazugumo/Kazagumo) — Lavalink queue manager
- [Winston](https://github.com/winstonjs/winston) — Professional logging
- All contributors and supporters

---

## 📞 Support

- **Discord Support Server:** [discord.gg/panindigan](https://discord.gg/panindigan)
- **Report Issues:** [GitHub Issues](https://github.com/nazzelofficial/panindigan-bot/issues)
- **Documentation:** [GitHub Wiki](https://github.com/nazzelofficial/panindigan-bot/wiki)

## 🔗 Links

- [Invite Bot](https://discord.com/oauth2/authorize)
- [Vote on Top.gg](https://top.gg)
- [Vote for Bot](https://top.gg)
- [Donate](https://patreon.com)
- [GitHub](https://github.com/nazzelofficial/panindigan-bot)

---

*Made with ❤️ by [Nazzel](https://github.com/nazzelofficial) para sa mga Pilipino at sa buong Discord community.*
