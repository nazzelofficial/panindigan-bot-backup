---
name: Slash command bugs fixed
description: Two bugs that prevented slash commands from registering/working correctly
---

## Bug 1 — Premium tier hierarchy check (interactionCreate.ts)

**Rule:** Use `hasPremiumAccess()` from PremiumHandler, not equality comparison.

**Why:** The original check `command.premiumTier !== premiumTier` was equality — a Diamond user couldn't run Bronze commands. `hasPremiumAccess()` uses tier ordering (free < bronze < silver < gold < diamond) correctly.

**Fix applied:** `src/events/interactionCreate.ts` — replaced equality check with `await hasPremiumAccess(userId, guildId, command.premiumTier)`.

## Bug 2 — Slowmode option ordering (moderation.ts)

**Rule:** In Discord slash commands, all `setRequired(true)` options must come before `setRequired(false)` options within the same subcommand.

**Why:** Discord API error 50035 — `APPLICATION_COMMAND_OPTIONS_REQUIRED_INVALID`.

**Fix applied:** `src/commands/moderation/moderation.ts` slowmode subcommand — moved `seconds` (required) before `channel` (optional).

## Also changed
- Set premiumTier to 'free' on: ai, leveling, applications, image, starboard commands — so all commands are accessible to regular users.
