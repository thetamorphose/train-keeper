# ADR 3: State Management Refactoring for TDD Support

## Status
Accepted

## Context
The project's TDD mandate required testing the complex logic of section and exercise management. However, `tk-focus.js` was implemented as a single IIFE with logic tightly coupled to DOM operations and private scope, making it impossible to import into Jest for unit testing.

## Decision
We decided to extract the core state mutation logic into a structured object called `tkLogic`. 
- This object contains functions that handle state changes (e.g., adding sections, deleting exercises with auto-removal of empty sections).
- These functions are designed to be "logic-heavy but DOM-free" (pure or near-pure) where possible.
- To allow testing without a module system (Vanilla JS), `tkLogic` is exposed as `window.__tkLogic` only in test/browser environments.
- Jest tests now use `jsdom` to evaluate the script and test `window.__tkLogic` directly.

## Consequences
- **Pros:**
  - Full testability of complex workout logic.
  - Faster development cycle (logic can be verified without manual UI clicking).
  - Cleaner separation of concerns between "State Change" and "Rendering".
- **Cons:**
  - Slight overhead in exposing internal objects to the global `window` scope for testing.
  - Requires `jest-environment-jsdom` dependency.
