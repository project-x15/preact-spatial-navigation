# preact-spatial-navigation

Arrow-key focus for Preact apps on 2015 smart TVs. Targets Tizen 2.4 and webOS 1.x through 2.x.

It's built on the Norigin Spatial Navigation engine and bundled for Chromium 34 and 38. These browsers are old enough that they've never heard of CSS Grid.

> **Alpha.** The API might change. Test on real hardware before shipping.

## Install

```sh
npm install project-x15/preact-spatial-navigation preact
# or
pnpm add project-x15/preact-spatial-navigation preact
```

`preact` is a peer dependency. You bring your own.

## Quick start

```tsx
import { h, render } from 'preact'
import {
  createSpatialEngine,
  FocusableProvider,
  useFocusable,
} from '@x15/spatial'

const engine = createSpatialEngine()
engine.init()

function App() {
  return (
    <FocusableProvider engine={engine}>
      <Tile label="Movies" focusKey="tile-movies" />
      <Tile label="Music"  focusKey="tile-music" />
      <Tile label="Photos" focusKey="tile-photos" />
    </FocusableProvider>
  )
}

function Tile({ label, focusKey }: { label: string; focusKey: string }) {
  const { ref, focused } = useFocusable({ focusKey })

  return (
    <div
      ref={ref}
      style={{
        outline: focused ? '3px solid #00aaff' : '1px solid #333',
        padding: '24px',
        margin: '8px',
        background: focused ? '#1a1a2e' : '#16213e',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      {label}
    </div>
  )
}

render(h(App), document.getElementById('root'))
```

Press arrow keys to move focus between tiles. Enter activates the focused tile.

## API

### Engine

#### `createSpatialEngine()`

Creates an engine instance. Call `init()` once before adding focusable elements.

```ts
interface SpatialEngine {
  /** Start listening for key events. Safe to call multiple times. */
  init(): void

  /** Stop listening and tear down. */
  destroy(): void

  /** Map physical keys to directional actions. */
  setKeyMap(map: Record<string, string | number | (string | number)[]>): void

  /** Register a focusable element. */
  addFocusable(opts: FocusableOpts): void

  /** Update an existing focusable's options. */
  updateFocusable(focusKey: string, opts: Partial<FocusableOpts>): void

  /** Remove a focusable by key. */
  removeFocusable(focusKey: string): void

  /** Programmatically move focus to a specific key. */
  setFocus(focusKey: string): Promise<void>

  /** Navigate one step in a direction ('up'|'down'|'left'|'right'). */
  navigateByDirection(dir: string): Promise<void>

  /** The currently focused key, or null. */
  getCurrentFocusKey(): string | null
}
```

#### `FocusableOpts`

```ts
interface FocusableOpts {
  focusKey: string
  node: HTMLElement
  parentFocusKey?: string       // default: 'SN:ROOT'
  focusable?: boolean            // default: true
  isFocusBoundary?: boolean
  focusBoundaryDirections?: Direction[]
  saveLastFocusedChild?: boolean // default: true
  autoRestoreFocus?: boolean     // default: true
  forceFocus?: boolean
  onEnterPress?: () => void
  onArrowPress?: (dir: string) => boolean  // return false to block navigation
  onFocus?: () => void
  onBlur?: () => void
}
```

### Preact bindings

#### `<FocusableProvider>`

Provides the engine to all children via context.

```tsx
<FocusableProvider engine={engine}>
  {/* useFocusable hooks here */}
</FocusableProvider>
```

#### `useFocusable(options)`

```ts
interface UseFocusableOptions {
  focusKey: string
  parentKey?: string
  engine?: SpatialEngine          // override context
  onFocus?: () => void
  onBlur?: () => void
  onEnter?: () => void
  onArrow?: (dir: Direction) => boolean
}

interface UseFocusableResult {
  ref: (el: HTMLElement | null) => void
  focused: boolean
  focusKey: string
}
```

The `ref` callback registers and unregisters the element with the engine. `focused` is a reactive boolean you can use in render.

#### `<FocusableRegion>`

Nested context provider for nested focus trees. Children inherit `parentKey`.

```tsx
<FocusableRegion focusKey="sidebar">
  <Tile focusKey="sidebar-home" />
  <Tile focusKey="sidebar-settings" />
</FocusableRegion>
```

## Browser targets

| Platform | Browser | Engine |
|----------|---------|--------|
| Samsung Tizen 2.4 | Chromium 34 | ✅ |
| LG webOS 1.x through 2.x | Chromium 38 | ✅ |
| IE11 | Trident | ⚠️ (see below) |
| Modern browsers | Chrome, Firefox, Safari | ✅ |

The built bundle targets Chromium 34 via Babel `preset-env`. Output is ES5: `var`, function expressions, no `Symbol`, `Map`, `Set`, `Proxy`, `async`, or generators.

**IE11 note:** Norigin references `Symbol` internally with `typeof` guards. IE11 lacks `Symbol`.

The guards prevent crashes, but focus-tracking edge cases may differ. Test on real IE11 via BrowserStack if you need IE11 support.

## CSS constraints (2015 TV)

When styling focusable elements, avoid features missing from Chromium 34 and 38.

| Feature | Status | Fallback |
|---------|--------|----------|
| Flexbox | ✅ | |
| `gap` in flexbox | ❌ | `margin` on children |
| CSS Grid | ❌ | Flexbox |
| Custom Properties | ❌ | Sass variables |
| `aspect-ratio` | ❌ | Padding hack |
| `position: sticky` | ❌ | `position: fixed` |
| `backdrop-filter` | ❌ | Solid background |

## Development

```sh
pnpm install
pnpm typecheck
pnpm build
pnpm test
```

### Build output

```
dist/
  spatial.js          ESM bundle (199 KB)
  spatial.umd.js      UMD bundle (210 KB)
  spatial.js.map      Source map
  spatial.umd.js.map  Source map
  *.d.ts              TypeScript declarations
```

### Pipeline

```
TypeScript source → Babel (strip types + downlevel) → Rollup (bundle) → dist/
                                                         tsc (declarations only)
```

## Why not just use Norigin directly?

Norigin Spatial Navigation does the heavy lifting. This package adds Preact bindings: `useFocusable`, `FocusableProvider`, and `FocusableRegion` for nested trees. It also wraps Norigin's API so your code won't break when they bump a major version.

The build pipeline targets Chromium 34 with a single file. No code splitting, no surprises on decade-old browsers. You can tree-shake it too: import `@x15/spatial/engine` for vanilla JS or `@x15/spatial/preact` for Preact.

## License

MIT