# 🤖 Panindigan — All-in-One Discord Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

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
- Node.js 20.x or higher
- PostgreSQL 16.x or higher
- MongoDB 7.x or higher
- Redis 7.x or higher
- Lavalink 4.x (for music features)
- Discord Bot Token

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nazzelofficial/panindigan-bot-backup.git
cd panindigan-bot-backup
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Discord
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/panindigan
MONGO_URL=mongodb://user:password@localhost:27017/panindigan
REDIS_URL=redis://localhost:6379

# Lavalink
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=your_lavalink_password

# AI Services (Optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Bot Configuration
PREFIX=p!
OWNER_ID=your_user_id
SUPPORT_SERVER=your_support_server_id
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

## 🛠️ Development

### Project Structure
```
panindigan-bot/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── help/
│   │   ├── moderation/
│   │   ├── admin/
│   │   ├── music/
│   │   ├── economy/
│   │   ├── games/
│   │   ├── fun/
│   │   ├── ai/
│   │   ├── info/
│   │   ├── utility/
│   │   ├── social/
│   │   ├── leveling/
│   │   ├── giveaway/
│   │   ├── image/
│   │   ├── starboard/
│   │   ├── applications/
│   │   ├── premium/
│   │   └── owner/
│   ├── structures/        # Core structures
│   │   ├── BaseCommand.ts
│   │   ├── Client.ts
│   │   └── Shard.ts
│   ├── handlers/          # Event handlers
│   │   ├── CommandHandler.ts
│   │   ├── EventHandler.ts
│   │   └── CooldownHandler.ts
│   ├── services/          # External services
│   │   ├── AI/
│   │   ├── Database/
│   │   └── Music/
│   ├── utils/             # Utilities
│   │   ├── Logger.ts
│   │   ├── Formatter.ts
│   │   └── Constants.ts
│   ├── locales/           # Language files
│   │   ├── en.json
│   │   └── fil.json
│   └── index.ts           # Entry point
├── prisma/                # Prisma schema
├── lavalink/              # Lavalink config
├── logs/                  # Log files
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── CHANGELOG.md
├── README.md
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

### Adding Commands

1. Create a new command file in the appropriate category folder:
```typescript
// src/commands/category/commandname.ts
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CommandNameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'commandname',
      description: 'Command description',
      category: 'category',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/commandname', 'p!commandname'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    // Implementation
  }

  public async executePrefix(message: Message): Promise<void> {
    // Implementation
  }
}

export default CommandNameCommand;
```

2. The command will be automatically loaded by the CommandHandler.

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

- [Discord.js](https://discord.js.org/) - Amazing Discord API library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Lavalink](https://github.com/lavalink-devs/Lavalink) - Audio streaming
- All contributors and supporters

## 📞 Support

- **Join our Discord Server:** [Support Server](https://discord.gg/panindigan)
- **Report Issues:** [GitHub Issues](https://github.com/nazzelofficial/panindigan-bot/issues)
- **Documentation:** [Wiki](https://github.com/nazzelofficial/panindigan-bot/wiki)

## 🔗 Links

- [Invite Bot](https://discord.com/oauth2/authorize)
- [Vote for Bot](https://top.gg)
- [Donate](https://patreon.com)
- [GitHub](https://github.com/nazzelofficial/panindigan-bot

---

Made with ❤️ by [Nazzel](https://github.com/nazzelofficial)
