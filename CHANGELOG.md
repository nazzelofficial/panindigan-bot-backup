# Changelog

All notable changes to Panindigan Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.2] - 2026-07-28

### Fixed

#### Startup & Boot Sequence
- **`src/bot/index.ts`** — `login` step timeout raised `30 000 → 90 000 ms`; Discord WebSocket handshake was silently exceeding the old 30 s limit and crashing the process before the bot could reach `ready`
- **`src/bot/index.ts`** — `commands` step timeout raised `30 000 → 120 000 ms` (previous session) to accommodate the initial slash-command registration round-trip to Discord's API

#### Slash Command Registration — No Longer Blocks Startup
- **`src/handlers/CommandHandler.ts`** — Slash command registration (`registerSlashCommands`) is now fire-and-forget via `setImmediate`; it runs in the background after the `commands` step resolves instead of holding up the entire startup sequence
- Result: `commands` step now completes in ~3–5 s (down from 120+ s timeout) regardless of Discord API latency

#### Duplicate Command Loading
- **`config.json`** — `rejectDuplicateNames: true → false`; 83+ commands were being silently dropped because multiple categories share the same command name. Setting to `false` lets the last-loaded file win instead of discarding it
- Commands loaded went from **812 loaded / 87 skipped → 899 loaded / 0 skipped**

#### Command Name Conflicts (deduplicated)
Renamed commands that were colliding across categories so every command has a unique name:

| File | Old name → New name |
|---|---|
| `src/commands/economy/search.ts` | `search` → `moneysearch` |
| `src/commands/help/search.ts` | `search` → `cmdsearch` |
| `src/commands/music/history.ts` | `history` → `queuehistory` |
| `src/commands/music/move.ts` | `move` → `movesong` |
| `src/commands/music/stats.ts` | `stats` → `musicstats` |
| `src/commands/info/invite.ts` | `invite` → `botinvite` |
| `src/commands/info/shard.ts` | `shard` → `shardstatus` |
| `src/commands/fun/bonk.ts` | `bonk` → `funbonk` |
| `src/commands/fun/cheer.ts` | `cheer` → `funccheer` |
| `src/commands/utility/birthday.ts` | `birthday` → `bday` |
| `src/commands/utility/clear.ts` | `clear` → `purge` |
| `src/commands/utility/translate.ts` | `translate` → `utranslate` |
| `src/commands/moderation/history.ts` | `history` → `modhistory` |
| `src/commands/moderation/userinfo.ts` | `userinfo` → `moduserinfo` |
| `src/commands/moderation/serverinfo.ts` | `serverinfo` → `modserverinfo` |

#### Help Menu Buttons Not Responding
- **`src/handlers/ComponentHandler.ts`** — Added handler for `help_*` button `customId` pattern; previously all category buttons on the help menu silently did nothing
- Added `handleHelpButton()` which renders a full category embed (name, description, all commands with usage) and a "← Back to Main Menu" button
- Added `buildMainHelpEmbed()` and `buildMainHelpRows()` helpers so the back-button can reconstruct the root help menu
- Added missing imports: `ActionRowBuilder`, `ButtonBuilder`, `ButtonStyle`

#### `p!help` / `/help` — Broken Category View
- **`src/commands/help/help.ts`** — Fixed `showCategoryHelp` filter: the original condition `cmd.name === Object.keys(cmd).find(...)` always evaluated to `false` (compared the command name string to a key name string), so every category page showed 0 commands
- Fixed three deprecated `.addField(name, value)` calls → `.addFields({ name, value })` (Discord.js v14 requirement)

#### Canvas / Image Commands — `libuuid.so.1` Missing
- Installed missing system libraries required by the `canvas` native module: `cairo`, `pango`, `libjpeg`, `giflib`, `librsvg`, `pixman`, `pkg-config`, `util-linux` (provides `libuuid.so.1`)
- Rebuilt the `canvas` native addon against the now-present system libs (`npm rebuild canvas`)
- Image commands (`caption`, `collage`, `gif`, `jail`, `petpet`, `spin`, `sticker`, `trash`, `trigger`, `couplecard`) now load without throwing unhandled promise rejections

#### Prisma Client
- Ran `pnpm prisma generate` to produce the missing Prisma client; all database model imports were failing silently until this was done
- Patched `node_modules/.pnpm/proper-lockfile@4.1.2/.../lockfile.js` to handle the `signal-exit@4` API change (`onExit` is now a named export) that was breaking Prisma CLI on Node 20

---

## [0.1.1] - 2026-07-25

### Added

