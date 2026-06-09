# Dependency Log: Train Keeper

This document explains why specific libraries are included in the project.

## Production Dependencies

### `express`
- **Purpose:** Web server framework for Node.js.
- **Why:** Industry standard, lightweight, and handles routing/middleware efficiently.

### `cors`
- **Purpose:** Cross-Origin Resource Sharing.
- **Why:** Required to allow the mobile frontend (potentially on a different IP/Port during dev) to talk to the local backend.

### `lowdb`
- **Purpose:** Local JSON database.
- **Why:** Provides a simple, file-based persistence layer. Perfect for personal trackers and extremely easy for AI agents to parse/debug via `history.json`.

## Development Dependencies

### `jest`
- **Purpose:** Testing framework.
- **Why:** Essential for the TDD (Test-Driven Development) workflow mandated by the project rules.

### `babel` (Implicitly used in wireframes)
- **Purpose:** JSX Transpiler.
- **Why:** Allows writing declarative UI components (JSX) while maintaining a Vanilla JS codebase.
