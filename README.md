# 🤖 Panindigan — All-in-One Discord Bot
 
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2)](https://discord.js.org/)
[![Lavalink](https://img.shields.io/badge/Lavalink-4.x-red)](https://github.com/lavalink-devs/Lavalink)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.1-orange)](CHANGELOG.md)
 
Panindigan is a powerful, feature-rich Discord bot built with TypeScript, Discord.js v14, and modern best practices. With over 900 commands across 18 categories, it provides comprehensive moderation, entertainment, music, economy, and utility features for Discord servers.
 
## ✨ Features
 
### 🎯 Command Categories
- **Help** (15 commands) - Bot help and documentation
- **Moderation** (50 commands) - Server management and moderation tools
- **Admin/Setup** (45 commands) - Server configuration and setup
- **Music** (60 commands) - High-quality music playback with Lavalink
- **Economy** (80 commands) - Virtual currency, shops, and trading
- **Games** (65 commands) - Fun games and activities
- **Fun** (68 commands) - Entertainment and memes
- **AI** (65 commands) - Multi-provider AI integration (OpenAI, Anthropic, Gemini, Groq)
- **Info** (48 commands) - Server and user information
- **Utility** (65 commands) - Useful tools and utilities
- **Social** (80 commands) - Social features and interactions
- **Leveling** (25 commands) - XP and leveling system
- **Giveaway** (22 commands) - Giveaway management
- **Image** (30 commands) - Image manipulation and generation
- **Starboard** (12 commands) - Starboard system
- **Applications** (18 commands) - Application system
- **Premium** (30 commands) - Premium features management
- **Owner** (122 commands) - Bot owner commands
### 🌍 Multi-Language Support
- English (en)
- Filipino (fil)
### 💾 Database Support
- **PostgreSQL** - Structured data storage with Prisma ORM
- **MongoDB** - Document storage for flexible data
- **Redis** - Caching and rate limiting
### 🎵 Music Features
- High-quality audio playback via Lavalink
- YouTube, SoundCloud, Twitch, and more
- Queue management, playlists, and effects
- Volume control, seeking, and filters
### 🤖 AI Integration
- OpenAI GPT models
- Anthropic Claude
- Google Gemini
- Groq AI
- Custom AI service architecture
### 💰 Premium System
- One-time permanent purchase tiers
- Free, Bronze, Silver, Gold, Diamond
- Exclusive features and benefits
- Fair and affordable pricing
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
 
2. **Install dependencies** (pick one package manager)
```bash
pnpm install
```
 
3. **Configure environment variables**
```bash
cp .env.example .env
```
 
Edit `.env` with your configuration:
```env
# ========== DISCORD ==========
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id
 
# ========== DATABASES ==========
POSTGRES_URL=postgresql://user:pass@host:5432/panindigan
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/panindigan
REDIS_URL=redis://user:pass@host:6379
 
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
 
# ========== OPTIONAL ==========
LOG_LEVEL=info              # debug | info | warn | error
LOG_WEBHOOK_URL=https://discord.com/api/webhooks/...
SESSION_SECRET=change_this_to_a_long_random_string
NODE_ENV=production
```
 
4. **Run database migrations**
```bash
npx prisma migrate dev
```
 
5. **Build the project**
```bash
npm run build
```
 
6. **Start the bot**
```bash
npm start
```
 
### Docker Deployment
 
Using Docker Compose (recommended):
```bash
docker-compose up -d
```
 
Using Docker directly:
```bash
docker build -t panindigan-bot .
docker run -d --env-file .env panindigan-bot
```
 
## 📖 Usage
 
### Prefix Commands
```
p!help
p!ping
p!play song_name
p!ban @user
```
 
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
 
## 🛠️ Development
 
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
│   │   ├── social/                # 80 commands
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
 
### Available Scripts
```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Start production build
 
# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open Prisma Studio
 
# Linting & Formatting
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
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
 
## 🤝 Contributing
 
Contributions are welcome! Please follow these guidelines:
 
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
### Code Style
- Use TypeScript for all new code
- Follow existing code patterns
- Add comments for complex logic
- Update documentation as needed
## 📄 License
 
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
 
## 🙏 Acknowledgments
 
- [Discord.js](https://discord.js.org/) — Amazing Discord API library
- [Lavalink](https://github.com/lavalink-devs/Lavalink) — Audio streaming
- [Prisma](https://www.prisma.io/) — Next-generation ORM
- [Kazagumo](https://github.com/kazugumo/Kazagumo) — Lavalink queue manager
- [Winston](https://github.com/winstonjs/winston) — Professional logging
- All contributors and supporters
## 📞 Support
 
- **Join our Discord Server:** [Support Server](https://discord.gg/panindigan)
- **Report Issues:** [GitHub Issues](https://github.com/nazzelofficial/panindigan-bot/issues)
- **Documentation:** [Wiki](https://github.com/nazzelofficial/panindigan-bot/wiki)
## 🔗 Links
 
- [Invite Bot](https://discord.com/oauth2/authorize)
- [Vote for Bot](https://top.gg)
- [Donate](https://patreon.com)
- [GitHub](https://github.com/nazzelofficial/panindigan-bot)
---
 
Made with ❤️ by [Nazzel](https://github.com/nazzelofficial)
