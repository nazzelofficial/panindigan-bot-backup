---
name: Canvas libuuid system library fix
description: canvas native module requires system libs installed via Nix; npm rebuild needed after install.
---

## Rule
After any clean install, run `npm rebuild canvas` manually (or via postinstall) — the Nix packages alone are not enough.

**Why:** `canvas@3.x` ships a prebuilt `.node` binary that links against `libuuid.so.1` (from `util-linux`) and cairo/pango/etc. These are declared as Nix deps now, but `npm rebuild canvas` must be run to recompile the binding against the present system libs.

**How to apply:** `package.json` postinstall should include `npm rebuild canvas && pnpm prisma generate`. Required Nix packages: `cairo`, `pango`, `libjpeg`, `giflib`, `librsvg`, `pixman`, `pkg-config`, `util-linux`.
