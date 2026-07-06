/**
 * Spatial navigation engine — thin wrapper around Norigin core.
 *
 * Norigin core handles:
 *   - Firefox OS spatial algorithm (production-proven on Tizen/webOS)
 *   - Key event binding (keydown/keyup on document)
 *   - Focus boundaries, auto-restore, force-focus
 *   - RTL support, custom distance calculation
 *
 * This wrapper provides a stable API for the Preact bindings
 * while delegating all spatial logic to Norigin.
 */

import {
  SpatialNavigation,
  init as noriginInit,
  destroy as noriginDestroy,
  setKeyMap as noriginSetKeyMap,
} from '@noriginmedia/norigin-spatial-navigation-core'
import type { FocusableComponent } from '@noriginmedia/norigin-spatial-navigation-core'
import type { FocusableOpts, SpatialEngine } from './types.js'

export function createSpatialEngine(): SpatialEngine {
  let initialized = false

  function init(): void {
    if (initialized) return
    noriginInit({
      shouldFocusDOMNode: true,
      throttle: 0,
      throttleKeypresses: false,
    })
    initialized = true
  }

  function destroy(): void {
    noriginDestroy()
    initialized = false
  }

  function setKeyMap(
    map: Record<string, string | number | (string | number)[]>
  ): void {
    noriginSetKeyMap(map)
  }

  function addFocusable(opts: FocusableOpts): void {
    const noriginOpts: FocusableComponent = {
      focusKey: opts.focusKey,
      node: opts.node,
      parentFocusKey: opts.parentFocusKey || 'SN:ROOT',
      focusable: opts.focusable !== false,
      isFocusBoundary: opts.isFocusBoundary || false,
      focusBoundaryDirections: opts.focusBoundaryDirections,
      saveLastFocusedChild: opts.saveLastFocusedChild !== false,
      autoRestoreFocus: opts.autoRestoreFocus !== false,
      forceFocus: opts.forceFocus || false,
      onEnterPress: opts.onEnterPress || function () {},
      onEnterRelease: function () {},
      onArrowPress: opts.onArrowPress || function () { return true },
      onArrowRelease: function () {},
      onFocus: opts.onFocus || function () {},
      onBlur: opts.onBlur || function () {},
      onUpdateFocus: function () {},
      onUpdateHasFocusedChild: function () {},
      trackChildren: false,
    }
    SpatialNavigation.addFocusable(noriginOpts)
  }

  function updateFocusable(focusKey: string, opts: Partial<FocusableOpts>): void {
    // Norigin doesn't export the update payload type; cast at the boundary
    const noriginOpts: Partial<FocusableComponent> = {
      node: opts.node,
      focusable: opts.focusable,
      isFocusBoundary: opts.isFocusBoundary,
      focusBoundaryDirections: opts.focusBoundaryDirections,
      onEnterPress: opts.onEnterPress,
      onArrowPress: opts.onArrowPress,
      onFocus: opts.onFocus,
      onBlur: opts.onBlur,
    }
    SpatialNavigation.updateFocusable(
      focusKey,
      noriginOpts as Parameters<typeof SpatialNavigation.updateFocusable>[1]
    )
  }

  function removeFocusable(focusKey: string): void {
    SpatialNavigation.removeFocusable({ focusKey: focusKey })
  }

  function setFocus(focusKey: string): Promise<void> {
    return SpatialNavigation.setFocus(focusKey)
  }

  function navigateByDirection(dir: string): Promise<void> {
    return SpatialNavigation.navigateByDirection(dir)
  }

  function getCurrentFocusKey(): string | null {
    return SpatialNavigation.getCurrentFocusKey() || null
  }

  return {
    init: init,
    destroy: destroy,
    setKeyMap: setKeyMap,
    addFocusable: addFocusable,
    updateFocusable: updateFocusable,
    removeFocusable: removeFocusable,
    setFocus: setFocus,
    navigateByDirection: navigateByDirection,
    getCurrentFocusKey: getCurrentFocusKey,
  }
}
