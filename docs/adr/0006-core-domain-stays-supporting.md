<!-- ADR records owner decisions and domain boundaries (Core Domain, contracts between contexts, business rules). The agent writes the document; the owner makes the decision. -->

# ADR-0006: Core Domain stays supporting - proposal rows rejected

## Status
accepted (owner decision 2026-10-21)

## Context

`propose_core.py` (run during the governance v0.4.0 migration, task-2026-10-21-001) produced `docs/core-proposals/2026-10-21-core-proposal.md` with one row: `__tests__` suggested as `likely-supporting` (generic/technical name pattern). The scanner only examines top-level directories, so the flat application modules (`server.js`, `tk-app.js`, `tk-focus.js`, `tk-*.css/jsx`) were not evaluated and no core candidate was derived from them.

## Options considered

1. Accept the `__tests__` row as Core Domain.
2. Reject the row; keep every module **supporting domain** until a deliberate promotion.
3. Manually promote application modules (e.g. `tk-focus.js`) to Core Domain now.

## Decision

**Option 2 - the owner rejected the proposal row.** `CORE.md` keeps "None declared": all current modules are **supporting domain**. Any future promotion to Core Domain happens through a separate ADR on the owner's initiative (with or without a new `propose_core.py` run).

The owner also confirmed the ubiquitous-language wording for **Set (подход)** as recorded in `docs/constitution.md`: an optional checkable subtask of an exercise; an exercise without sets behaves as a single task. This supersedes the "NO SETS" line of the pre-governance `.cursorrules`, which is corrected accordingly.

## Consequences

### Positive
- No Core Domain maintenance overhead while the product is at the prototype stage.
- The language contradiction between `.cursorrules` and `GEMINI.md`/code is resolved on the record.

### Negative
- Core-ness remains unclassified; if the project grows, a later `propose_core.py` run (or manual analysis covering top-level modules) is needed to find the real core.
