# Changelog

All notable changes to Panindigan Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-07-24

### Added
- Initial release of Panindigan Bot
- Core bot infrastructure with TypeScript and Discord.js v14
- Command system supporting both slash and prefix commands
- 900+ commands across 18 categories:
  - Help (15 commands)
  - Moderation (50 commands)
  - Admin/Setup (45 commands)
  - Music (60 commands)
  - Economy (80 commands)
  - Games (65 commands)
  - Fun (68 commands)
  - AI (65 commands)
  - Info (48 commands)
  - Utility (65 commands)
  - Social (80 commands)
  - Leveling (25 commands)
  - Giveaway (22 commands)
  - Image (30 commands)
  - Starboard (12 commands)
  - Applications (18 commands)
  - Premium (30 commands)
  - Owner (122 commands)

### Fixed
- **`src/commands/ai/email.ts`** — Replaced stub with full AI email generator using `AIHandler.generateTaskResponse()`; slash options for topic, tone (professional/casual/formal/friendly/persuasive), and recipient
- **`src/commands/ai/question.ts`** — Replaced stub with full AI question generator supporting question types (discussion/trivia/debate/icebreaker/interview/philosophical) and configurable count; parses numbered-list responses
- **`src/commands/utility/birthday.ts`** — Replaced stub with full CRUD birthday system (set/view/list/remove) backed by `User.birthday` in PostgreSQL via Prisma; shows countdown in days
- **`src/commands/utility/leaderboard.ts`** — Replaced stub with paginated XP leaderboard reading from the `Leveling` table; interactive prev/next buttons; rank medal formatting
- **`src/commands/utility/level.ts`** — Replaced stub with live level card reading from the `Leveling` table; shows level, XP, visual progress bar, server rank, and message/voice stats
- **`src/commands/utility/marry.ts`** — Replaced stub with full interactive proposal flow using Discord buttons; creates `Couple` record in Prisma; checks for existing marriages; updates `User.spouseId` and `User.marriedAt`
- **`src/commands/utility/divorce.ts`** — Replaced stub with confirmation button flow; deletes `Couple` record and clears spouse fields on both users in Prisma
- **`src/commands/utility/profile.ts`** — Replaced stub with aggregated profile card pulling from `User`, `Economy`, `Leveling`, `Couple`, and `Premium` tables; displays level, wallet/bank/networth, rep, partner, premium tier, bio, and birthday
- **`src/commands/utility/rep.ts`** — Replaced stub with full reputation system; give/view subcommands; 24-hour cooldown via `User.lastRepGiven`; increments `User.repPoints`; shows server rank by rep count
- **`src/services/ImageService.ts`** — Replaced hardcoded placeholder GIF URL with a real fallback chain: Giphy API (when key is set) → nekos.best free API → descriptive error thrown

### Features
- Multi-database support (PostgreSQL, MongoDB, Redis)
- Multi-provider AI integration (OpenAI, Anthropic, Gemini, Groq)
- Lavalink integration for high-quality music playback
- Premium system with one-time permanent purchase tiers
- Multi-language support (English, Filipino)
- Comprehensive command cooldown and rate limiting
- Sharding support for large-scale deployments
- Docker and Docker Compose configurations
- Professional logging and error handling

### Database
- PostgreSQL integration with Prisma ORM
- MongoDB for flexible document storage
- Redis for caching and rate limiting
- Comprehensive database schemas for all features

### AI Services
- OpenAI GPT models integration
- Anthropic Claude integration
- Google Gemini integration
- Groq AI integration
- Extensible AI service architecture

### Music
- Lavalink 4.x integration
- Support for YouTube, SoundCloud, Twitch, and more
- Queue management and playlist support
- Audio filters and effects
- Volume control and seeking

### Economy
- Virtual currency system
- Shops and trading
- Daily rewards and bonuses
- Gambling and games
- Leaderboards and rankings

### Premium System
- Free tier with basic features
- Bronze, Silver, Gold, Diamond tiers
- One-time permanent purchase model
- Exclusive features per tier
- Fair and affordable pricing

### Localization
- English (en) language file
- Filipino (fil) language file
- Extensible locale system
- Command descriptions in multiple languages

### Infrastructure
- Docker containerization
- Docker Compose for easy deployment
- Environment-based configuration
- Health checks and monitoring
- Automatic restarts

### Documentation
- Comprehensive README.md
- Detailed installation instructions
- Usage examples for all categories
- Development guidelines
- Contributing guidelines

### Security
- Secure environment variable handling
- Permission-based command access
- Rate limiting and cooldowns
- Input validation and sanitization
- Error handling and logging

### Developer Experience
- TypeScript for type safety
- Hot reload in development
- ESLint and Prettier configuration
- Clear project structure
- Extensible command architecture

### Known Issues
- `@sapphire/discord.js-utilities@^3.2.3` has no matching npm version — `npm install` fails until the version pin is corrected
- `Guild.xpMultiplier` and `Guild.levelUpMessage` fields referenced in `levelconfig.ts` are not yet in `prisma/schema.prisma` — writes silently no-op until the schema is migrated
- AI services require API keys to function
- Music features require a running Lavalink server

### Dependencies
- discord.js ^14.14.0
- @prisma/client ^5.10.0
- mongodb ^6.3.0
- redis ^4.6.0
- openai ^4.24.0
- @anthropic-ai/sdk ^0.17.0
- @google/generative-ai ^0.2.0
- groq-sdk ^0.3.0
- @discordjs/voice ^0.16.0
- And many more…

---

## [Unreleased]

### Planned
- Complete implementation of pending command categories
- Web dashboard for server management
- Advanced analytics and statistics
- Custom command builder
- Plugin system for extensions
- More AI providers and models
- Enhanced music features
- Mobile app companion
- API for third-party integrations

### Under Consideration
- Voice channel activities
- Custom emojis and stickers
- Advanced moderation tools
- Server templates
- Role management automation
- Scheduled commands
- Cross-server communication
- Advanced economy features

---

## Version History

### 0.1.0 (2024-07-24)
- Initial release with core infrastructure complete
- 900+ commands planned across 18 categories
- All previously stubbed utility and AI commands replaced with full implementations backed by Prisma, Discord buttons, and live AI calls
- ImageService GIF fallback replaced with real API chain (Giphy → nekos.best)

---

## Links

- [GitHub Repository](https://github.com/nazzelofficial/panindigan-bot)
- [Support Server](https://discord.gg/panindigan)
- [Documentation](https://github.com/nazzelofficial/panindigan-bot/wiki)
- [Issue Tracker](https://github.com/nazzelofficial/panindigan-bot/issues)

---

**Note:** This changelog is maintained by the Panindigan development team. For detailed information about specific changes, please refer to the commit history on GitHub.
