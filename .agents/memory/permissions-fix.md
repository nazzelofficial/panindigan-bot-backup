---
name: Permissions bitfield bug
description: PermissionsBitField.bitfield is a raw bigint — calling .has() on it throws. Always use the PermissionsBitField object directly.
---

# Permissions bitfield bug

## Rule
Never access `member.permissions.bitfield` and then call `.has()` on the result. `bitfield` returns a raw `bigint` which has no `.has()` method.

**Wrong:**
```ts
const perms = member.permissions.bitfield;
perms.has(PermissionFlagsBits.Connect); // TypeError: perms.has is not a function
```

**Correct:**
```ts
member.permissions.has(PermissionFlagsBits.Connect); // PermissionsBitField.has() works
```

## Why
`PermissionsBitField` (the object on `member.permissions`) has a `.has(PermissionResolvable)` method. `.bitfield` is the raw underlying `bigint` value — no methods.

## How to apply
Check any custom Permissions utility class. Replace `.bitfield.has()` with `.has()` directly on the `PermissionsBitField` object.
