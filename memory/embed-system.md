---
name: EmbedSystem — modern UI utility
description: src/utils/EmbedSystem.ts provides the premium embed/button/pagination system for the bot's UI.
---

# EmbedSystem Utility

## Rule
All new and modernized commands should import from `../../utils/EmbedSystem.js` instead of using raw `EmbedBuilder` colors or COLORS/EMOJIS constants.

## Exports
- `PALETTE` — color constants (primary, success, error, warning, moderation, economy, leveling, music, ai, etc.)
- `KIT` — emoji constants (success, error, mod, economy, leveling, etc.)
- `divider()` — returns a visual divider string for embed sections
- `successEmbed(title, desc)` / `errorEmbed(title, desc)` / `warningEmbed` / `infoEmbed` / `loadingEmbed`
- `modEmbed` / `economyEmbed` / `levelingEmbed` / `premiumEmbed` / `aiEmbed` / `musicEmbed`
- `paginationRow(page, total, prefix)` — standard pagination buttons
- `confirmRow(prefix)` / `closeRow(prefix)` — action buttons
- `paginate(source, pages, prefix, timeout?)` — full pagination handler

## Why
Created to replace inconsistent COLORS/EMOJIS usage across 900 commands with a unified design system matching the premium design brief.

## How to apply
```typescript
import { PALETTE, KIT, divider, errorEmbed } from '../../utils/EmbedSystem.js';
// or from deeper paths:
import { PALETTE, KIT, errorEmbed } from '../../../utils/EmbedSystem.js';
```
Also: `Formatter.formatUptime(ms)` was added to `src/utils/Formatter.ts` — use it instead of manual uptime calculation.
