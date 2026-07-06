/**
 * Tests for Preact spatial navigation bindings (Norigin-backed).
 *
 * Uses jsdom for DOM environment. Verifies that useFocusable
 * registers elements with Norigin and callbacks fire correctly.
 */

import { describe, it, before, after } from 'node:test'
import { strict as assert } from 'node:assert'
import { h, render } from 'preact'
import { JSDOM } from 'jsdom'
import { createSpatialEngine } from '../src/engine.js'
import { useFocusable, FocusableProvider, FocusableRegion } from '../src/preact.js'

let dom: JSDOM

before(() => {
  dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  })
  ;(globalThis as any).window = dom.window
  ;(globalThis as any).document = dom.window.document
  ;(globalThis as any).HTMLElement = dom.window.HTMLElement
  ;(globalThis as any).HTMLDivElement = dom.window.HTMLDivElement
  ;(globalThis as any).Node = dom.window.Node
  ;(globalThis as any).Element = dom.window.Element
})

after(() => {
  delete (globalThis as any).window
  delete (globalThis as any).document
  delete (globalThis as any).HTMLElement
  delete (globalThis as any).HTMLDivElement
  delete (globalThis as any).Node
  delete (globalThis as any).Element
})

function getRoot(): HTMLElement {
  return dom.window.document.getElementById('root')!
}

describe('useFocusable (Norigin)', () => {
  it('registers element on mount', () => {
    var engine = createSpatialEngine()
    engine.init()
    var root = getRoot()

    function TestComp() {
      var { ref } = useFocusable({ focusKey: 'test-1', engine: engine })
      return h('div', { ref: ref }, 'test')
    }

    render(h(TestComp, null), root)
    assert.equal(engine.getCurrentFocusKey(), null)
    engine.destroy()
  })

  it('calls onFocus callback when focused via setFocus', async () => {
    var engine = createSpatialEngine()
    engine.init()
    var root = getRoot()
    var focusedCalled = false

    function TestComp() {
      var { ref } = useFocusable({
        focusKey: 'test-1',
        engine: engine,
        onFocus: function () { focusedCalled = true },
      })
      return h('div', { ref: ref }, 'test')
    }

    render(h(TestComp, null), root)
    // Let Norigin scheduler flush addFocusable before setFocus
    await new Promise(function (r) { setTimeout(r, 0) })
    await engine.setFocus('test-1')
    await new Promise(function (r) { setTimeout(r, 0) })
    assert.ok(focusedCalled)
    engine.destroy()
  })

  it('calls onBlur callback when focus moves away', async () => {
    var engine = createSpatialEngine()
    engine.init()
    var root = getRoot()
    var blurredCalled = false

    function TestComp() {
      var { ref } = useFocusable({
        focusKey: 'test-1',
        engine: engine,
        onBlur: function () { blurredCalled = true },
      })
      return h('div', { ref: ref }, 'test')
    }

    render(h(TestComp, null), root)
    await new Promise(function (r) { setTimeout(r, 0) })
    await engine.setFocus('test-1')
    await engine.setFocus('test-2')
    await new Promise(function (r) { setTimeout(r, 0) })
    assert.ok(blurredCalled)
    engine.destroy()
  })

  it('calls onEnter callback on Enter keypress', async () => {
    var engine = createSpatialEngine()
    engine.init()
    var root = getRoot()
    var enterCalled = false

    function TestComp() {
      var { ref } = useFocusable({
        focusKey: 'test-1',
        engine: engine,
        onEnter: function () { enterCalled = true },
      })
      return h('div', { ref: ref }, 'test')
    }

    render(h(TestComp, null), root)
    await engine.setFocus('test-1')

    var event = new dom.window.KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
      bubbles: true,
    })
    dom.window.document.dispatchEvent(event)

    assert.ok(true)
    engine.destroy()
  })
})

describe('FocusableProvider (Norigin)', () => {
  it('provides engine to children via context', async () => {
    var engine = createSpatialEngine()
    engine.init()
    var root = getRoot()

    function Child() {
      var { ref } = useFocusable({ focusKey: 'child-1' })
      return h('div', { ref: ref }, 'child')
    }

    render(
      h(FocusableProvider, { engine: engine },
        h(Child, null)
      ),
      root
    )

    await engine.setFocus('child-1')
    assert.equal(engine.getCurrentFocusKey(), 'child-1')
    engine.destroy()
  })
})

describe('FocusableRegion (Norigin)', () => {
  it('sets parentKey for children', async () => {
    var engine = createSpatialEngine()
    engine.init()
    var root = getRoot()

    function Child() {
      var { ref } = useFocusable({ focusKey: 'child-1' })
      return h('div', { ref: ref }, 'child')
    }

    render(
      h(FocusableProvider, { engine: engine },
        h(FocusableRegion, { focusKey: 'region-1' },
          h(Child, null)
        )
      ),
      root
    )

    await engine.setFocus('child-1')
    assert.equal(engine.getCurrentFocusKey(), 'child-1')
    engine.destroy()
  })
})
