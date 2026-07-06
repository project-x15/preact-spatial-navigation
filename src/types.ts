export type Direction = 'up' | 'down' | 'left' | 'right'

export interface FocusableOpts {
  focusKey: string
  node: HTMLElement
  parentFocusKey?: string
  focusable?: boolean
  isFocusBoundary?: boolean
  focusBoundaryDirections?: Direction[]
  saveLastFocusedChild?: boolean
  autoRestoreFocus?: boolean
  forceFocus?: boolean
  onEnterPress?: () => void
  onArrowPress?: (dir: string) => boolean
  onFocus?: () => void
  onBlur?: () => void
}

export interface SpatialEngine {
  init(): void
  destroy(): void
  setKeyMap(map: Record<string, string | number | (string | number)[]>): void
  addFocusable(opts: FocusableOpts): void
  updateFocusable(focusKey: string, opts: Partial<FocusableOpts>): void
  removeFocusable(focusKey: string): void
  setFocus(focusKey: string): Promise<void>
  navigateByDirection(dir: string): Promise<void>
  getCurrentFocusKey(): string | null
}
