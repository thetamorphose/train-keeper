# Bug: skipped exercise does not count toward section completion

- **id:** bug-2026-10-21-001
- **status:** fixed (task-2026-10-21-005) — priority still owner-triaged
- **reported_by:** owner (Hermes session 20261021_153710_21176d, 2026-10-21)
- **related:** BACKLOG.md item «Bug: skipped exercise…», task-2026-10-21-004

## Symptom

In an active workout, marking an exercise as skipped («Пропущено») does not advance the
section progress counter: the section button stays on «Выполнено X из Y» and never becomes
«✓ Завершить тренировку». A workout containing a skipped exercise cannot be finished.
Long exercises (with sets) are affected as well: a fully skipped set tree does not count.

## Root cause (agent analysis, to be confirmed by fix)

`tk-focus.js:551`:

```js
const total = sec.ex.length, done = sec.ex.filter((e) => e.done).length;
```

counts only `e.done`. The section button at `tk-focus.js:594` requires `done >= total`,
so skipped exercises (`e.skipped === true`, `e.done === false`) keep the gate closed.
The dot indicators already use the correct predicate — `tk-focus.js:563`:
`s.ex.every((e) => e.done || e.skipped)` — so the two progress displays disagree.

For set-based exercises the derived flags live at `tk-focus.js:713-714`
(`ex.done = ex.sets.every(s => s.done || s.skipped)`), which sets `ex.skipped` but leaves
`ex.done` false when everything is skipped — consistent with the reported symptom.

## Resolution (task-2026-10-21-005, 2026-10-21)

Root cause confirmed as analyzed above. Fixed per owner decisions:
- new derived status per exercise (`tkLogic.exerciseStatus`): majority of sets done → done,
  strict majority skipped → skipped, tie of closed sets → done (optimistic), open sets → open;
- section counter/button use `tkLogic.sectionProgress`: «Выполнено X · пропущено Y из Z»;
- completion gate unlocks when every exercise is done or skipped (skipped does not block);
- both set-derivation call sites (set-toggle and long-press skip) now derive flags from the
  same majority rule instead of `every(done || skipped)`;
- long-press skip UX verified unchanged (works on cards without sets and on set rows).

Tests: `__tests__/skip-progress.test.js` (10 tests), full suite 59 passed.

## Suggested direction (not a decision)

Count `done || skipped` as completed in the section counter/button (aligning with the
dots predicate), or introduce an explicit completed-set. Severity: blocks workout
completion — likely high.
