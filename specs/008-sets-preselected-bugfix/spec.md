# Bugfix (task-only flow)

## Symptom

At workout start, sets of any exercise with sets appear pre-selected (done) although the user has
not marked any set. Bug draft: `bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md`.

## Root cause (agent analysis, confirmed)

`startWorkout()` (tk-focus.js) resets `e.done/e.skipped` but not `set.done/set.skipped`;
`initSetsForExercise()` preserves existing `done` flags when the set count already matches.
Stale flags survive in the template/localStorage (e.g. template saved in active mode after sets
were marked, or state left from an unfinished previous workout).

## Fix

In `startWorkout()`, after `initSetsForExercise(e)`, reset every set: `set.done = false; set.skipped = false;`.
Regression test: mark sets done in build-mode state, run startWorkout, assert all sets are unchecked.

## Acceptance criteria

- [x] All sets start unchecked (done=false, skipped=false) at workout start regardless of stale flags
- [x] Regression test in __tests__/exercise-sets.test.js fails before the fix, passes after
- [x] npm run test green; validator green; progress regen; commit
