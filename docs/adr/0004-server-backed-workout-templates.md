# ADR 0004: Server-Backed Workout Templates (Lists)

## Status
Accepted

## Context
Initially, Train Keeper supported only a single "draft" workout stored in the browser's `localStorage`. This limited users who wanted to maintain multiple workout routines (e.g., "Leg Day", "Push Day") and made it difficult to sync routines across different devices.

## Decision
We transitioned from a single local draft to a multi-template system backed by the LowDB server.

1.  **Backend Storage**: A new `templates` collection was added to the LowDB schema.
2.  **CRUD API**: Dedicated endpoints (`GET`, `POST`, `PUT`, `DELETE` under `/api/templates`) were implemented to manage workout templates.
3.  **Frontend Sync**: The application now fetches all templates on startup and synchronizes changes back to the server in real-time during the "Build" phase.
4.  **UI Redesign**: The Home screen was updated to prioritize "Workout Lists" (templates), allowing users to create, select, and manage multiple routines before starting a session.

## Consequences
- **Pros**: 
    - Users can now save and organize multiple workout routines.
    - Data is synchronized with the server, enabling multi-device usage.
    - Improved scalability for future features like "Template Library".
- **Cons**: 
    - Requires a server connection for creating/updating templates (offline support needed in future).
    - Slightly higher complexity in frontend state management.
