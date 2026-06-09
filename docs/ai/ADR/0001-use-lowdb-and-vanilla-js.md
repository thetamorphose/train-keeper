# ADR 1: Use LowDB and Vanilla JS/JSX for Initial Development

- **Status:** Accepted
- **Date:** 2024-05-23
- **Author:** Gemini CLI

## Context
We need a lightweight, fast-to-develop prototype that feels "mobile-first" and high-performance, while staying easy for AI agents to maintain and iterate upon without heavy framework overhead.

## Decision
1. **Backend:** Use `lowdb` (JSON-based) instead of a heavy SQL/NoSQL database.
2. **Frontend:** Use Vanilla JavaScript with JSX components (via Babel/Lite) for UI, avoiding complex state management libraries in the initial phase.

## Rationale
- **LowDB:** Allows for human-readable data (db.json) which is very easy for AI agents to parse, validate, and debug. No migrations or complex setup required.
- **Vanilla JS:** Minimizes bundle size and ensures high performance on mobile web. JSX provides the declarative power of React without the boilerplate.

## Consequences
- **Pros:** Zero-latency data access (local JSON), extremely fast dev cycles, high portability.
- **Cons:** Not suitable for massive datasets (100k+ entries) or complex multi-user concurrent writes (but perfect for a personal workout tracker).
