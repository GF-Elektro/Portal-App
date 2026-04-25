---
trigger: always_on
---

All exported functions (both in `src/main.js` and `src/preload.js`) require a **JSDoc block**. This is a JavaScript (not TypeScript) project — no type annotations, but JSDoc `@param` and `@returns` tags are required for all non-trivial functions.

**Example:**
```javascript
/**
 * Shows the main application window and restores it from tray.
 * Also unhides the macOS dock icon if it was hidden.
 */
function showWindowFromTray() { ... }

/**
 * Creates and displays a toast notification window for platforms where
 * the native Notification API is unreliable (e.g., unsigned macOS builds).
 *
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 */
function showToastNotification(title, body) { ... }
```

**Scope:** Apply to all exported or module-level functions in `src/main.js` and `src/preload.js`. Inline helper closures do not require JSDoc unless they are complex.
