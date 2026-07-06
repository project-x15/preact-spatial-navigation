# @x15/spatial — Skills

## Spatial navigation engine

Arrow-key focus management for Preact apps on 2015-era smart TVs.

```
createSpatialEngine() → engine
engine.init()
engine.destroy()
engine.setKeyMap({ left: 37, right: 39, up: 38, down: 40, enter: 13 })
engine.addFocusable({ focusKey, node, ...opts })
engine.updateFocusable(focusKey, partialOpts)
engine.removeFocusable(focusKey)
engine.setFocus(focusKey) → Promise
engine.navigateByDirection('up'|'down'|'left'|'right') → Promise
engine.getCurrentFocusKey() → string | null
```

## Preact bindings

### useFocusable hook

Registers an element with the spatial engine and tracks focus state.

```
useFocusable({ focusKey, parentKey?, engine?, onFocus?, onBlur?, onEnter?, onArrow? })
  → { ref, focused, focusKey }
```

- `ref` — callback ref to attach to the DOM element
- `focused` — boolean, true when this element has focus
- `onArrow` — return false to prevent default navigation

### FocusableProvider

Provides the engine to all children via context.

```
<FocusableProvider engine={engine}>
  <App />
</FocusableProvider>
```

### FocusableRegion

Nested context for hierarchical focus trees. Children inherit parentKey.

```
<FocusableRegion focusKey="sidebar">
  <Tile focusKey="home" />
  <Tile focusKey="settings" />
</FocusableRegion>
```

## 2015 TV browser compatibility

- Targets Chromium 34 (Tizen 2.4) and Chromium 38 (webOS 1.x-2.x)
- ES5 output via Babel preset-env
- Single bundle, no code splitting
- No async/await, generators, Proxy, Map, Set, Symbol, or import() in output
- CSS: Flexbox only. No Grid, gap, custom properties, sticky, or backdrop-filter

## Build and test

```
pnpm install       # install dependencies
pnpm test          # run tests (node:test + jsdom)
pnpm build         # Rollup + Babel + type declarations
pnpm typecheck     # tsc --noEmit
pnpm release       # build + create git tag
```

## Release

GitHub Releases only. Push a tag (v*) to trigger CI:
- Runs tests
- Builds dist/
- Creates GitHub Release with dist/* attached

## Architecture

Thin wrapper around @noriginmedia/norigin-spatial-navigation-core.
Three source files: engine.ts (wrapper), preact.ts (hooks/context), types.ts (interfaces).
No deep abstraction layers. No Service/Manager/Factory patterns.
