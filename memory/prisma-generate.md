---
name: Prisma generate required on fresh install
description: pnpm install alone doesn't generate the Prisma client; run pnpm prisma generate or pnpm install --force.
---

# Prisma generate required

## Rule
After any fresh `pnpm install`, run `pnpm prisma generate` before starting the bot. Without it, `@prisma/client` exports will be missing and the bot crashes with `SyntaxError: does not provide an export named 'PrismaClient'`.

## Why
The generated client lives in `.pnpm/@prisma+client@X.Y.Z/.../node_modules/@prisma/client` and isn't created by `pnpm install` alone. Prisma v7 uses a driver-adapter model that requires the generation step.

## How to apply
- On first deploy: `pnpm install --force && pnpm prisma generate`
- After schema changes: `pnpm prisma generate` (then `pnpm prisma migrate dev` for schema migrations)
- The workflow `pnpm dev` does NOT auto-generate — it must be done separately.
