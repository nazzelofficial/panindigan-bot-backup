---
name: Prisma setup quirks
description: How to correctly set up Prisma 7 on Replit for this project
---

## Rule
Run `pnpm add prisma@7.9.1 @prisma/client@7.9.1 @prisma/adapter-pg@7.9.1 --force` before `pnpm prisma:generate` if `@prisma/debug` is missing.

**Why:** Replit's pnpm install sometimes leaves Prisma engine packages in a broken state; `--force` re-downloads them cleanly.

## How to apply
- After any fresh clone or environment reset, run the force-add before generating.
- If DB already has tables (production), use `pnpm prisma db push` — not `migrate deploy` (which requires migration files and fails with P3005 if the DB is non-empty).
