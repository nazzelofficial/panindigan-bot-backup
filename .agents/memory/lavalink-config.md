---
name: Lavalink env-only config
description: Music system init pattern — env-driven, no hardcoded values, graceful skip when unconfigured.
---

# Lavalink env-only config

## Rule
Music (Kazagumo/Shoukaku) must only initialize when `LAVALINK_HOST` is explicitly set. Never hardcode defaults like `localhost`, `2333`, or `youshallnotpass`.

Supports two config modes (checked in order):
1. `LAVALINK_NODES` — JSON array: `[{"name":"Node1","host":"h","port":2333,"auth":"pass","secure":false}]`
2. Single-node: `LAVALINK_HOST` + `LAVALINK_PORT` + `LAVALINK_PASSWORD` + `LAVALINK_SECURE`

When neither is set, log a warn and return without initializing Kazagumo (`client.kazagumo` stays null). All music commands already guard `if (!client.kazagumo)`.

## Why
Hardcoded `|| 'localhost'` caused Shoukaku to connect to `127.0.0.1:2333` on every startup and spam ECONNREFUSED errors. Env-only makes the intent explicit and avoids noise.

## How to apply
`buildLavalinkNodes()` helper lives in `src/structures/PanindiganClient.ts`. Call it in `initializeMusic()` and bail early if it returns null.

## Shoukaku v4 node URL format
Pass `"host:port"` — **no protocol prefix**. Shoukaku builds the WebSocket URL itself using the `secure` flag.
