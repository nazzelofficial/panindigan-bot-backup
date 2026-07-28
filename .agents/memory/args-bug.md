---
name: Args parameter bug in executePrefix
description: All commands had _args as parameter name but referenced args (without underscore) in the body — fixed in bulk.
---

# Args Parameter Bug

## Rule
When writing new `executePrefix` implementations, always name the second parameter `args` (not `_args`). The base class uses `_args` to signal "unused", but any command that actually reads arguments must use `args`.

## Why
283 commands had `executePrefix(message: Message, _args: string[])` but then referenced `args[0]`, `args.join()`, etc. — causing `ReferenceError: args is not defined` at runtime, which manifested as "❌ An error occurred while executing this command." for every prefix command that takes arguments.

## How to apply
- New commands: use `args: string[]` as the parameter name in `executePrefix`
- Fixed via: `find src/commands -name "*.ts" | xargs grep -l "\bargs\b" | xargs -I{} sed -i 's/\b_args\b/args/g' {}`
- If a command truly doesn't use args, it's fine to keep `_args` — but if it references `args` anywhere in the body, use `args` as the parameter name
