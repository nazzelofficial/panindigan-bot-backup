---
name: Slash command registration must be non-blocking
description: registerSlashCommands() must run in background (setImmediate), not block the commands startup step.
---

## Rule
In `src/handlers/CommandHandler.ts`, the call to `registerSlashCommands(client)` is wrapped in `setImmediate(() => { ... .catch(...) })` so it runs after the startup step resolves.

**Why:** Registering 100 slash commands against Discord's REST API takes 30–120 s. Awaiting it inside the `commands` runStep caused consistent 120 s timeouts that crashed startup.

**How to apply:** Keep the `setImmediate` wrapper. If slash registration logic needs to be awaited for some reason, move it to a dedicated background task after the bot reaches `clientReady`.