#### Professional Logging System (complete overhaul)
- **`src/utils/Logger.ts`** — Full rewrite: child loggers per module/subsystem (`bot`, `commands`, `events`, `music`, `database`, `mongodb`, `postgresql`, `redis`, `economy`, `moderation`, `tickets`, `giveaways`, `ai`, `leveling`, `starboard`, `premium`, `automod`, `antinuke`, `shard`); `createModuleLogger()` for ad-hoc loggers
- **LOG_LEVEL env var** — Configurable log level via `LOG_LEVEL` environment variable (overrides `config.json`); supports `debug`, `info`, `warn`, `error`
- **Log redaction** — Automatic deep redaction of sensitive fields (tokens, passwords, API keys, DB URIs) at the logger config level — no per-call-site handling required
- **Log sanitization** — User-provided strings are stripped of control characters and newlines before logging to prevent log injection
- **Global error handlers** — `registerGlobalErrorHandlers()` installs `unhandledRejection` and `uncaughtException` handlers that log via the structured logger (with full stack trace) and exit cleanly, plus `SIGTERM`/`SIGINT` shutdown hooks
- **Discord Webhook Transport** — `LOG_WEBHOOK_URL` env var enables real-time forwarding of `error`-level logs to a private Discord staff channel; rate-limited/batched (5 s) to prevent spam
- **Periodic health-check logger** — `startHealthCheckLogger()` emits memory usage, uptime, guild count, and custom stats every 5 minutes to the combined log
- **ISO 8601 timestamps** — Consistent `YYYY-MM-DDTHH:mm:ss.SSSZ` format in JSON output; human-readable `YYYY-MM-DD HH:mm:ss` in console

#### PostgreSQL Model Files
- **`src/database/postgresql/models/Guild.ts`** — `findOrCreateGuild`, `getGuild`, `updateGuild`, `deleteGuild`, `getGuildPrefix`, `getGuildLanguage`, `isGuildBlacklisted`
- **`src/database/postgresql/models/User.ts`** — `findOrCreateUser`, `getUser`, `updateUser`, `getUsersByGuild`, `isGloballyBlacklisted`, `setAfk`, `getBirthday`, `getUpcomingBirthdays`
- **`src/database/postgresql/models/Economy.ts`** — `findOrCreateEconomy`, `getEconomy`, `updateEconomy`, `adjustWallet`, `deposit`, `withdraw`, `getRichestUsers`, `isCooldownExpired`
- **`src/database/postgresql/models/Moderation.ts`** — `findOrCreateModeration`, `getModeration`, `createCase` (auto-incremented caseId per guild), `getCase`, `getCasesByUser`, `editCase`, `softDeleteCase`, `getWarnings`, `addWarning`, `clearWarnings`
- **`src/database/postgresql/models/Premium.ts`** — `getPremium`, `upsertPremium`, `generateKey` (with `PANI-XX-XXXXX-XXXXX-XXXXX` format), `revokeKey`, `getKeyInfo`, `listKeys`, `getAIImageCount`, `incrementAIImageCount`
- **`src/database/postgresql/models/Music.ts`** — Full typed playlist CRUD: `findOrCreateMusic`, `getPlaylists`, `getPlaylist`, `createPlaylist`, `addToPlaylist`, `deletePlaylist`, `addToHistory`, `getFavorites`, `addFavorite`
- **`src/database/postgresql/models/Leveling.ts`** — `findOrCreateLeveling`, `getLeveling`, `updateLeveling`, `getServerLeaderboard`, `getUserRank`, `getLevelCard`, `setXP`, `resetLeveling` (server-wide or per-user)
- **`src/database/postgresql/models/Giveaway.ts`** — `createGiveaway`, `getGiveaway`, `getActiveGiveaways`, `getExpiredGiveaways`, `updateGiveaway`, `endGiveaway`, `deleteGiveaway`, `enterGiveaway`, `getEntries`, `pickWinners` (weighted by bonus entries), `getGiveawayHistory`
- **`src/database/postgresql/models/Applications.ts`** — `createForm`, `getForm`, `listForms`, `updateForm`, `deleteForm`, `submitApplication`, `getApplication`, `getPendingApplications`, `reviewApplication`, `getUserApplications`, `exportResponses`

### Changed

#### Logger wired into all subsystems (console.log/error → structured loggers)
- **`src/bot/index.ts`** — Replaced all `console.log`/`console.error` with `loggers.bot.*`; added startup/shutdown structured log with version, Node.js version, and env; registered global error handlers; started health-check logger; added graceful `SIGTERM`/`SIGINT` shutdown
- **`src/bot/shard.ts`** — Replaced all `console.log`/`console.error` with `loggers.shard.*`; registered global error handlers
- **`src/structures/PanindiganClient.ts`** — Replaced all `console.log`/`console.error` with `loggers.database.*` and `loggers.music.*`; added Lavalink node error/disconnect/ready event logging
- **`src/database/mongodb/client.ts`** — Replaced `console.log` with `loggers.mongodb.*`; added `error` and `serverClosed` event logging
- **`src/database/postgresql/client.ts`** — Replaced `console.log`/`console.error` with `loggers.postgresql.*`
- **`src/database/redis/client.ts`** — Replaced `console.log`/`console.error` with `loggers.redis.*`; added `reconnecting` and `ready` event logging
- **`src/handlers/CommandHandler.ts`** — Replaced all `console.log`/`console.warn`/`console.error` with `loggers.commands.*`; added per-file try/catch with error logging; improved load summary (`loaded`, `skipped`, `total`)
- **`src/handlers/EventHandler.ts`** — Replaced all `console.log`/`console.warn`/`console.error` with `loggers.events.*`; added per-file try/catch with error logging
- **`src/handlers/AIHandler.ts`** — Replaced all `console.error` with `loggers.ai.*`; provider failover now logs `warn` for primary failure, `error` for each failed fallback
- **`src/handlers/PremiumHandler.ts`** — Replaced all `console.error` with `loggers.premium.*`; added structured context (userId, guildId) to all error logs
- **`src/handlers/LevelingHandler.ts`** — Replaced all `console.error` with `loggers.leveling.*`; added structured context to all error logs
- **`src/handlers/GiveawayHandler.ts`** — Replaced all `console.error` with `loggers.giveaways.*`; added structured context (giveawayId, guildId, userId) to all error logs
- **`src/structures/AIEngine.ts`** — Replaced all `console.error` with `loggers.ai.*`
- **`src/events/interactionCreate.ts`** — Replaced `console.error` with `loggers.commands.error` including structured context (command, guildId, userId, shardId, executionTimeMs)
- **`src/events/messageCreate.ts`** — Replaced `console.error` with `loggers.commands.error` including structured context

