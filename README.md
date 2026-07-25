# 🤖 Panindigan — All-in-One Discord Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2)](https://discord.js.org/)
[![Lavalink](https://img.shields.io/badge/Lavalink-4.x-red)](https://github.com/lavalink-devs/Lavalink)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.1-orange)](CHANGELOG.md)

## ✨ Features

### 🎯 Command Categories
- **Help**: 15 commands for bot help and docs
- **Moderation**: 50 tools for managing and moderating servers
- **Admin/Setup**: 45 commands for server config
- **Music**: 60 commands using Lavalink for quality playback
- **Economy**: 80 commands for currency, shops, trading
- **Games**: 65 fun activities
- **Fun**: 68 meme/entertainment commands
- **AI**: 65 commands—multi-provider (OpenAI, Anthropic, Gemini, Groq)
- **Info**: 48 server and user info commands
- **Utility**: 65 handy tools
- **Social**: 80 commands for social features
- **Leveling**: 25 commands for XP and leveling
- **Giveaway**: 22 management commands
- **Image**: 30 image generation/manipulation commands
- **Starboard**: 12 commands for starboards
- **Applications**: 18 application management commands
- **Premium**: 30 commands for premium features
- **Owner**: 122 bot owner commands

### 🌍 Multi-Language Support
- English (en)
- Filipino (fil)

### 💾 Database Support
- **PostgreSQL** – Structured storage, Prisma ORM
- **MongoDB** – Document storage for flexible data
- **Redis** – Caching and rate limiting

### 🎵 Music Features
- Lavalink-powered, high quality audio
- Supports YouTube, SoundCloud, Twitch, more
- Queue, playlists, audio effects, filters, volume

### 🤖 AI Integration
- OpenAI GPT
- Anthropic Claude
- Google Gemini
- Groq AI
- Custom AI architecture

### 💰 Premium System
- Permanent, one-time tiers: Free, Bronze, Silver, Gold, Diamond
- Unlock exclusive features for a fair price

## 🚀 Getting Started

### Prerequisites
- Node.js v24.x+
- pnpm v11.15.1+
- PostgreSQL v16.x+
- MongoDB v7.x+
- Redis v7.x+
- Lavalink v4.x (for music)
- Discord bot token

### Installation

1. **Clone this repo**
   ```
   git clone https://github.com/nazzelofficial/panindigan-bot.git
   cd panindigan-bot
   ```

2. **Install dependencies**
   ```
   pnpm install
   ```

3. **Set up your `.env` file**
   ```
   cp .env.example .env
   ```
   Then edit `.env` with your own config and keys. Main entries:

   ```
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id
   POSTGRES_URL=postgresql://user:pass@host:5432/panindigan
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/panindigan
   REDIS_URL=redis://user:pass@host:6379
   # Optional AI/Music/Lavalink/Premium configs...
   ```

4. **Run database migrations**
   ```
   npx prisma migrate dev
   ```

5. **Build the bot**
   ```
   npm run build
   ```

6. **Start up**
   ```
   npm start
   ```

### Docker Deployment

With Docker Compose (recommended):

```
docker-compose up -d
```

Just using Docker:

```
docker build -t panindigan-bot .
docker run -d --env-file .env panindigan-bot
```

## 📖 Usage

### Prefix Commands

Start with `p!`  
`p!help`  
`p!ping`  
`p!play song_name`  
`p!ban @user`

### Slash Commands

Start with `/`  
`/help`  
`/ping`  
`/play query: song_name`  
`/ban user: @user`

### Examples

**Moderation:**  
`p!ban @user Breaking rules`  
`p!mute @user 1h`  
`p!clear 50`

**Music:**  
`p!play Despacito`  
`p!queue`  
`p!skip`  
`p!volume 75`

**Economy:**  
`p!balance`  
`p!daily`  
`p!shop`  
`p!buy item_id`

**AI:**  
`p!ask What is the meaning of life?`  
`p!image A beautiful sunset`  
`p!chat Hello, how are you?`

## 🔷 Sharding System

Panindigan is fully sharded and ready for thousands of servers.

- Discord requires sharding once your bot hits 2,500+ servers
- Each shard is a separate process, handling a chunk of servers
- `ShardingManager` keeps shards in sync
- Logs and presences are separate per-shard (rotating every 30 seconds)
- Shards restart automatically if they die

**Example Presence (auto-rotates per shard):**
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
│   │   ├── index.ts        # Dev (single shard)
│   │   └── shard.ts        # Prod (sharding)
│   ├── commands/           # 900+ commands, 18 categories
│   ├── database/           # Database clients/models
│   ├── events/             # Discord event handlers
│   ├── features/           # Shared modules (like couples)
│   ├── handlers/           # Command, Event, AI, Cooldown handlers
│   ├── locales/            # en.json, fil.json for translations
│   ├── services/           # AI, Image, Weather, News, Spotify, etc.
│   ├── structures/         # BaseCommand, Client, AIEngine, Music, etc.
│   └── utils/              # Logger, Formatter, Permissions, etc.
├── prisma/
│   └── schema.prisma
├── lavalink/
│   └── application.yml
├── config.json
├── ecosystem.config.js
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Available Scripts

```
# Development
npm run dev      # Hot reload
npm run build    # Compile TypeScript
npm start        # Run prod build

# Database
npx prisma migrate dev
npx prisma generate
npx prisma studio

# Lint & Format
npm run lint
npm run format
```

### Adding a New Command

1. Put your command file in the right category, eg: `src/commands/utility/mycommand.ts`
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
      premiumTier: 'free',
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
Next time you start the bot, `CommandHandler` loads it automatically.

## 📊 Professional Logging System

Logs are structured (Winston-powered), shard-aware, and rotate daily.  
You get per-shard logs, remote webhook alerts, and all the granularity you want.

### Log Levels (`LOG_LEVEL` in `.env`)
| Level  | Symbol | When                             |
|--------|--------|----------------------------------|
| ERROR  | 🔴     | Crashes, fatal/unhandled errors  |
| WARN   | 🟠     | Warnings, high latency, deprecations |
| INFO   | 🟡     | Commands, joins, basic events    |
| DEBUG  | 🟢     | Detailed trace, dev stuff        |

### Log Files (14-day retention, 20MB per file)
```
logs/
├── combined-YYYY-MM-DD.log    # All logs (JSON)
├── error-YYYY-MM-DD.log       # Errors only
├── info-YYYY-MM-DD.log        # Info+
└── shards/
    ├── shard-0-YYYY-MM-DD.log
    └── shard-N-YYYY-MM-DD.log
```

### Child Loggers (by module)
Have a flood? Filter by `commands`, `music`, `ai`, etc.

### Discord Webhook Alerts
Set `LOG_WEBHOOK_URL` to instantly forward errors to your staff Discord channel (batched to avoid spam).

## 🤝 Contributing

Want to help out? Here’s how:

1. Fork this repo
2. Make a feature branch (`git checkout -b feature/amazing-feature`)
3. Write code, commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Coding style:**  
- TypeScript only for new stuff  
- Match the existing patterns  
- Comment complex code  
- Update the docs if needed

## 📄 License

MIT License (see [LICENSE](LICENSE)).

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) — Great Discord API lib
- [Lavalink](https://github.com/lavalink-devs/Lavalink) — Streaming
- [Prisma](https://www.prisma.io/) — The ORM
- [Kazagumo](https://github.com/kazugumo/Kazagumo) — Lavalink queueing
- [Winston](https://github.com/winstonjs/winston) — Logging
- Everyone who’s contributed, tested, or cheered for us

## 📞 Support

- **Discord Server:** [Support Server](https://discord.gg/panindigan)
- **Report Issues:** [GitHub Issues](https://github.com/nazzelofficial/panindigan-bot/issues)
- **Docs:** [Wiki](https://github.com/nazzelofficial/panindigan-bot/wiki)

## 🔗 Links

- [Invite Bot](https://discord.com/oauth2/authorize)
- [Vote for Bot](https://top.gg)
- [Donate](https://patreon.com)
- [GitHub](https://github.com/nazzelofficial/panindigan-bot)

---

Made with ❤️ by [Nazzel](https://github.com/nazzelofficial)
