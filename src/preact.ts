/**
 * Preact bindings for spatial navigation.
 *
 * Provides useFocusable hook + FocusableProvider context.
 * Delegates to Norigin core for spatial algorithm and key handling.
 */

import { h, createContext, type Context } from 'preact'
import { useContext, useRef, useState } from 'preact/hooks'
import type { SpatialEngine, Direction } from './types.js'

interface FocusContextValue {
  engine: SpatialEngine
  parentKey: string | null
}

const FocusContext: Context<FocusContextValue | null> = createContext(null) as Context<FocusContextValue | null>

interface FocusableProviderProps {
  engine: SpatialEngine
  children?: preact.ComponentChildren
}

export function FocusableProvider({ engine, children }: FocusableProviderProps) {
  return h(FocusContext.Provider, { value: { engine: engine, parentKey: null } }, children)
}

export interface UseFocusableOptions {
  focusKey: string
  parentKey?: string
  /** Override engine from context */
  engine?: SpatialEngine
  /** Called when this element receives focus */
  onFocus?: () => void
  /** Called when this element loses focus */
  onBlur?: () => void
  /** Called on Enter press */
  onEnter?: () => void
  /** Override arrow press behavior. Return false to prevent default navigation. */
  onArrow?: (dir: Direction) => boolean
}

export interface UseFocusableResult {
  ref: (el: HTMLElement | null) => void
  focused: boolean
  focusKey: string
}

export function useFocusable(opts: UseFocusableOptions): UseFocusableResult {
  const ctx = useContext(FocusContext)
  const engine: SpatialEngine | null = opts.engine || (ctx ? ctx.engine : null)
  const parentKey = opts.parentKey || (ctx ? ctx.parentKey : null) || ''
  const elRef = useRef<HTMLElement | null>(null)
  const [focused, setFocused] = useState(false)

  if (!engine) {
    throw new Error(
      'useFocusable requires an engine. Pass it via options or wrap in <FocusableProvider>.'
    )
  }

  // Guard above narrows engine to non-null; capture once so the ref closure sees it
  const resolvedEngine = engine

  function ref(el: HTMLElement | null) {
    if (el) {
      elRef.current = el
      resolvedEngine.addFocusable({
        focusKey: opts.focusKey,
        node: el,
        parentFocusKey: parentKey || undefined,
        onEnterPress: opts.onEnter,
        onArrowPress: opts.onArrow as ((dir: string) => boolean) | undefined,
        onFocus: function () {
          setFocused(true)
          if (opts.onFocus) opts.onFocus()
        },
        onBlur: function () {
          setFocused(false)
          if (opts.onBlur) opts.onBlur()
        },
      })
    } else {
      elRef.current = null
      resolvedEngine.removeFocusable(opts.focusKey)
    }
  }

  return { ref: ref, focused: focused, focusKey: opts.focusKey }
}

interface FocusableRegionProps {
  focusKey: string
  engine?: SpatialEngine
  children?: preact.ComponentChildren
}

export function FocusableRegion({ focusKey, engine: engineProp, children }: FocusableRegionProps) {
  const ctx = useContext(FocusContext)
  const engine = engineProp || (ctx ? ctx.engine : null)

  if (!engine) {
    throw new Error(
      'FocusableRegion requires an engine. Pass it via props or wrap in <FocusableProvider>.'
    )
  }

  return h(FocusContext.Provider, {
    value: { engine: engine, parentKey: focusKey }
  }, children)
}
