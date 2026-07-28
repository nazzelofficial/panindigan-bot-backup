---
name: Command deduplication strategy
description: rejectDuplicateNames:false + manual renames → 899 commands loaded, 0 skipped.
---

## Rule
`config.json → loader.rejectDuplicateNames` must stay `false`. Do not rename commands back to their original names without checking for cross-category collisions first.

**Why:** Many categories share command names (e.g. `history` in both music and moderation, `search` in economy and help). With `rejectDuplicateNames:true`, the first-loaded file wins and the rest are silently dropped — went from 812/87 to 899/0 after fix + renames.

**How to apply:** If adding a new command whose name already exists in another category, give it a unique prefixed name (e.g. `modhistory`, `queuehistory`).
