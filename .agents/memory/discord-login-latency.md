---
name: Discord gateway login latency
description: client.login() / clientReady can take 90–120s+ from Replit; login step must be non-fatal.
---

## Rule
Never crash the process if Discord's `clientReady` event is delayed. The login step must fire `client.login()` without awaiting it, wait for `clientReady` with a generous timeout (120 s+), and resolve (not reject) on timeout so Discord.js can reconnect naturally.

**Why:** Replit's outbound networking to Discord's gateway introduces variable latency. After multiple rapid restarts, Discord rate-limits IDENTIFY payloads. Making the step non-fatal keeps the process alive for the automatic reconnect.

**How to apply:** In `src/bot/index.ts` `login` runStep — the inner Promise resolves on both `clientReady` and timeout (timeout just logs a WARN). `isBotReady` is set to `true` only inside the `clientReady` handler.
