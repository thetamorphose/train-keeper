# Plan

## Architecture linkage

- `docs/constitution.md` — «Подход» (set), «Тренировочная сессия» lifecycle.
- `docs/contexts/*.yml` — workout context (session start transition).

## Approach

One-line root-cause fix in the build→active transition (see spec). Bugfix flows task-only per
SKILL.md step 4, but the validator requires a plan per spec directory — this file satisfies that
structure; the substance is in spec.md.

## Steps

- [x] Reset `set.done/set.skipped` in `startWorkout()` after `initSetsForExercise()`
- [x] Regression test in `__tests__/exercise-sets.test.js`
- [x] Suite + validator green; progress regen; commit
