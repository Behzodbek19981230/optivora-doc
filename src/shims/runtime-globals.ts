// Some third-party packages assume Node.js globals exist in the browser.
// Vite doesn't polyfill these by default, so we provide minimal shims.

// `global` (Node) -> `globalThis` (browser)
if (typeof (globalThis as any).global === 'undefined') {
  ;(globalThis as any).global = globalThis
}

// Minimal `process.env` shim (often used in UMD/CJS bundles)
if (typeof (globalThis as any).process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
} else if (typeof (globalThis as any).process.env === 'undefined') {
  ;(globalThis as any).process.env = {}
}
