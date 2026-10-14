---
name: "Portal-App Agent Instructions"
description: "Instructions for AI agents working on the GF-Elektro Electron desktop wrapper."
---

# Portal-App Agent Instructions

Thin Electron desktop wrapper that loads `https://portal.gfelektro.com` in a `BrowserWindow`. No frontend code. Two source files: `src/main.js` (main process) and `src/preload.js` (preload/bridge).

## Essential Commands
```bash
npm start          # Run in dev mode (electron .)
npm run build      # Build installers → release/ (electron-builder)
npm run build:win  # Build Windows installers on Windows
npm run build:mac  # Build macOS DMG on a Mac
```

## Key Constraints

- **JavaScript only** (no TypeScript, no transpiler, no bundler for app code).
- **No test runner** — `test-*.js` files are scratch scripts, not a suite.
- **Tray-first lifecycle** — window close hides, does not quit. Use `showWindowFromTray()` / `hideWindowToTray()`.
- **`isCreatingToast` flag** — must not be removed; guards toast BrowserWindow from auth popup handler.
- **Auth allowlists** — add new Firebase/Google auth hosts only through exact host or suffix rules in `src/main.js`.
- **Single build toolchain** — `electron-builder` is used for CI and local platform builds.

For detailed coding rules, see `.agent/rules/`.
For authorized scripts, see `.agent/workflows/allow_scripts.md`.

## Cursor Cloud specific instructions

### Running the Electron app in a headless Cloud VM

The VM has a VNC display server on `:1` (TigerVNC). To run the app visually:

```bash
DISPLAY=:1 npx electron . --disable-gpu --no-sandbox
```

GPU errors in the logs (WebGL fallback, `viz_main_impl`, `gles2_cmd_decoder`) are expected and harmless — the app still functions correctly with software rendering.

### Verification without a test runner

There is no linter, no test framework, and no typecheck. The minimal verification steps are:

1. `node --check src/main.js && node --check src/preload.js` — syntax validation.
2. `DISPLAY=:1 npx electron . --disable-gpu --no-sandbox` — confirm the app launches and loads the portal URL.
3. `npx electron-builder build --linux --dir` — confirm packaging works (fast, no installer).

### Notes

- The portal URL (`https://portal.gfelektro.com`) must be reachable from the VM for the app to display content.
- `--no-sandbox` is required in the Cloud VM because the container runs as a non-root user without kernel namespace support.
- The build output lands in `release/linux-unpacked/` (for `--dir` mode) or `release/` (for full build).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