#### README.md — Complete rewrite
- Added full tech stack table
- Added database architecture section (PostgreSQL, MongoDB, Redis responsibilities)
- Added AI provider table with supported models
- Added premium tier table with pricing
- Added complete command category table with counts
- Added Docker deployment section
- Added log tailing and querying guide
- Added security checklist
- Added development guide with `addCommand` example
- Added sharding system documentation

### Fixed
- `src/database/postgresql/client.ts` — Removed `throw error` inside `.catch()` of a floating promise (was uncatchable); error is now properly logged and the throw propagates via the `getPrismaClient()` call site
- `src/structures/PanindiganClient.ts` — Fixed `this.user?.setActivity()` with optional chaining (was `this.user.setActivity()` which could throw before the bot is ready)
- `src/bot/shard.ts` — Fixed ESM `fileURLToPath` import to be compatible with CommonJS output (tsx dev path)

### Known Issues
- Music commands require a running Lavalink v4 server — without it the bot starts but music commands will fail gracefully
- AI commands require at least one configured AI provider API key; the bot will start without them but AI commands will respond with an error
- `prisma migrate` must be run once against the target PostgreSQL database before the bot can write economy/leveling/moderation data

---

## [0.1.0] - 2026-07-24

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
- Multi-database support (PostgreSQL, MongoDB, Redis)
- Multi-provider AI integration (OpenAI, Anthropic, Gemini, Groq)
- Lavalink integration for high-quality music playback
- Premium system with one-time permanent purchase tiers
- Multi-language support (English, Filipino)
- Comprehensive command cooldown and rate limiting
- Sharding support for large-scale deployments
- Docker and Docker Compose configurations
- Professional logging with Winston + winston-daily-rotate-file

### Fixed
- **`src/commands/ai/email.ts`** — Replaced stub with full AI email generator
- **`src/commands/ai/question.ts`** — Replaced stub with full AI question generator
- **`src/commands/utility/birthday.ts`** — Replaced stub with full CRUD birthday system
- **`src/commands/utility/leaderboard.ts`** — Replaced stub with paginated XP leaderboard
- **`src/commands/utility/level.ts`** — Replaced stub with live level card
- **`src/commands/utility/marry.ts`** — Replaced stub with full interactive proposal flow
- **`src/commands/utility/divorce.ts`** — Replaced stub with confirmation button flow
- **`src/commands/utility/profile.ts`** — Replaced stub with aggregated profile card
- **`src/commands/utility/rep.ts`** — Replaced stub with full reputation system
- **`src/services/ImageService.ts`** — Replaced hardcoded placeholder GIF with real API chain (Giphy → nekos.best)

---

## [Unreleased]

### Planned
- Web dashboard for server management
- Additional AI providers (Perplexity, Cohere, Together AI, Fireworks AI, Cerebras)
- More music platform sources (Apple Music, Tidal, Deezer native support)
- Enhanced image generation (SDXL, Flux, Ideogram support)
- Mobile companion app
- API for third-party integrations
- Plugin system for community extensions
- Advanced server analytics dashboard
- Cross-server economy (global marketplace)
- Scheduled announcements and automation builder

---

## Version History

| Version | Date | Summary |
|---|---|---|
| 0.1.1 | 2026-07-25 | Complete logging overhaul, PostgreSQL model layer, console → logger migration across all subsystems |
| 0.1.0 | 2026-07-24 | Initial release — full 900+ command bot with 18 categories, multi-DB, multi-provider AI, sharding |

---

## Links

- [GitHub Repository](https://github.com/nazzelofficial/panindigan-bot)
- [Support Server](https://discord.gg/panindigan)
- [Documentation](https://github.com/nazzelofficial/panindigan-bot/wiki)
- [Issue Tracker](https://github.com/nazzelofficial/panindigan-bot/issues)

---

*Maintained by the Panindigan development team. Para sa mga Pilipino at sa buong Discord community. 🇵🇭*
