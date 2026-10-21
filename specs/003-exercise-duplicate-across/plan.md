# Implementation Plan

## Architecture linkage (mandatory)

- Constitution sections: Architecture principle 5 (pure logic in `tkLogic` covered by Jest tests before UI integration)
- Related ADR(s): ADR-0006 (supporting domain; no Core Domain paths)
- Architecture docs touched (`docs/architecture/*`): none — no structural change (menu items + existing PUT endpoint)

## Core Domain check

- Touches Core Domain: no

## Technical decisions

| Decision | Record (ADR/AgDR) |
|---|---|
| Cross-list save via GET target → push clone → PUT whole `sections` (no new endpoint) | docs/agdr/0003-exercise-duplication-save.md |

## Approach

Pure logic: `tkLogic.cloneExercise(ex)` (deep clone, fresh ids for card/fields/sets, done/skipped
reset) and `tkLogic.addExerciseToSection(sections, si, clone)` (append to end). UI: the existing
exercise `.kmenu` gains «В секцию…» and «В тренировку…»; a `dupMode` variable turns the same menu
into a target picker (current sections / other lists / sections of the picked list, with a back
step). Same-workout duplication saves via `tkLogic.saveTemplate`; cross-list via GET+PUT on the
target template.

## Test strategy

- `__tests__/exercise-duplicate-across.test.js` (jsdom harness): clone freshness (new ids, no
  shared references, flags reset), append-to-end semantics, invalid section index rejected (AC 1, 3).
- Cross-list PUT path reuses the existing templates API tests (PUT merge semantics already covered).
- Run: `npm run test`.
