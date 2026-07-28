---
name: Prisma v7 + pg SSL
description: Fix for "self-signed certificate in certificate chain" errors when using PrismaPg adapter.
---

# Prisma v7 + pg SSL fix

## Rule
When creating a `pg.Pool` for `PrismaPg`, strip SSL params from the URL and set explicit SSL options:

```ts
const u = new URL(postgresUrl);
u.searchParams.delete('sslmode');
u.searchParams.delete('ssl');
// ... delete other ssl params

const pool = new pg.Pool({
  connectionString: u.toString(),
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,  // bypass cert chain/hostname check
  },
});
```

## Why
Postgres hosting providers (Supabase, Neon, Railway, etc.) often use self-signed or intermediary certs. The URL's `?sslmode=require` conflicts with pg's ssl option, and `rejectUnauthorized: false` alone isn't enough — `checkServerIdentity` also needs to be overridden.

## How to apply
Fix lives in `src/database/postgresql/client.ts` in `initializePrisma()`.
