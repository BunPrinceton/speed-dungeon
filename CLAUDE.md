# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Speed Dungeon is a multiplayer turn-based RPG with 3D graphics. Players cooperate or compete to race through dungeons. The codebase is a Yarn workspaces monorepo with three packages: `client` (Next.js + Babylon.js), `server` (Node.js + Express), and `common` (shared game logic).

## Commands

### Development
```bash
# Install all workspace dependencies
yarn install

# Build the common package (required before client/server can run)
cd packages/common && npx tsc

# Start the client (Next.js dev server on port 3000)
cd packages/client && yarn dev

# Start the server (tsc-watch with auto-restart on port 8080/8090)
cd packages/server && yarn serve

# Start infrastructure (PostgreSQL + Valkey)
docker compose up -d

# TypeScript watch (client)
cd packages/client && yarn checkTs
```

### Testing
```bash
# Root-level vitest (unit tests across all packages)
yarn test
yarn test:watch

# Server Jest tests
cd packages/server && yarn test

# Client E2E (two-user multiplayer test)
cd packages/client && yarn cypress:two-users
```

### Electron Desktop App
```bash
cd packages/client
npx electron electron/main.js          # Dev mode
yarn electron:build                     # Build macOS .dmg
```

### Database
```bash
cd packages/server && yarn migrate      # Run PostgreSQL migrations
```

## Architecture

### Package Dependency Graph
`client` and `server` both depend on `common` via `@speed-dungeon/common`. TypeScript project references enable incremental compilation. Always import from the package root (`@speed-dungeon/common`), never from internal paths — this is required for ESM `.js` extension resolution to work in both Node.js and Turbopack.

### Client State Management
The client uses MobX with `makeAutoObservable` (not Redux/Zustand). The root state object is `ClientApplication`, created once in `page.tsx` and passed via React context. It holds all stores:
- `gameContext` / `lobbyContext` — current game and lobby state
- `uiStore` — UI dialogs, connection status, inputs, tooltips
- `actionMenu` — menu navigation stack
- `combatantFocus` / `detailableEntityFocus` — targeting and inspection
- `eventLogStore` / `floatingMessagesStore` — combat log and floating text
- `gameClientRef` / `lobbyClientRef` — WebSocket client singletons

MobX stores use `mobx-store-inheritance` for `makeAutoObservable` on subclasses. Always use `autoBind: true` to prevent `this`-binding issues when methods are passed as callbacks.

### MobX Observable Safety Rule
**Never store React elements (JSX/ReactNode) in MobX observable state.** MobX wraps objects in Proxies for reactivity. React 19 attaches native `_debugTask` objects to elements in dev mode, and Chromium's native `Task.run()` method throws `'run' called with illegal receiver` when called through a Proxy. Store plain data in observables; render JSX in React components. See `TooltipStore` and `GameLogMessage` for the correct pattern using discriminated union data types.

### Client-Server Communication
WebSocket-based, abstracted behind `ConnectionEndpoint` (in `common/src/transport/`). Messages are JSON-serialized:
- Client → Server: `ClientIntent` (typed by `ClientIntentType`) via `BaseClient.dispatchIntent()`
- Server → Client: `GameStateUpdate` (typed by `GameStateUpdateType`, 80+ types)
- Updates are routed through handler records created by `createGameUpdateHandlers()` / `createLobbyUpdateHandlers()`

The client supports online mode (real WebSocket) and offline mode (in-memory endpoints) via `ConnectionTopology`.

### 3D Rendering
Babylon.js renders the game world via `GameWorldView`, which is optionally attached to `ClientApplication`. Key subsystems: `EnvironmentManager`, `SceneEntityManager`, `AnimationManager`, `HighlightManager`. Assets (`.gltf`/`.glb` models) are loaded from the server and cached in IndexedDB.

### Server Structure
Two servers run in a single process: `LobbyServerNode` (port 8080, HTTP + WebSocket) and `GameServerNode` (port 8090, WebSocket). PostgreSQL stores characters and profiles; Valkey caches the ranked ladder and sessions. Migrations via `node-pg-migrate`.

### Serialization
The codebase is migrating from static methods (old pattern: no deserialization, pass plain objects) to class-transformer (new pattern: full OOP with `initialize()` methods for circular references). Both patterns coexist.

## Common Errors

**TS5055 / missing modules / unknown types:** Delete `tsconfig.tsbuildinfo`, `dist/`, and `.next/` folders. May need `rm -rf node_modules && yarn install`.

**Module not found but IDE shows no error:** You're likely importing from an internal path like `@speed-dungeon/common/src/...`. Always import from the package root.

**"Class extends value undefined":** Circular import. Use direct path imports instead of importing from barrel `index.ts` files.

**3D objects not attaching to scene:** Pass the scene explicitly to Babylon.js constructors. Without it, objects attach to the most recently created scene (which may be the `ImageGenerator` scene).

## Environment

**Client** env vars are in `packages/client/.env.development` (NEXT_PUBLIC_* prefixed).
**Server** env vars are set in `docker-compose.yml` or a `.env` file in `packages/server/`. Required: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `VALKEY_URL`, `FRONT_END_URL`, `AUTH_SERVER_URL`, `INTERNAL_SERVICES_SECRET`, `NODE_ENV`.
