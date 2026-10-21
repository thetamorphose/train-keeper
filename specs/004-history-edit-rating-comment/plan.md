# Implementation Plan

## Architecture linkage (mandatory)

- Constitution sections: Architecture principle 5 (pure logic tested before UI); principle 2 (one fact — one home: history lives in LowDB `history` collection)
- Related ADR(s): ADR-0006 (supporting domain)
- Architecture docs touched (`docs/architecture/*`): none — additive endpoint, no structural change

## Core Domain check

- Touches Core Domain: no

## Technical decisions

| Decision | Record (ADR/AgDR) |
|---|---|
| Stable ids for history entries (startup backfill + POST assignment) and partial update via `PUT /api/history/:id` | docs/agdr/0004-history-entry-ids.md |

## Approach

Server: on startup every history entry without an id gets `crypto.randomUUID()`; POST assigns
ids to new entries; `PUT /api/history/:id` merges only `wellBeingRating` (1–5 int) and
`comment` (string). UI: `viewhistory` remembers the entry index (`state.viewingHistoryIndex`);
in history view the rating buttons are enabled — a tap updates `state`, the history entry and
PUTs to the server; the comment `focusout` path, when in history view, syncs the comment the
same way. `render()` refreshes the ⭐ badge immediately.

## Test strategy

- `__tests__/history-api.test.js` (supertest): PUT updates rating/comment; 404 on unknown id;
  POST assigns an id (AC 1, 2, 3).
- `__tests__/wellbeing-edit.test.js` (jsdom): tapping a rating button in history view updates
  `state.history` entry; leaving the comment field syncs it; badge re-renders (AC 1, 2).
- Run: `npm run test`.
