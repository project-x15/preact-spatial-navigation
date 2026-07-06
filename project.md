# @x15/spatial — Project Overview

Arrow-key focus management for Preact apps running on 2015-era smart TV platforms. Targets Samsung Tizen 2.4 (Chromium 34) and LG webOS 1.x through 2.x (Chromium 38).

## Why this exists

Smart TV browsers from 2015 lack native spatial navigation. Users navigate with arrow keys, not a mouse. This library provides a focus management system that works within the severe constraints of decade-old browser engines.

The Norigin Spatial Navigation engine (production-proven on Firefox OS, Tizen, and webOS) handles the spatial algorithm. This package wraps it with Preact bindings and a stable API surface.

## Architecture

```
┌─────────────────────────────────────┐
│  Consumer App (Preact)              │
│  <FocusableProvider>                │
│    <FocusableRegion>                │
│      <Tile useFocusable={...} />    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  @x15/spatial                       │
│  ┌──────────┐  ┌────────────────┐  │
│  │ engine.ts│  │ preact.ts      │  │
│  │ (wrapper)│  │ (hooks/context) │  │
│  └────┬─────┘  └───────┬────────┘  │
│       │                │            │
│  ┌────▼────────────────▼────────┐  │
│  │ types.ts (interfaces)        │  │
│  └──────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  @noriginmedia/norigin-spatial-    │
│  navigation-core                    │
│  (spatial algorithm, key events)   │
└─────────────────────────────────────┘
```

### Source files

| File | Responsibility | Lines |
|------|---------------|-------|
| `src/types.ts` | Direction, FocusableOpts, SpatialEngine interface | 30 |
| `src/engine.ts` | createSpatialEngine() factory, Norigin delegation | 107 |
| `src/preact.ts` | useFocusable hook, FocusableProvider, FocusableRegion | 110 |
| `src/index.ts` | Public API re-exports | 12 |

### Engine wrapper (engine.ts)

`createSpatialEngine()` returns a `SpatialEngine` with methods that delegate to Norigin's `SpatialNavigation` singleton. The wrapper:

- Guards against double init/destroy
- Maps `FocusableOpts` to Norigin's `FocusableComponent` shape
- Provides defaults for all optional callbacks (no-op functions)
- Casts at the boundary where Norigin doesn't export types

### Preact bindings (preact.ts)

Three exports:

- **`FocusableProvider`** — context provider that holds the engine instance and a parentKey (null for root)
- **`useFocusable(options)`** — hook that registers/unregisters an element via a ref callback, exposes a `focused` boolean
- **`FocusableRegion`** — nested context provider that sets parentKey for children, enabling hierarchical focus trees

The `ref` callback pattern handles both mount (register) and unmount (unregister) in one function. The `focused` state is managed via `useState` and updated in the `onFocus`/`onBlur` callbacks.

## Build pipeline

```
TypeScript source
  → Babel (@babel/preset-env targets Chrome 34, @babel/preset-typescript strips types)
  → Rollup (bundles to single ESM + UMD files, excludes preact)
  → dist/spatial.js, dist/spatial.umd.js
  → tsc --emitDeclarationOnly → dist/*.d.ts
```

Key decisions:
- Babel strips types (not tsc) because Rollup's Babel plugin runs first
- tsc only emits declarations, no JS output
- `preact` is external — not bundled, consumers bring their own
- Single-file output — no code splitting (Chromium 34 doesn't support it)

## Browser constraints

The built bundle targets Chromium 34. Output is ES5:

- `var` instead of `const`/`let`
- Function expressions instead of arrow functions
- No `Symbol`, `Map`, `Set`, `Proxy`, `async/await`, generators, or `import()`

CSS constraints for consumer apps:
- Flexbox only. No CSS Grid, no `gap`, no custom properties, no `position: sticky`, no `backdrop-filter`
- Use `margin` on children instead of `gap`
- Use `position: fixed` instead of `sticky`
- Use Sass variables instead of CSS custom properties

## Testing

Tests use `node:test` with `jsdom` for DOM environment. No test runner dependency.

- `test/engine.test.ts` — 9 tests covering engine lifecycle, focus registration, navigation, callbacks
- `test/preact.test.ts` — 6 tests covering useFocusable mount/unmount, focus/blur callbacks, context provider, region nesting

Run with: `pnpm test` (node --import tsx --test)

## Release

GitHub-based releases only. No npm publishing.

1. Bump `version` in `package.json`
2. `pnpm release` — builds and creates a git tag
3. `git push --tags` — triggers GitHub Actions workflow
4. CI runs tests, builds, creates a GitHub Release with `dist/*` attached

## Coding conventions

See `AGENTS.md` for the full standard. Key rules observed in this codebase:

- One file, one responsibility
- Functions under 50 lines, do one thing
- Early returns, flat control flow
- Explicit state (engine passed via props or context, never global)
- No deep abstraction layers (thin wrapper, no Service/Manager/Factory)
- Comments explain why, not what (e.g., Norigin type cast workaround)
- Tests verify behavior (callbacks fire, focus moves), not implementation