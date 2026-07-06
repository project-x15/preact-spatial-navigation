



## CSS Constraints (2015 TV)

| Feature | Chromium 38 | Fallback |
|---------|-------------|----------|
| Flexbox | ✅ Unprefixed since Chrome 29 | — |
| `gap` in flexbox | ❌ Chrome 84+ | Use `margin` on children |
| CSS Grid | ❌ Chrome 57+ | Flexbox + float fallbacks |
| Custom Properties | ❌ Chrome 49+ | Sass variables (compile-time) |
| `aspect-ratio` | ❌ Chrome 88+ | Padding hack |
| `object-fit` | ✅ Chrome 32+ | — |
| WebP | ✅ Chrome 23+ | — |
| Transitions | ✅ Chrome 26+ | — |
| `position: sticky` | ❌ Chrome 56+ | `position: fixed` fallback |
| `backdrop-filter` | ❌ Chrome 76+ | Solid background fallback |

**Rule:** Flexbox only. No Grid. No `gap`. No custom properties. No `sticky`. No `backdrop-filter`.




## Guard Rails

### Feature Blacklist (CI-enforced)

```
❌ async/await        → use Promises or callbacks
❌ generators         → avoid
❌ Proxy              → cannot polyfill
❌ Map/Set            → use plain objects/arrays
❌ Symbol             → avoid
❌ import()           → single bundle, no code splitting
❌ CSS Grid           → flexbox only
❌ CSS custom props   → Sass variables
❌ gap                → margin on children
❌ position: sticky   → fixed fallback
❌ backdrop-filter    → solid background
```


## Testing Strategy

| Platform | Tool |
|----------|------|
| Chromium 38 (WebOS) | WebOS SDK emulator (LG) |
| Chromium 34 (Tizen) | Tizen SDK emulator (Samsung) |
| IE11 (baseline) | BrowserStack |
| Modern browsers | Playwright (Chrome, Firefox, Safari) |
| TV spatial nav | Real device (rent or buy used 2015 TV) |

---
