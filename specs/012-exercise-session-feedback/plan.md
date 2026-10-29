# Plan

## Architecture linkage

- `docs/constitution.md` — «Упражнение», «Тренировочная сессия».
- `docs/contexts/*.yml` — workout context (active card UI, summary, history).

## Approach

Data: `ex.sessionNote: string`, `ex.sessionRating: number (0..5, 0 = unset)` — transient per-session
fields on the exercise, serialized with sections (history carries them for free). UI: collapsed
feedback row on cards in active mode (one shared open-state id in module scope), textarea + emoji
buttons; input handler updates state; summary renders emoji + note under the exercise name;
startWorkout/closeSummary reset them.

## Steps

1. Data + reset: fields in state load migration, startWorkout/closeSummary reset, summary/history.
2. Card UI: collapsed «💬» row in active mode; textarea + emoji row; handlers.
3. Summary rendering: emoji + note per exercise.
4. Jest tests: render contract, rating set/reset, summary display.
5. Suite + validator green; progress regen; commit.
